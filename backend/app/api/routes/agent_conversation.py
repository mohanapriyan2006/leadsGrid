from fastapi import APIRouter, Depends, Request

from app.core.security import UserContext, get_current_user
from app.schemas.agent_conversation import (
    AgentCancelRequest,
    AgentChatRequest,
    AgentChatResponse,
    AgentConfirmRequest,
)

router = APIRouter(prefix="/agent", tags=["agent-conversation"])


def _conversation_service_from_request(request: Request):
    return request.app.state.agent_conversation_service


@router.post("/chat", response_model=AgentChatResponse)
async def agent_chat(
    payload: AgentChatRequest,
    request: Request,
    user: UserContext = Depends(get_current_user),
) -> AgentChatResponse:
    service = _conversation_service_from_request(request)
    return await service.chat(payload, user.user_id)


@router.post("/chat/confirm", response_model=AgentChatResponse)
async def agent_confirm(
    payload: AgentConfirmRequest,
    request: Request,
    user: UserContext = Depends(get_current_user),
) -> AgentChatResponse:
    service = _conversation_service_from_request(request)
    return await service.chat(
        AgentChatRequest(
            message="",
            session_id=payload.session_id,
            confirmed_action={"action": payload.action_id},
        ),
        user.user_id,
    )


@router.post("/chat/cancel", response_model=AgentChatResponse)
async def agent_cancel(
    payload: AgentCancelRequest,
    request: Request,
    user: UserContext = Depends(get_current_user),
) -> AgentChatResponse:
    service = _conversation_service_from_request(request)
    return await service.chat(
        AgentChatRequest(
            message="",
            session_id=payload.session_id,
            confirmed_action={"action": "cancel"},
        ),
        user.user_id,
    )
