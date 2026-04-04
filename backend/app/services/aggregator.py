import asyncio

from app.modules.processors.cleaner import clean_records
from app.modules.processors.deduplicator import dedupe_records
from app.modules.processors.scorer import score_records
from app.modules.sources.google_search import fetch_google_like_search
from app.modules.sources.hackernews import fetch_hackernews
from app.modules.sources.reddit import fetch_reddit


class LeadAggregator:
    def __init__(self, source_limit: int = 20, timeout_seconds: int = 15):
        self.source_limit = source_limit
        self.timeout_seconds = timeout_seconds

    async def discover(self, query: str) -> list[dict]:
        results = await asyncio.gather(
            fetch_reddit(query, self.source_limit, self.timeout_seconds),
            fetch_hackernews(query, self.source_limit, self.timeout_seconds),
            fetch_google_like_search(query, self.source_limit, self.timeout_seconds),
            return_exceptions=True,
        )

        merged: list[dict] = []
        for result in results:
            if isinstance(result, Exception):
                continue
            merged.extend(result)

        cleaned = clean_records(merged)
        scored = score_records(cleaned, query)
        deduped = dedupe_records(scored)

        return sorted(deduped, key=lambda item: float(item.get("score") or 0), reverse=True)
