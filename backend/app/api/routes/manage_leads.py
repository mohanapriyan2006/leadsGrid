import json

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile

from app.core.dependencies import get_current_user
from app.schemas.auth import UserPublic
from app.schemas.lead import (
    AutomationRunResult,
    BinLead,
    BulkLeadActionRequest,
    CreateLeadRequest,
    CSVImportResult,
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


@router.post("", response_model=ManageLead)
def create_manage_lead(
    payload: CreateLeadRequest,
    current_user: UserPublic = Depends(get_current_user),
) -> ManageLead:
    return manage_lead_service.create_lead(payload)


@router.get("/insights", response_model=ManageLeadInsights)
def get_insights(current_user: UserPublic = Depends(get_current_user)) -> ManageLeadInsights:
    return manage_lead_service.get_insights()


@router.get("/analytics", response_model=ManageLeadAnalytics)
def get_analytics(current_user: UserPublic = Depends(get_current_user)) -> ManageLeadAnalytics:
    return manage_lead_service.get_analytics()


@router.post("/automation/run", response_model=AutomationRunResult)
def run_automation(current_user: UserPublic = Depends(get_current_user)) -> AutomationRunResult:
    return manage_lead_service.run_automations()


@router.post("/bulk", response_model=dict[str, int])
def bulk_action(
    payload: BulkLeadActionRequest,
    current_user: UserPublic = Depends(get_current_user),
) -> dict[str, int]:
    updated = manage_lead_service.bulk_action(payload)
    return {"updated": updated}


@router.post("/import-csv", response_model=CSVImportResult)
async def import_csv(
    file: UploadFile = File(...),
    field_mapping: str = Form(default="{}"),
    current_user: UserPublic = Depends(get_current_user),
) -> CSVImportResult:
    content = await file.read()
    csv_text = content.decode("utf-8", errors="ignore")
    try:
        parsed_mapping = json.loads(field_mapping)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid field_mapping JSON") from exc
    if not isinstance(parsed_mapping, dict):
        raise HTTPException(status_code=400, detail="field_mapping must be a JSON object")
    return manage_lead_service.import_csv_text(csv_text, parsed_mapping)


@router.get("/bin", response_model=list[BinLead])
def list_bin(current_user: UserPublic = Depends(get_current_user)) -> list[BinLead]:
    return manage_lead_service.list_bin()


@router.post("/bin/{lead_id}/restore", response_model=dict[str, str])
def restore_bin_lead(
    lead_id: str,
    current_user: UserPublic = Depends(get_current_user),
) -> dict[str, str]:
    restored = manage_lead_service.restore_lead(lead_id)
    if not restored:
        raise HTTPException(status_code=404, detail="Lead not found in bin")
    return {"status": "restored", "lead_id": lead_id}


@router.delete("/bin/{lead_id}", response_model=dict[str, str])
def delete_bin_lead_forever(
    lead_id: str,
    current_user: UserPublic = Depends(get_current_user),
) -> dict[str, str]:
    deleted = manage_lead_service.delete_lead_forever(lead_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"status": "deleted", "lead_id": lead_id}


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


@router.put("/{lead_id}", response_model=ManageLead)
def replace_lead(
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


@router.delete("/{lead_id}", response_model=dict[str, str])
def soft_delete_lead(
    lead_id: str,
    current_user: UserPublic = Depends(get_current_user),
) -> dict[str, str]:
    deleted = manage_lead_service.soft_delete_lead(lead_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"status": "moved_to_bin", "lead_id": lead_id}
