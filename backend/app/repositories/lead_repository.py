from app.schemas.lead import Lead


class LeadRepository:
    def __init__(self) -> None:
        self._leads: list[Lead] = []

    def list_leads(self) -> list[Lead]:
        return self._leads

    def save_leads(self, leads: list[Lead]) -> None:
        self._leads = leads


lead_repository = LeadRepository()
