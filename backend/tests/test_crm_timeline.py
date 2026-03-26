# pyright: reportMissingImports=false
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_crm_status_timeline_updates():
    lead_id = "lead-test-001"

    first_update = client.put(
        f"/api/crm/{lead_id}",
        json={"status": "NEW", "note": "Initial capture"},
    )
    assert first_update.status_code == 200

    second_update = client.put(
        f"/api/crm/{lead_id}",
        json={"status": "CONTACTED", "note": "Sent first outreach"},
    )
    assert second_update.status_code == 200

    record = second_update.json()
    assert record["status"] == "CONTACTED"
    assert len(record["history"]) >= 2
