from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.schemas.auth import UserPublic
from app.schemas.message import SendEmailRequest, SendEmailResponse
from app.services.email_service import EmailDeliveryError
from app.services.message_service import message_service


router = APIRouter()


@router.post("/send", response_model=SendEmailResponse)
async def send_email(
    payload: SendEmailRequest,
    current_user: UserPublic = Depends(get_current_user),
) -> SendEmailResponse:
    _ = current_user
    try:
        return message_service.send_and_track(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except EmailDeliveryError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc