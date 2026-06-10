from __future__ import annotations

import asyncio
import logging
from time import monotonic
from typing import Any

logger = logging.getLogger(__name__)


class TokenBucket:
    def __init__(self, rate: float, capacity: float):
        self.rate = rate
        self.capacity = capacity
        self.tokens = capacity
        self.last_update = monotonic()
        self._lock = asyncio.Lock()

    async def acquire(self, tokens: float = 1.0) -> None:
        async with self._lock:
            now = monotonic()
            elapsed = now - self.last_update
            self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)
            self.last_update = now
            if self.tokens < tokens:
                wait = (tokens - self.tokens) / self.rate
                logger.debug("Rate limit: waiting %.2fs", wait)
                await asyncio.sleep(wait)
                self.tokens = 0.0
            else:
                self.tokens -= tokens


class SourceRateLimiter:
    def __init__(self, config: dict[str, dict[str, Any]] | None = None):
        default_config = {
            "github": {"rate": 1 / 6.0, "capacity": 5},      # 10 req/min
            "hackernews": {"rate": 1.0, "capacity": 3},       # 1 req/sec
            "stackexchange": {"rate": 1 / 0.033, "capacity": 10},  # ~30 req/sec
            "search": {"rate": 1.0, "capacity": 2},             # 1 req/sec
            "serper": {"rate": 1 / 3456.0, "capacity": 1},      # 25 req/day
        }
        self.config = config or default_config
        self._buckets: dict[str, TokenBucket] = {}

    def _get_bucket(self, source: str) -> TokenBucket:
        if source not in self._buckets:
            cfg = self.config.get(source, {"rate": 1.0, "capacity": 3})
            self._buckets[source] = TokenBucket(cfg["rate"], cfg["capacity"])
        return self._buckets[source]

    async def acquire(self, source: str, tokens: float = 1.0) -> None:
        bucket = self._get_bucket(source)
        await bucket.acquire(tokens)
