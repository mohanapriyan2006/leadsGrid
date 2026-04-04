from fastapi import APIRouter, Depends, Query, Request

from app.core.security import UserContext, get_current_user
from app.schemas.agent import (
    AgentActionResult,
    AgentRunAdvanceRequest,
    AgentExecuteRequest,
    AgentPlanResponse,
    AgentPlanRequest,
    AgentRunRequest,
    AgentRunResponse,
    AgentRunStartRequest,
    AgentRunStateResponse,
    LeadItem,
)

router = APIRouter(prefix="/agent", tags=["agent"])


def _executor_from_request(request: Request):
    return request.app.state.agent_executor


def _aggregator_from_request(request: Request):
    return request.app.state.lead_aggregator


def _run_service_from_request(request: Request):
    return request.app.state.agent_run_service


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


@router.post("/runs/start", response_model=AgentRunStateResponse)
async def start_run(
    payload: AgentRunStartRequest,
    request: Request,
    user: UserContext = Depends(get_current_user),
) -> AgentRunStateResponse:
    run_service = _run_service_from_request(request)
    user_id = payload.userId or user.user_id

    run_state = await run_service.start_run(
        prompt=payload.prompt,
        leads=payload.leads,
        tone=payload.tone,
        user_id=user_id,
        auto_save=payload.autoSave,
        approval_mode=payload.approvalMode,
        auto_approve_low_risk=payload.autoApproveLowRisk,
    )
    return AgentRunStateResponse(run=run_state)


@router.get("/runs/{run_id}", response_model=AgentRunStateResponse)
async def get_run_status(
    run_id: str,
    request: Request,
    user: UserContext = Depends(get_current_user),
) -> AgentRunStateResponse:
    run_service = _run_service_from_request(request)
    run_state = run_service.get_run(run_id, user.user_id)
    return AgentRunStateResponse(run=run_state)


@router.post("/runs/{run_id}/approve", response_model=AgentRunStateResponse)
async def approve_next_step(
    run_id: str,
    request: Request,
    payload: AgentRunAdvanceRequest,
    user: UserContext = Depends(get_current_user),
) -> AgentRunStateResponse:
    run_service = _run_service_from_request(request)
    run_state = await run_service.approve_next_step(
        run_id=run_id,
        user_id=user.user_id,
        auto_approve_low_risk=payload.autoApproveLowRisk,
    )
    return AgentRunStateResponse(run=run_state)


@router.post("/runs/{run_id}/skip", response_model=AgentRunStateResponse)
async def skip_next_step(
    run_id: str,
    request: Request,
    payload: AgentRunAdvanceRequest,
    user: UserContext = Depends(get_current_user),
) -> AgentRunStateResponse:
    run_service = _run_service_from_request(request)
    run_state = await run_service.skip_next_step(
        run_id=run_id,
        user_id=user.user_id,
        auto_approve_low_risk=payload.autoApproveLowRisk,
    )
    return AgentRunStateResponse(run=run_state)


@router.post("/runs/{run_id}/abort", response_model=AgentRunStateResponse)
async def abort_run(
    run_id: str,
    request: Request,
    user: UserContext = Depends(get_current_user),
) -> AgentRunStateResponse:
    run_service = _run_service_from_request(request)
    run_state = run_service.abort_run(run_id, user.user_id)
    return AgentRunStateResponse(run=run_state)


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
