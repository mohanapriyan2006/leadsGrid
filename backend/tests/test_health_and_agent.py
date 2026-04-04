from fastapi.testclient import TestClient

from app.main import create_app


client = TestClient(create_app())


def test_health_endpoint() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"


def test_agent_plan_endpoint_returns_steps() -> None:
    response = client.post(
        "/api/agent/plan",
        json={
            "prompt": "Find saas leads and score them",
            "leads": [],
        },
    )
    assert response.status_code == 200

    payload = response.json()
    assert "plan" in payload
    assert len(payload["plan"]["steps"]) >= 2
