# pyright: reportMissingImports=false
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_discover_leads_pipeline():
    response = client.get(
        "/api/leads/discover",
        params={"query": "need crm automation", "source": "reddit", "limit": 3},
    )
    assert response.status_code == 200

    leads = response.json()
    assert len(leads) <= 3
    assert all("score" in lead for lead in leads)
    assert all("intent_label" in lead for lead in leads)
