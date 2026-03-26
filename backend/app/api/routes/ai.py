from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.schemas.ai import (
    LeadScoringRequest,
    LeadScoringResponse,
    MessageGenerationRequest,
    MessageGenerationResponse,
)
from app.schemas.auth import UserPublic
from app.services.ai_service import ai_service
from app.services.message_service import message_service


router = APIRouter()


@router.post("/message", response_model=MessageGenerationResponse)
async def generate_message(
    payload: MessageGenerationRequest,
    current_user: UserPublic = Depends(get_current_user),
) -> MessageGenerationResponse:
    return await message_service.generate_outreach(payload)


@router.post("/score", response_model=LeadScoringResponse)
async def score_lead(
    payload: LeadScoringRequest,
    current_user: UserPublic = Depends(get_current_user),
) -> LeadScoringResponse:
    return await ai_service.classify_and_score(payload.content)
