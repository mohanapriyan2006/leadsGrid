from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.dependencies import get_current_user
from app.schemas.auth import UserPublic
from app.schemas.lead import (
    AutomationRunResult,
    LeadActionRequest,
    LeadListFilters,
    LeadManageSource,
    LeadStage,
    LeadUpdateRequest,
    LeadUrgency,
    ManageLead,
    ManageLeadActivity,
    ManageLeadAnalytics,
    ManageLeadInsights,
)
from app.services.manage_lead_service import manage_lead_service


router = APIRouter()


@router.get("", response_model=list[ManageLead])
def list_manage_leads(
    query: str | None = None,
    stage: LeadStage | None = None,
    source: LeadManageSource | None = None,
    min_score: int = Query(default=0, ge=0, le=100),
    only_hot: bool = False,
    only_cold: bool = False,
    urgency: LeadUrgency | None = None,
    sort_by: str = "score",
    current_user: UserPublic = Depends(get_current_user),
) -> list[ManageLead]:
    filters = LeadListFilters(
        query=query,
        stage=stage,
        source=source,
        min_score=min_score,
        only_hot=only_hot,
        only_cold=only_cold,
        urgency=urgency,
        sort_by=sort_by if sort_by in {"score", "urgency", "last_activity", "probability"} else "score",
    )
    return manage_lead_service.list_leads(filters)


@router.get("/insights", response_model=ManageLeadInsights)
def get_insights(current_user: UserPublic = Depends(get_current_user)) -> ManageLeadInsights:
    return manage_lead_service.get_insights()


@router.get("/analytics", response_model=ManageLeadAnalytics)
def get_analytics(current_user: UserPublic = Depends(get_current_user)) -> ManageLeadAnalytics:
    return manage_lead_service.get_analytics()


@router.post("/automation/run", response_model=AutomationRunResult)
def run_automation(current_user: UserPublic = Depends(get_current_user)) -> AutomationRunResult:
    return manage_lead_service.run_automations()


@router.get("/{lead_id}", response_model=ManageLead)
def get_lead(
    lead_id: str,
    current_user: UserPublic = Depends(get_current_user),
) -> ManageLead:
    lead = manage_lead_service.get_lead(lead_id)
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.patch("/{lead_id}", response_model=ManageLead)
def update_lead(
    lead_id: str,
    payload: LeadUpdateRequest,
    current_user: UserPublic = Depends(get_current_user),
) -> ManageLead:
    lead = manage_lead_service.update_lead(lead_id, payload)
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.post("/{lead_id}/actions", response_model=ManageLead)
def lead_action(
    lead_id: str,
    payload: LeadActionRequest,
    current_user: UserPublic = Depends(get_current_user),
) -> ManageLead:
    lead = manage_lead_service.perform_action(lead_id, payload)
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.get("/{lead_id}/timeline", response_model=list[ManageLeadActivity])
def lead_timeline(
    lead_id: str,
    current_user: UserPublic = Depends(get_current_user),
) -> list[ManageLeadActivity]:
    return manage_lead_service.get_timeline(lead_id)
