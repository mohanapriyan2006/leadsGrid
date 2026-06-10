from __future__ import annotations

import hashlib
import json
import logging
from time import monotonic
from typing import Any

logger = logging.getLogger(__name__)


class DiscoveryCache:
    def __init__(self, ttl_seconds: float = 120.0, max_entries: int = 256):
        self.ttl_seconds = ttl_seconds
        self.max_entries = max_entries
        self._store: dict[str, tuple[float, Any]] = {}

    def _key(self, *parts: str) -> str:
        payload = "|".join(parts)
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    def get(self, query: str, limit: int, sources_key: str = "all") -> list[dict] | None:
        key = self._key(query, str(limit), sources_key)
        item = self._store.get(key)
        if not item:
            return None
        expires_at, cached = item
        if monotonic() >= expires_at:
            self._store.pop(key, None)
            return None
        logger.debug("Cache hit for query=%s limit=%s", query, limit)
        return list(cached)

    def set(self, query: str, limit: int, value: list[dict], sources_key: str = "all") -> None:
        if len(self._store) >= self.max_entries:
            oldest_key = min(self._store, key=lambda k: self._store[k][0])
            self._store.pop(oldest_key, None)
        key = self._key(query, str(limit), sources_key)
        expires_at = monotonic() + self.ttl_seconds
        self._store[key] = (expires_at, list(value))
        logger.debug("Cache set for query=%s limit=%s entries=%s", query, limit, len(value))

    def invalidate(self, query: str | None = None) -> None:
        if query is None:
            self._store.clear()
            return
        keys_to_remove = [k for k in self._store if query in k]
        for k in keys_to_remove:
            self._store.pop(k, None)
