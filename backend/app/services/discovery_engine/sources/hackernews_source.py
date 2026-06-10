from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

import httpx

from app.services.discovery_engine.models import RawSignal
from app.services.discovery_engine.sources.base import DiscoverySource, DROP_TERMS, KEEP_TERMS

logger = logging.getLogger(__name__)


class HackerNewsSource(DiscoverySource):
    name = "hackernews"

    async def discover(
        self,
        queries: list[str],
        limit: int,
        client: httpx.AsyncClient,
    ) -> list[RawSignal]:
        signals: list[RawSignal] = []
        per_query_limit = max(3, min(limit, 12))

        for query in queries:
            if len(signals) >= limit:
                break
            url = "https://hn.algolia.com/api/v1/search"
            params = {
                "query": query,
                "tags": "story",
                "hitsPerPage": per_query_limit,
            }
            data = await self._fetch(client, "GET", url, params=params)
            if data:
                batch = self._parse_response(data, query)
                for s in batch:
                    if self._is_business_signal(s):
                        signals.append(s)
                        if len(signals) >= limit:
                            break
        logger.info("HN source produced %s business signals", len(signals))
        return signals

    def _is_business_signal(self, signal: RawSignal) -> bool:
        text = signal.full_text().lower()
        if any(term in text for term in DROP_TERMS):
            return False
        # Accept if it has business terms OR decent engagement (HN stories often
        # have hiring intent in title but sparse body)
        has_business = any(term in text for term in KEEP_TERMS)
        decent_engagement = signal.engagement.get("upvotes", 0) >= 2 or signal.engagement.get("comments", 0) >= 1
        return has_business or decent_engagement

    def _parse_response(self, data: Any, query: str) -> list[RawSignal]:
        hits = data.get("hits", [])
        signals: list[RawSignal] = []
        for hit in hits:
            title = (hit.get("title") or hit.get("story_title") or "").strip()
            if not title:
                continue
            text = (hit.get("comment_text") or "").strip()[:600]
            story_text = hit.get("story_text", "")
            content = text or story_text or ""
            author = hit.get("author")
            points = hit.get("points", 0) or 0
            num_comments = hit.get("num_comments", 0) or 0
            created_at_i = hit.get("created_at_i")
            created = None
            if isinstance(created_at_i, (int, float)):
                created = datetime.fromtimestamp(created_at_i, tz=timezone.utc).isoformat()

            signal = RawSignal(
                source="hackernews",
                source_type="story",
                title=title,
                content=content[:800],
                author=author,
                url=hit.get("url") or f"https://news.ycombinator.com/item?id={hit.get('objectID')}",
                created_at=created,
                engagement={
                    "upvotes": int(points),
                    "comments": int(num_comments),
                    "views": int(num_comments) * 20 + int(points) * 5,
                },
                metadata={
                    "object_id": hit.get("objectID"),
                    "query": query,
                },
            )
            signals.append(signal)
        return signals
