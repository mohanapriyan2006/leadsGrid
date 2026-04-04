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


def test_agent_run_step_by_step_lifecycle() -> None:
    start_response = client.post(
        "/api/agent/runs/start",
        json={
            "prompt": "Find saas leads and score them",
            "leads": [],
            "tone": "professional",
            "approvalMode": "step_by_step",
            "autoApproveLowRisk": True,
            "autoSave": False,
        },
    )
    assert start_response.status_code == 200

    run_payload = start_response.json()["run"]
    assert run_payload["status"] == "paused"
    assert run_payload["currentStepIndex"] >= 2

    run_id = run_payload["runId"]
    get_response = client.get(f"/api/agent/runs/{run_id}")
    assert get_response.status_code == 200
    assert get_response.json()["run"]["status"] == "paused"

    approve_response = client.post(
        f"/api/agent/runs/{run_id}/approve",
        json={"autoApproveLowRisk": True},
    )
    assert approve_response.status_code == 200
    approved_run = approve_response.json()["run"]
    assert approved_run["status"] == "completed"
    assert approved_run["completedSteps"] == approved_run["totalSteps"]


def test_agent_run_skip_endpoint_advances_flow() -> None:
    start_response = client.post(
        "/api/agent/runs/start",
        json={
            "prompt": "Find leads and send outreach",
            "leads": [],
            "tone": "professional",
            "approvalMode": "step_by_step",
            "autoApproveLowRisk": True,
            "autoSave": False,
        },
    )
    assert start_response.status_code == 200

    run_id = start_response.json()["run"]["runId"]
    skip_response = client.post(
        f"/api/agent/runs/{run_id}/skip",
        json={"autoApproveLowRisk": True},
    )
    assert skip_response.status_code == 200
    skipped = skip_response.json()["run"]
    assert skipped["status"] in {"paused", "completed"}
