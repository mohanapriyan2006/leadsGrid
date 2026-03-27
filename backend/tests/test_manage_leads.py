# pyright: reportMissingImports=false
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_manage_leads_list_and_insights():
    list_response = client.get("/api/leads/manage")
    assert list_response.status_code == 200

    leads = list_response.json()
    assert len(leads) >= 1
    assert "stage" in leads[0]
    assert "ai_analysis" in leads[0]

    insights_response = client.get("/api/leads/manage/insights")
    assert insights_response.status_code == 200
    insights = insights_response.json()
    assert "hot_leads_need_reply" in insights
    assert "leads_going_cold" in insights
    assert "leads_likely_to_close" in insights


def test_manage_lead_action_timeline_and_analytics():
    leads_response = client.get("/api/leads/manage")
    lead_id = leads_response.json()[0]["id"]

    action_response = client.post(
        f"/api/leads/manage/{lead_id}/actions",
        json={"action_type": "SEND_FOLLOW_UP", "note": "Prompted follow-up"},
    )
    assert action_response.status_code == 200

    timeline_response = client.get(f"/api/leads/manage/{lead_id}/timeline")
    assert timeline_response.status_code == 200
    timeline = timeline_response.json()
    assert any(item["activity_type"] == "SEND_FOLLOW_UP" for item in timeline)

    analytics_response = client.get("/api/leads/manage/analytics")
    assert analytics_response.status_code == 200
    analytics = analytics_response.json()
    assert "conversion_rate" in analytics
    assert "pipeline_value" in analytics


def test_manage_leads_automation_run():
    response = client.post("/api/leads/manage/automation/run")
    assert response.status_code == 200
    payload = response.json()
    assert "reminders_due" in payload
    assert "follow_ups_generated" in payload
    assert "leads_marked_cold" in payload
