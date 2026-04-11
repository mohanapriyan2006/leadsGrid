from fastapi import APIRouter, Request

from app.schemas.health import HealthResponse, ReadinessResponse

router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=HealthResponse)
async def health(request: Request) -> HealthResponse:
    settings = request.app.state.settings
    return HealthResponse(status="ok", service=settings.app_name)


@router.get("/ready", response_model=ReadinessResponse)
async def readiness(request: Request) -> ReadinessResponse:
    settings = request.app.state.settings
    firebase_client = request.app.state.firebase_client
    email_service = request.app.state.email_service

    return ReadinessResponse(
        status="ready",
        firebaseEnabled=firebase_client.enabled,
        smtpEnabled=email_service.enabled,
        environment=settings.environment,
    )
