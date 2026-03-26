import asyncio

from app.schemas.lead import LeadFetchRequest
from app.services.job_service import job_service
from app.services.lead_service import lead_service


def run_lead_pipeline(payload: LeadFetchRequest):
    return asyncio.run(lead_service.fetch_and_score(payload))


def run_lead_pipeline_job(job_id: str, payload: LeadFetchRequest) -> None:
    job_service.set_running(job_id)
    try:
        asyncio.run(lead_service.fetch_and_score(payload))
        job_service.set_done(job_id)
    except Exception as exc:
        job_service.set_failed(job_id, str(exc))
