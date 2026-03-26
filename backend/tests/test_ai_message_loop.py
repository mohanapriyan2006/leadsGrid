# pyright: reportMissingImports=false
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_message_generator_evaluator_loop_shape():
    payload = {
        "lead_context": "CTO said they are frustrated with robotic outbound and need CRM automation.",
        "tone": "professional",
        "max_words": 120,
    }

    response = client.post("/api/ai/message", json=payload)
    assert response.status_code == 200

    body = response.json()
    assert "message" in body
    assert "confidence" in body
    assert "provider" in body
    assert "evaluation" in body
