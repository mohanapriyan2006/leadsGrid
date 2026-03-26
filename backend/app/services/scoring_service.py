from app.schemas.ai import LeadScoringResponse
from app.services.ai_service import ai_service


class ScoringService:
    async def score_content(self, content: str) -> LeadScoringResponse:
        return await ai_service.classify_and_score(content)


scoring_service = ScoringService()
