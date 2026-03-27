# pyright: reportMissingImports=false
from fastapi.testclient import TestClient

from app.main import app
from app.repositories.manage_lead_repository import manage_lead_repository
from app.repositories.message_repository import message_repository
from app.schemas.lead import LeadListFilters
from app.services.email_service import EmailDeliveryError
from app.services.manage_lead_service import manage_lead_service


client = TestClient(app)


def _get_seed_lead_id() -> str:
    manage_lead_service.ensure_seed_data()
    leads = manage_lead_service.list_leads(LeadListFilters())
    assert leads, "Expected seeded manage leads"
    return leads[0].id


def test_send_email_success_persists_and_moves_stage(monkeypatch):
    lead_id = _get_seed_lead_id()
    row = manage_lead_repository.get_lead(lead_id)
    assert row is not None
    row.stage = "NEW"
    manage_lead_repository.upsert_lead(row)

    def _fake_send_email(to_email: str, subject: str, body: str) -> None:
        assert to_email
        assert subject
        assert body

    monkeypatch.setattr("app.services.email_service.email_service.send_email", _fake_send_email)

    payload = {
        "to": "client@example.com",
        "subject": "Regarding your project",
        "message": "Hi there, sharing a short outreach message.",
        "lead_id": lead_id,
    }

    response = client.post("/api/messages/send", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert body["lead_id"] == lead_id
    assert body["to"] == payload["to"]

    updated = manage_lead_repository.get_lead(lead_id)
    assert updated is not None
    assert updated.stage == "CONTACTED"

    entries = message_repository.list_by_lead(lead_id)
    assert entries
    latest = entries[0]
    assert latest.email == payload["to"]
    assert latest.subject == payload["subject"]
    assert latest.status == "sent"


def test_send_email_failure_returns_502_and_tracks_failed(monkeypatch):
    lead_id = _get_seed_lead_id()

    def _raise_send_error(to_email: str, subject: str, body: str) -> None:
        raise EmailDeliveryError("smtp down")

    monkeypatch.setattr("app.services.email_service.email_service.send_email", _raise_send_error)

    payload = {
        "to": "fail@example.com",
        "subject": "Subject",
        "message": "Message",
        "lead_id": lead_id,
    }

    response = client.post("/api/messages/send", json=payload)
    assert response.status_code == 502

    entries = message_repository.list_by_lead(lead_id)
    assert entries
    assert entries[0].status == "failed"


def test_send_email_unknown_lead_returns_404(monkeypatch):
    monkeypatch.setattr("app.services.email_service.email_service.send_email", lambda *_: None)

    payload = {
        "to": "client@example.com",
        "subject": "Subject",
        "message": "Message",
        "lead_id": "missing-lead-id",
    }

    response = client.post("/api/messages/send", json=payload)
    assert response.status_code == 404
