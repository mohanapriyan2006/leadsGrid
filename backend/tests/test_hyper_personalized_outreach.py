import asyncio
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import create_app
from app.schemas.lead_analysis import HyperPersonalizedOutreachMetadata
from app.schemas.lead_analysis import HyperPersonalizedOutreachResponse
from app.services.ai_prompts_service import AIPromptsService


client = TestClient(create_app())


def test_generate_hyper_personalized_outreach_success() -> None:
    mocked_result = HyperPersonalizedOutreachResponse(
        message="Hi Sarah, I noticed your onboarding drop-off around week two. I would add an event-based reactivation flow with targeted in-app prompts and email nudges. I recently built a similar lifecycle flow for a SaaS product with strong retention lift. If helpful, I can share a quick rollout outline.",
        metadata=HyperPersonalizedOutreachMetadata(
            provider="gemini",
            personalization_score=0.91,
            compliance_score=0.93,
            word_count=49,
            within_word_limit=True,
            has_soft_cta=True,
            rewritten=False,
            violations=[],
            constraints_checked=["word_limit_80", "soft_cta"],
        ),
    )

    with patch(
        "app.api.routes.leads.ai_prompts_service.generate_hyper_personalized_outreach",
        new=AsyncMock(return_value=mocked_result),
    ):
        response = client.post(
            "/api/leads/generate-hyper-personalized-outreach",
            json={
                "lead_text": "We are losing users after trial and need better lifecycle messaging.",
                "pain_point": "Retention drops after week two.",
                "user_skills": ["SaaS", "Lifecycle automation", "Product analytics"],
                "portfolio_summary": "I build retention and onboarding systems for B2B SaaS teams.",
                "tone": "friendly",
            },
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["message"]
    assert payload["metadata"]["within_word_limit"] is True
    assert payload["metadata"]["personalization_score"] == 0.91


def test_generate_hyper_personalized_outreach_validation_failure() -> None:
    with patch(
        "app.api.routes.leads.ai_prompts_service.generate_hyper_personalized_outreach",
        new=AsyncMock(side_effect=ValueError("Generated outreach message is empty")),
    ):
        response = client.post(
            "/api/leads/generate-hyper-personalized-outreach",
            json={
                "lead_text": "Need help",
                "pain_point": "",
                "user_skills": [],
                "portfolio_summary": "short",
                "tone": "friendly",
            },
        )

    assert response.status_code == 422


def test_generate_hyper_personalized_outreach_provider_failure() -> None:
    with patch(
        "app.api.routes.leads.ai_prompts_service.generate_hyper_personalized_outreach",
        new=AsyncMock(side_effect=RuntimeError("All AI providers failed")),
    ):
        response = client.post(
            "/api/leads/generate-hyper-personalized-outreach",
            json={
                "lead_text": "Need to improve conversion funnel for enterprise demos.",
                "pain_point": "Low lead-to-demo conversion.",
                "user_skills": ["Funnel optimization"],
                "portfolio_summary": "I optimize conversion systems for B2B sales funnels.",
                "tone": "professional",
            },
        )

    assert response.status_code == 500


def test_generate_hyper_personalized_outreach_enforces_constraints() -> None:
    service = AIPromptsService()
    long_message = " ".join(["word"] * 120)

    with patch.object(
        service,
        "_call_gemini",
        new=AsyncMock(return_value=f'{{"message": "{long_message}", "personalization_score": 95, "has_soft_cta": false}}'),
    ):
        result = asyncio.run(service.generate_hyper_personalized_outreach(
            lead_text="Need a better lead qualification process.",
            pain_point="Lead scoring is noisy and inconsistent.",
            user_skills=["Python", "FastAPI"],
            portfolio_summary="Built lead intelligence systems for sales teams.",
            name="Alex",
            tone="direct",
        ))

    assert result.metadata.word_count <= 80
    assert result.metadata.within_word_limit is True
    assert 0.0 <= result.metadata.personalization_score <= 1.0
    assert 0.0 <= result.metadata.compliance_score <= 1.0


def test_generate_hyper_personalized_outreach_rewrite_pass() -> None:
    service = AIPromptsService()
    weak_message = "Dear Sir, I am interested in your project"
    improved_message = (
        "Hi Maya, your trial conversion drop suggests onboarding friction. I would implement event-based activation "
        "nudges tied to key product actions. I recently shipped this for a SaaS workflow team with measurable lift. "
        "If useful, I can share a quick rollout plan."
    )

    with patch.object(
        service,
        "_call_gemini",
        new=AsyncMock(side_effect=[
            f'{{"message": "{weak_message}", "personalization_score": 45, "has_soft_cta": false}}',
            f'{{"message": "{improved_message}", "personalization_score": 90, "has_soft_cta": true}}',
        ]),
    ):
        result = asyncio.run(service.generate_hyper_personalized_outreach(
            lead_text="Need to improve onboarding conversion.",
            pain_point="Low trial-to-paid conversion due to weak onboarding.",
            user_skills=["SaaS onboarding", "Lifecycle messaging"],
            portfolio_summary="Built onboarding systems that improved trial activation.",
            name="Maya",
            tone="friendly",
        ))

    assert result.metadata.rewritten is True
    assert result.metadata.word_count <= 80
    assert "Dear Sir" not in result.message
