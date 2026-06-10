from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

import httpx

from app.core.config import get_settings
from app.services.discovery_engine.models import RawSignal
from app.services.discovery_engine.sources.base import DiscoverySource

logger = logging.getLogger(__name__)

DROP_TAGS = frozenset(["homework", "beginner", "learning", "tutorial", "career"])
KEEP_TAGS = frozenset(["production", "scaling", "performance", "integration", "migration", "deployment"])


class StackExchangeSource(DiscoverySource):
    name = "stackexchange"

    async def discover(
        self,
        queries: list[str],
        limit: int,
        client: httpx.AsyncClient,
    ) -> list[RawSignal]:
        settings = get_settings()
        key = getattr(settings, "stackexchange_api_key", None)
        signals: list[RawSignal] = []
        per_query_limit = max(3, min(limit, 10))

        for query in queries:
            if len(signals) >= limit:
                break
            url = "https://api.stackexchange.com/2.3/search/advanced"
            params: dict[str, Any] = {
                "q": query,
                "sort": "relevance",
                "order": "desc",
                "pagesize": per_query_limit,
                "site": "stackoverflow",
                "filter": "withbody",
            }
            if key:
                params["key"] = key
            data = await self._fetch(client, "GET", url, params=params)
            if data:
                batch = self._parse_response(data, query)
                for s in batch:
                    if self._is_business_signal(s):
                        signals.append(s)
                        if len(signals) >= limit:
                            break
        logger.info("StackExchange source produced %s business signals", len(signals))
        return signals

    def _parse_response(self, data: Any, query: str) -> list[RawSignal]:
        items = data.get("items", [])
        signals: list[RawSignal] = []
        for item in items:
            title = (item.get("title") or "").strip()
            body = (item.get("body") or "").strip()[:800]
            if not title:
                continue
            tags = [t.lower() for t in item.get("tags", [])]
            score = item.get("score", 0) or 0
            views = item.get("view_count", 0) or 0
            answers = item.get("answer_count", 0) or 0
            has_accepted = bool(item.get("accepted_answer_id"))
            owner = item.get("owner", {})
            author = owner.get("display_name")
            author_url = owner.get("link")
            created = item.get("creation_date")
            created_iso = None
            if isinstance(created, (int, float)):
                created_iso = datetime.fromtimestamp(created, tz=timezone.utc).isoformat()

            signal = RawSignal(
                source="stackexchange",
                source_type="question",
                title=title,
                content=body,
                author=author,
                author_url=author_url,
                url=item.get("link"),
                created_at=created_iso,
                engagement={
                    "score": int(score),
                    "views": int(views),
                    "answers": int(answers),
                    "accepted": has_accepted,
                },
                metadata={
                    "tags": tags,
                    "is_answered": item.get("is_answered", False),
                    "query": query,
                },
            )
            signals.append(signal)
        return signals

    def _is_business_signal(self, signal: RawSignal) -> bool:
        text = signal.full_text().lower()
        if any(term in text for term in self.DROP_TERMS):
            return False
        tags = [t.lower() for t in signal.metadata.get("tags", [])]
        if any(t in DROP_TAGS for t in tags):
            return False
        views = signal.engagement.get("views", 0)
        score_val = signal.engagement.get("score", 0)
        # Keep if it has business keywords OR relevant tags OR decent engagement
        has_business_terms = any(term in text for term in self.KEEP_TERMS)
        has_keep_tags = any(t in KEEP_TAGS for t in tags)
        decent_engagement = views >= 20 or score_val >= 0
        return has_business_terms or has_keep_tags or decent_engagement
