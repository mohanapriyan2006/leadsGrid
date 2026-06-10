from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from typing import Any

import httpx

from app.services.discovery_engine.models import RawSignal
from app.services.discovery_engine.rate_limiter import SourceRateLimiter

logger = logging.getLogger(__name__)

# Heuristic drop terms — signals containing these are pre-filtered
DROP_TERMS = frozenset(
    [
        "student",
        "tutorial",
        "course",
        "learning",
        "bootcamp",
        "job seeker",
        "resume",
        "portfolio review",
        "homework",
        "exam",
        "assignment",
        "beginner guide",
        "getting started",
        "how do i learn",
        "should i learn",
        "career change",
        "interview prep",
    ]
)

# Business-signal keep terms — signals containing these are boosted
KEEP_TERMS = frozenset(
    [
        "hire",
        "hiring",
        "looking for",
        "need someone",
        "freelancer",
        "agency",
        "consultant",
        "developer needed",
        "integration",
        "migration",
        "implementation",
        "production",
        "scaling",
        "broken",
        "failing",
        "frustrated",
        "issue",
        "problem",
        "recommendation",
        "alternative to",
        "replace",
        "budget",
        "asap",
        "urgent",
        "stuck",
        "outsource",
        "contractor",
    ]
)


class DiscoverySource(ABC):
    name: str = "unknown"

    def __init__(self, rate_limiter: SourceRateLimiter | None = None):
        self.rate_limiter = rate_limiter

    @abstractmethod
    async def discover(
        self,
        queries: list[str],
        limit: int,
        client: httpx.AsyncClient,
    ) -> list[RawSignal]:
        ...

    @abstractmethod
    def _parse_response(self, data: Any, query: str) -> list[RawSignal]:
        ...

    def _is_business_signal(self, signal: RawSignal) -> bool:
        text = signal.full_text().lower()
        if any(term in text for term in DROP_TERMS):
            return False
        # At least one keep term must be present for it to be a real lead
        if not any(term in text for term in KEEP_TERMS):
            return False
        return True

    def _score_signal(self, signal: RawSignal) -> float:
        text = signal.full_text().lower()
        score = 0.0
        for term in KEEP_TERMS:
            if term in text:
                score += 1.0
        engagement = signal.engagement
        score += min(5.0, int(engagement.get("upvotes", 0)) / 10.0)
        score += min(5.0, int(engagement.get("views", 0)) / 100.0)
        score += min(5.0, int(engagement.get("answers", 0)) * 2.0)
        score += min(5.0, int(engagement.get("comments", 0)) / 5.0)
        return score

    async def _fetch(
        self,
        client: httpx.AsyncClient,
        method: str,
        url: str,
        **kwargs: Any,
    ) -> Any:
        if self.rate_limiter:
            await self.rate_limiter.acquire(self.name)
        try:
            if method.upper() == "GET":
                response = await client.get(url, **kwargs)
            else:
                response = await client.post(url, **kwargs)
            response.raise_for_status()
            return response.json()
        except Exception as exc:
            logger.warning("%s fetch failed: %s", self.name, exc)
            return None
