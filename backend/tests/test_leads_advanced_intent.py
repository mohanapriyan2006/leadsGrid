from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import create_app
from app.schemas.lead_analysis import AdvancedLeadIntentScore
from app.services.ai_prompts_service import AIPromptsService


client = TestClient(create_app())


def test_analyze_advanced_intent_endpoint_success() -> None:
    mocked_result = AdvancedLeadIntentScore(
        score=88,
        urgency="high",
        buying_signals=["hiring intent", "deadline pressure"],
        decision_maker="yes",
        pain_point="Needs a reliable developer this week for client delivery.",
        category="hiring",
        status="qualified",
    )

    with patch(
        "app.api.routes.leads.ai_prompts_service.analyze_advanced_intent",
        new=AsyncMock(return_value=mocked_result),
    ):
        response = client.post(
            "/api/leads/analyze-advanced-intent",
            json={"lead_text": "Need to hire a full-stack developer urgently"},
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["score"] == 88
    assert payload["urgency"] == "high"
    assert payload["decision_maker"] == "yes"
    assert payload["status"] == "qualified"


def test_analyze_advanced_intent_endpoint_validation_failure() -> None:
    with patch(
        "app.api.routes.leads.ai_prompts_service.analyze_advanced_intent",
        new=AsyncMock(side_effect=ValueError("AI response missing required keys: status")),
    ):
        response = client.post(
            "/api/leads/analyze-advanced-intent",
            json={"lead_text": "Can someone recommend dev tools?"},
        )

    assert response.status_code == 422
    assert "failed validation" in response.json()["detail"]


def test_analyze_advanced_intent_endpoint_provider_failure() -> None:
    with patch(
        "app.api.routes.leads.ai_prompts_service.analyze_advanced_intent",
        new=AsyncMock(side_effect=RuntimeError("All AI providers failed")),
    ):
        response = client.post(
            "/api/leads/analyze-advanced-intent",
            json={"lead_text": "Need help soon"},
        )

    assert response.status_code == 500


def test_extract_json_strict_rejects_invalid_json() -> None:
    service = AIPromptsService()

    try:
        service._extract_json_strict("not-json", required_keys={"score"})
        assert False, "Expected strict parser to fail on invalid JSON"
    except ValueError as exc:
        assert "not valid JSON" in str(exc)


def test_extract_json_strict_rejects_missing_keys() -> None:
    service = AIPromptsService()

    try:
        service._extract_json_strict('{"score": 90}', required_keys={"score", "status"})
        assert False, "Expected strict parser to fail on missing keys"
    except ValueError as exc:
        assert "missing required keys" in str(exc)
