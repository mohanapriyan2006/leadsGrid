import json

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile

from app.core.dependencies import get_current_user
from app.schemas.auth import UserPublic
from app.schemas.lead import CSVImportResult, Lead, LeadFetchRequest, LeadSource
from app.services.job_service import job_service
from app.services.lead_service import lead_service
from app.services.manage_lead_service import manage_lead_service
from app.workers.lead_worker import run_lead_pipeline_job


router = APIRouter()


@router.get("", response_model=list[Lead])
def list_leads(current_user: UserPublic = Depends(get_current_user)) -> list[Lead]:
    return lead_service.list_leads()


@router.post("/sync", response_model=list[Lead])
async def sync_leads(
    payload: LeadFetchRequest,
    current_user: UserPublic = Depends(get_current_user),
) -> list[Lead]:
    return await lead_service.fetch_and_score(payload)


@router.post("/async", response_model=dict[str, str])
def async_sync_leads(
    payload: LeadFetchRequest,
    background_tasks: BackgroundTasks,
    current_user: UserPublic = Depends(get_current_user),
) -> dict[str, str]:
    job = job_service.create_job()
    background_tasks.add_task(run_lead_pipeline_job, job.id, payload)
    return {"status": "queued", "job_id": job.id}


@router.get("/discover", response_model=list[Lead])
async def discover_leads(
    query: str,
    source: LeadSource = "reddit",
    limit: int = 12,
    current_user: UserPublic = Depends(get_current_user),
) -> list[Lead]:
    payload = LeadFetchRequest(query=query, source=source, limit=limit)
    return await lead_service.fetch_and_score(payload)


@router.get("/jobs/{job_id}", response_model=dict[str, str | None])
def get_discovery_job(
    job_id: str,
    current_user: UserPublic = Depends(get_current_user),
) -> dict[str, str | None]:
    job = job_service.get_job(job_id)
    if job is None:
        return {"status": "unknown", "detail": None}
    return {"status": job.status, "detail": job.detail}


@router.post("/import-csv", response_model=CSVImportResult)
async def import_csv_compat(
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
