import asyncio

from app.services.scoring_service import scoring_service


def run_scoring_pipeline(content: str):
    return asyncio.run(scoring_service.score_content(content))
