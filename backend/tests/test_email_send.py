from fastapi.testclient import TestClient

from app.main import create_app


client = TestClient(create_app())


def test_send_email_endpoint_simulated_provider_when_not_configured() -> None:
    response = client.post(
        "/api/email/send",
        json={
            "to": "lead@example.com",
            "subject": "Partnership idea",
            "message": "Hi there, we can help improve conversion.",
            "lead_id": "lead-123",
            "sender_name": "Mohan",
            "reply_to": "mohan@gmail.com",
            "custom_args": {"campaign": "spring"},
        },
        headers={
            "x-user-id": "local-user",
            "x-user-email": "mohan@gmail.com",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["lead_id"] == "lead-123"
    assert payload["provider"] in {"smtp-disabled", "smtp"}
    assert payload["status"] in {"simulated", "sent"}


def test_send_email_endpoint_rejects_invalid_recipient() -> None:
    response = client.post(
        "/api/email/send",
        json={
            "to": "invalid-recipient",
            "subject": "Bad recipient",
            "message": "hello",
            "lead_id": "lead-124",
        },
        headers={"x-user-id": "local-user"},
    )

    assert response.status_code == 422
