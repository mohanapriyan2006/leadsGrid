from fastapi import APIRouter, Depends, HTTPException

from app.core.dependencies import get_current_user
from app.schemas.auth import UserPublic
from app.schemas.crm import CRMRecord, CRMUpdateRequest
from app.services.crm_service import crm_service


router = APIRouter()


@router.get("", response_model=list[CRMRecord])
def list_crm_records(
    current_user: UserPublic = Depends(get_current_user),
) -> list[CRMRecord]:
    return crm_service.list_records()


@router.get("/{lead_id}", response_model=CRMRecord)
def get_crm_record(
    lead_id: str,
    current_user: UserPublic = Depends(get_current_user),
) -> CRMRecord:
    record = crm_service.get_record(lead_id)
    if record is None:
        raise HTTPException(status_code=404, detail="CRM record not found")
    return record


@router.put("/{lead_id}", response_model=CRMRecord)
def update_crm_record(
    lead_id: str,
    payload: CRMUpdateRequest,
    current_user: UserPublic = Depends(get_current_user),
) -> CRMRecord:
    return crm_service.update_record(lead_id, payload)
