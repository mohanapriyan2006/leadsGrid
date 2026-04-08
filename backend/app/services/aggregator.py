import asyncio

from app.core.config import get_settings
from app.modules.processors.cleaner import clean_records
from app.modules.processors.deduplicator import dedupe_records
from app.modules.processors.query_builder import build_query_plan
from app.modules.processors.scorer import score_records
from app.modules.processors.verifier import verify_records
from app.modules.sources.google_search import fetch_google_like_search
from app.modules.sources.hackernews import fetch_hackernews
from app.modules.sources.reddit import fetch_reddit
from app.modules.sources.serper import fetch_serper


class LeadAggregator:
    def __init__(self, source_limit: int = 20, timeout_seconds: int = 15):
        self.source_limit = source_limit
        self.timeout_seconds = timeout_seconds
        self.settings = get_settings()

    async def discover(self, query: str) -> list[dict]:
        query_plan = build_query_plan(query)
        results = await asyncio.gather(
            fetch_reddit(query_plan["reddit"], self.source_limit, self.timeout_seconds),
            fetch_hackernews(query_plan["hackernews"], self.source_limit, self.timeout_seconds),
            fetch_google_like_search(query_plan["search"], self.source_limit, self.timeout_seconds),
            fetch_serper(query_plan["serper"], self.source_limit, self.timeout_seconds),
            return_exceptions=True,
        )

        merged: list[dict] = []
        for result in results:
            if isinstance(result, Exception):
                continue
            merged.extend(result)

        cleaned = clean_records(merged)
        deduped = dedupe_records(cleaned)
        scored = score_records(deduped, query_plan["high_intent"])
        verified = verify_records(scored, max_age_days=self.settings.max_lead_age_days)

        # Guardrail: strict verification can over-filter. Fall back to scored
        # results so discovery remains usable in UI.
        if verified:
            return sorted(verified, key=lambda item: float(item.get("score") or 0), reverse=True)

        return sorted(scored, key=lambda item: float(item.get("score") or 0), reverse=True)
