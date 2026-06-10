from fastapi import APIRouter, BackgroundTasks, HTTPException, Request
from pydantic import BaseModel, ValidationError

from app.schemas.lead_analysis import AdvancedLeadIntentScore
from app.schemas.lead_analysis import HyperPersonalizedOutreachRequest
from app.schemas.lead_analysis import HyperPersonalizedOutreachResponse
from app.schemas.lead_discovery import DiscoverAsyncResponse, RawSignalInput
from app.services.ai_prompts_service import ai_prompts_service
from app.services.discovery_engine.models import RawSignal
from app.services.discovery_engine.opportunity_scorer import score_opportunity
from app.services.discovery_engine.signal_classifier import classify_signal

router = APIRouter(prefix="/leads", tags=["leads"])


class AnalyzeLeadRequest(BaseModel):
    lead_text: str
    lead_title: str = ""
    lead_author: str = ""
    score: int = 0


class AnalyzeLeadResponse(BaseModel):
    intent: dict
    validation: dict
    outreach: dict
    follow_up: dict
    action: dict
    portfolio_match: dict | None


def get_firebase_client(request: Request):
    return request.app.state.firebase_client


@router.post("/analyze", response_model=AnalyzeLeadResponse)
async def analyze_lead(
    body: AnalyzeLeadRequest,
    request: Request,
) -> AnalyzeLeadResponse:
    try:
        firebase_client = get_firebase_client(request)

        user_projects = []
        try:
            user_projects = firebase_client.get_user_projects(
                request.headers.get("x-user-id", ""),
                take=100,
            )
        except Exception:
            pass

        lead_text = f"{body.lead_title} {body.lead_text}".strip()

        result = await ai_prompts_service.full_analysis(
            lead_text=lead_text,
            user_projects=user_projects,
            score=body.score,
            name=body.lead_author or "there",
        )

        return AnalyzeLeadResponse(
            intent=result["intent"].model_dump(),
            validation=result["validation"].model_dump(),
            outreach=result["outreach"].model_dump(),
            follow_up=result["follow_up"].model_dump(),
            action=result["action"].model_dump(),
            portfolio_match=result["portfolio_match"].model_dump() if result["portfolio_match"] else None,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/analyze-intent")
async def analyze_intent_only(body: AnalyzeLeadRequest) -> dict:
    lead_text = f"{body.lead_title} {body.lead_text}".strip()
    try:
        intent = await ai_prompts_service.analyze_intent(lead_text)
        return intent.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Intent analysis failed: {str(e)}")


@router.post("/analyze-advanced-intent", response_model=AdvancedLeadIntentScore)
async def analyze_advanced_intent(body: AnalyzeLeadRequest) -> AdvancedLeadIntentScore:
    lead_text = f"{body.lead_title} {body.lead_text}".strip()
    try:
        signal = RawSignal(
            source="manual",
            source_type="manual",
            title=body.lead_title,
            content=lead_text,
            author=body.lead_author or "Unknown",
        )
        classification = classify_signal(signal)
        scores = score_opportunity(signal, classification)
        return AdvancedLeadIntentScore(
            score=scores["opportunity_score"],
            urgency="high" if scores["priority"] in {"CRITICAL", "HOT", "HIGH"} else ("medium" if scores["priority"] == "MEDIUM" else "low"),
            buying_signals=classification.get("has_budget_signal", False) and ["Budget signal detected"] or [],
            decision_maker="yes" if classification.get("authority_level") in {"Founder", "CEO", "CTO"} else "unknown",
            pain_point=signal.content[:200] if signal.content else "",
            details=classification.get("lead_category", "UNKNOWN"),
            category="hiring" if classification.get("lead_category") in {"HIRING_NOW", "SERVICE_NEEDED"} else (
                "switching" if classification.get("lead_category") == "TOOL_SWITCHING" else (
                    "problem" if classification.get("lead_category") == "OPERATIONAL_PAIN" else "discussion"
                )
            ),
            status="qualified" if scores["opportunity_score"] >= 60 and classification.get("is_actionable") else "unqualified",
        )
    except (ValueError, ValidationError) as e:
        raise HTTPException(status_code=422, detail=f"Advanced intent analysis failed validation: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Advanced intent analysis failed: {str(e)}")


@router.post("/validate")
async def validate_lead_only(body: AnalyzeLeadRequest) -> dict:
    lead_text = f"{body.lead_title} {body.lead_text}".strip()
    try:
        validation = await ai_prompts_service.validate_lead(lead_text)
        return validation.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")


@router.post("/generate-outreach")
async def generate_outreach(body: AnalyzeLeadRequest) -> dict:
    lead_text = f"{body.lead_title} {body.lead_text}".strip()
    try:
        intent = await ai_prompts_service.analyze_intent(lead_text)
        outreach = await ai_prompts_service.generate_outreach(
            lead_text=lead_text,
            pain_point=intent.pain_point,
            name=body.lead_author or "there",
        )
        return outreach.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Outreach generation failed: {str(e)}")


@router.post("/generate-hyper-personalized-outreach", response_model=HyperPersonalizedOutreachResponse)
async def generate_hyper_personalized_outreach(
    body: HyperPersonalizedOutreachRequest,
) -> HyperPersonalizedOutreachResponse:
    lead_text = f"{body.lead_title} {body.lead_text}".strip()

    try:
        return await ai_prompts_service.generate_hyper_personalized_outreach(
            lead_text=lead_text,
            pain_point=body.pain_point,
            user_skills=body.user_skills,
            portfolio_summary=body.portfolio_summary,
            name=body.lead_author or "there",
            tone=body.tone,
        )
    except (ValueError, ValidationError) as e:
        raise HTTPException(status_code=422, detail=f"Hyper-personalized outreach failed validation: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hyper-personalized outreach failed: {str(e)}")


@router.post("/suggest-action")
async def suggest_action(body: AnalyzeLeadRequest) -> dict:
    lead_text = f"{body.lead_title} {body.lead_text}".strip()
    try:
        action = await ai_prompts_service.suggest_action(lead_text, body.score)
        return action.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Action suggestion failed: {str(e)}")


@router.post("/discover-async", response_model=DiscoverAsyncResponse)
async def discover_new_lead_signal(
    payload: RawSignalInput,
    background_tasks: BackgroundTasks,
) -> DiscoverAsyncResponse:
    """
    Accepts raw scraped data from cron scripts/scrapers instantly,
    offloads processing to background tasks to maintain rapid responses.
    """
    async def _process_signal():
        signal = RawSignal(**payload.model_dump())
        classify_signal(signal)
        score_opportunity(signal, classify_signal(signal))

    background_tasks.add_task(_process_signal)
    return DiscoverAsyncResponse(status="queued", message="Signal pipeline processing started concurrently.")
