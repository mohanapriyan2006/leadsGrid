from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

import httpx

from app.services.discovery_engine.models import RawSignal
from app.services.discovery_engine.sources.base import DROP_TERMS, KEEP_TERMS, DiscoverySource

logger = logging.getLogger(__name__)

DEVTO_API_URL = "https://dev.to/api/articles"

# Tags that indicate business/founder content
DEVTO_KEEP_TAGS = frozenset([
    "startup", "saas", "indiehacker", "founder", "business", "automation",
    "crm", "scaling", "migration", "hiring", "freelance", "consulting",
    "productivity", "tools", "marketing", "sales",
])


class DevtoSource(DiscoverySource):
    name = "devto"

    async def discover(
        self,
        queries: list[str],
        limit: int,
        client: httpx.AsyncClient,
    ) -> list[RawSignal]:
        signals: list[RawSignal] = []
        per_query_limit = max(3, min(limit, 10))

        for query in queries:
            if len(signals) >= limit:
                break
            # DEV.to search uses 'q' param; also try tag filter for known tags
            params = {"q": query, "per_page": per_query_limit}
            data = await self._fetch(client, "GET", DEVTO_API_URL, params=params)
            if data:
                batch = self._parse_response(data, query)
                for s in batch:
                    if self._is_business_signal(s):
                        signals.append(s)
                        if len(signals) >= limit:
                            break
        logger.info("DEV.to source produced %s business signals", len(signals))
        return signals

    def _parse_response(self, data: Any, query: str) -> list[RawSignal]:
        if not isinstance(data, list):
            return []
        signals: list[RawSignal] = []
        for item in data:
            title = (item.get("title") or "").strip()
            if not title:
                continue
            body = (item.get("description") or item.get("body_markdown") or "").strip()[:800]
            tags = [t.lower() for t in item.get("tag_list", [])]
            author = item.get("user", {}).get("name") or item.get("user", {}).get("username")
            created = item.get("published_at")
            url = item.get("url")

            signal = RawSignal(
                source="devto",
                source_type="article",
                title=title,
                content=body,
                author=author,
                url=url,
                created_at=created,
                engagement={
                    "upvotes": int(item.get("public_reactions_count", 0) or 0),
                    "comments": int(item.get("comments_count", 0) or 0),
                    "views": int(item.get("page_views_count", 0) or 0),
                },
                metadata={
                    "tags": tags,
                    "query": query,
                    "reading_time": item.get("reading_time_minutes"),
                },
            )
            signals.append(signal)
        return signals

    def _is_business_signal(self, signal: RawSignal) -> bool:
        text = signal.full_text().lower()
        if any(term in text for term in DROP_TERMS):
            return False
        tags = [t.lower() for t in signal.metadata.get("tags", [])]
        has_business = any(term in text for term in KEEP_TERMS)
        has_keep_tags = any(t in DEVTO_KEEP_TAGS for t in tags)
        decent_engagement = signal.engagement.get("upvotes", 0) >= 2
        return has_business or has_keep_tags or decent_engagement
