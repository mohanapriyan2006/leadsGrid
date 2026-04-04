from fastapi import APIRouter, Depends, Query, Request

from app.core.security import UserContext, get_current_user
from app.schemas.agent import (
    AgentActionResult,
    AgentExecuteRequest,
    AgentPlanResponse,
    AgentPlanRequest,
    AgentRunRequest,
    AgentRunResponse,
    LeadItem,
)

router = APIRouter(prefix="/agent", tags=["agent"])


def _executor_from_request(request: Request):
    return request.app.state.agent_executor


def _aggregator_from_request(request: Request):
    return request.app.state.lead_aggregator


@router.post("/plan", response_model=AgentPlanResponse)
async def create_plan(
    payload: AgentPlanRequest,
    request: Request,
    user: UserContext = Depends(get_current_user),
) -> AgentPlanResponse:
    _ = user  # Reserved for scoped planning/audit.
    executor = _executor_from_request(request)
    plan = await executor.build_plan(payload.prompt, payload.leads)
    return AgentPlanResponse(plan=plan)


@router.post("/execute", response_model=AgentActionResult)
async def execute_step(
    payload: AgentExecuteRequest,
    request: Request,
    user: UserContext = Depends(get_current_user),
) -> AgentActionResult:
    executor = _executor_from_request(request)
    user_id = payload.userId or user.user_id

    return await executor.execute_step(
        payload.step,
        payload.prompt,
        payload.leads,
        payload.tone,
        user_id,
        payload.autoSave,
    )


@router.post("/run", response_model=AgentRunResponse)
async def run_agent(
    payload: AgentRunRequest,
    request: Request,
    user: UserContext = Depends(get_current_user),
) -> AgentRunResponse:
    executor = _executor_from_request(request)
    user_id = payload.userId or user.user_id

    return await executor.run_plan(
        prompt=payload.prompt,
        leads=payload.leads,
        tone=payload.tone,
        user_id=user_id,
        auto_save=payload.autoSave,
    )


@router.get("/discover", response_model=list[LeadItem])
async def discover(
    request: Request,
    query: str = Query(min_length=3),
    limit: int = Query(default=10, ge=1, le=30),
    user: UserContext = Depends(get_current_user),
) -> list[LeadItem]:
    _ = user  # Reserved for per-user rate limiting and quota handling.
    aggregator = _aggregator_from_request(request)
    leads = await aggregator.discover(query)
    return [LeadItem(**lead) for lead in leads[:limit]]
