from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

import httpx

from app.services.discovery_engine.models import RawSignal
from app.services.discovery_engine.sources.base import DROP_TERMS, KEEP_TERMS, DiscoverySource

logger = logging.getLogger(__name__)

GDELT_DOC_URL = "https://api.gdeltproject.org/api/v2/doc/doc"

# Event-type keywords that indicate business triggers
GDELT_BUSINESS_TERMS = frozenset([
    "funding", "acquisition", "acquire", "merger", "expansion",
    "hiring", "hires", "appoints", "raises", "series a", "series b",
    "venture capital", "investment", "ipo", "partnership",
    "digital transformation", "cloud migration", "automation",
    "crm implementation", "erp migration", "ai adoption",
])


class GdeltSource(DiscoverySource):
    name = "gdelt"

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
            # GDELT uses a combined query with business trigger terms
            gdelt_query = f"{query} {' OR '.join(GDELT_BUSINESS_TERMS)}"
            params = {
                "query": gdelt_query,
                "mode": "ArtList",
                "maxrecords": per_query_limit,
                "format": "json",
                "sort": "datedesc",
            }
            try:
                response = await client.get(GDELT_DOC_URL, params=params, timeout=15)
                response.raise_for_status()
                data = response.json()
            except Exception as exc:
                logger.debug("GDELT fetch failed: %s", exc)
                continue

            batch = self._parse_response(data, query)
            for s in batch:
                if self._is_business_signal(s):
                    signals.append(s)
                    if len(signals) >= limit:
                        break

        logger.info("GDELT source produced %s business signals", len(signals))
        return signals

    def _parse_response(self, data: Any, query: str) -> list[RawSignal]:
        articles = data.get("articles", []) if isinstance(data, dict) else []
        if not articles:
            return []

        signals: list[RawSignal] = []
        for item in articles:
            title = (item.get("title") or "").strip()
            if not title:
                continue
            body = (item.get("seendescription") or item.get("snippet") or "").strip()[:600]
            domain = item.get("domain", "")
            url = item.get("url")
            created = item.get("seendate")

            signal = RawSignal(
                source="gdelt",
                source_type="news",
                title=title,
                content=body,
                author=domain,
                url=url,
                created_at=created,
                engagement={
                    "upvotes": 0,
                    "comments": 0,
                },
                metadata={
                    "domain": domain,
                    "language": item.get("language"),
                    "query": query,
                    "event_type": self._detect_event_type(title + " " + body),
                },
            )
            signals.append(signal)
        return signals

    @staticmethod
    def _detect_event_type(text: str) -> str | None:
        lowered = text.lower()
        if "funding" in lowered or "raises" in lowered or "venture" in lowered:
            return "funding"
        if "acquisition" in lowered or "acquires" in lowered or "merger" in lowered:
            return "acquisition"
        if "hiring" in lowered or "hires" in lowered or "appoints" in lowered:
            return "hiring"
        if "expansion" in lowered:
            return "expansion"
        if "digital transformation" in lowered or "automation" in lowered:
            return "digital_transformation"
        return None

    def _is_business_signal(self, signal: RawSignal) -> bool:
        text = signal.full_text().lower()
        if any(term in text for term in DROP_TERMS):
            return False
        # GDELT articles should always be business-relevant since we query business terms,
        # but verify there's at least one business trigger
        has_business = any(term in text for term in KEEP_TERMS) or any(
            term in text for term in GDELT_BUSINESS_TERMS
        )
        return has_business
