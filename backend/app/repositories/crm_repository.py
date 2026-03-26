from app.schemas.crm import CRMRecord


class CRMRepository:
    def __init__(self) -> None:
        self._records: dict[str, CRMRecord] = {}

    def get(self, lead_id: str) -> CRMRecord | None:
        return self._records.get(lead_id)

    def upsert(self, record: CRMRecord) -> CRMRecord:
        self._records[record.lead_id] = record
        return record

    def list(self) -> list[CRMRecord]:
        return list(self._records.values())


crm_repository = CRMRepository()
