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
    assert leads[0]["stage"] in {"NEW", "QUALIFIED", "CONTACTED", "RESPONDED", "CONTRACTED"}

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
    assert "contracted_count" in analytics


def test_manage_lead_put_alias_updates_fields():
    leads_response = client.get("/api/leads/manage")
    lead = leads_response.json()[0]
    lead_id = lead["id"]

    response = client.put(
        f"/api/leads/manage/{lead_id}",
        json={
            "name": "Updated Lead Name",
            "company": "Updated Company",
            "stage": "QUALIFIED",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["name"] == "Updated Lead Name"
    assert payload["company"] == "Updated Company"
    assert payload["stage"] == "QUALIFIED"


def test_manage_leads_automation_run():
    response = client.post("/api/leads/manage/automation/run")
    assert response.status_code == 200
    payload = response.json()
    assert "reminders_due" in payload
    assert "follow_ups_generated" in payload
    assert "leads_marked_cold" in payload


def test_bin_soft_delete_restore_and_delete_forever():
    leads_response = client.get("/api/leads/manage")
    lead_id = leads_response.json()[0]["id"]

    delete_response = client.delete(f"/api/leads/manage/{lead_id}")
    assert delete_response.status_code == 200

    bin_response = client.get("/api/leads/manage/bin")
    assert bin_response.status_code == 200
    assert any(item["id"] == lead_id for item in bin_response.json())

    restore_response = client.post(f"/api/leads/manage/bin/{lead_id}/restore")
    assert restore_response.status_code == 200

    delete_again = client.delete(f"/api/leads/manage/{lead_id}")
    assert delete_again.status_code == 200
    delete_forever = client.delete(f"/api/leads/manage/bin/{lead_id}")
    assert delete_forever.status_code == 200


def test_csv_import_with_normalized_columns():
    csv_data = (
        "business_name,company_name,mail,phone_number,status,ai_score,budget,last_activity\n"
        "Aria Homes,Aria Homes Pvt Ltd,aria@example.com,+91-9988776655,responded,83,15000,2026-03-25\n"
    )
    response = client.post(
        "/api/leads/import-csv",
        files={"file": ("leads.csv", csv_data, "text/csv")},
        data={"field_mapping": "{}"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["accepted"] + payload["skipped"] >= 1
