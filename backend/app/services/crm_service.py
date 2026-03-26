from app.repositories.crm_repository import crm_repository
from app.schemas.crm import CRMHistoryEntry, CRMRecord, CRMUpdateRequest
from app.utils.time import utc_now


class CRMService:
    def get_record(self, lead_id: str) -> CRMRecord | None:
        return crm_repository.get(lead_id)

    def list_records(self) -> list[CRMRecord]:
        return crm_repository.list()

    def update_record(self, lead_id: str, payload: CRMUpdateRequest) -> CRMRecord:
        previous = crm_repository.get(lead_id)
        history = previous.history[:] if previous else []
        history.append(
            CRMHistoryEntry(
                status=payload.status,
                note=payload.note,
                at=utc_now(),
            )
        )
        record = CRMRecord(
            lead_id=lead_id,
            status=payload.status,
            note=payload.note,
            follow_up_at=payload.follow_up_at,
            updated_at=utc_now(),
            history=history,
        )
        return crm_repository.upsert(record)


crm_service = CRMService()
