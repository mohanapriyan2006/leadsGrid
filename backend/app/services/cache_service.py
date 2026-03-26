import json
from dataclasses import dataclass

import redis

from app.core.config import settings


@dataclass
class CacheConfig:
    default_ttl_seconds: int = 180


class CacheService:
    def __init__(self) -> None:
        self._config = CacheConfig()
        self._memory_cache: dict[str, str] = {}
        self._redis_client: redis.Redis | None = None

        try:
            self._redis_client = redis.Redis.from_url(settings.redis_url, decode_responses=True)
            self._redis_client.ping()
        except Exception:
            self._redis_client = None

    def get_json(self, key: str) -> dict | list | None:
        payload = self._get_raw(key)
        if payload is None:
            return None
        try:
            return json.loads(payload)
        except json.JSONDecodeError:
            return None

    def set_json(self, key: str, value: dict | list, ttl_seconds: int | None = None) -> None:
        payload = json.dumps(value)
        self._set_raw(key, payload, ttl_seconds)

    def _get_raw(self, key: str) -> str | None:
        if self._redis_client is not None:
            try:
                return self._redis_client.get(key)
            except Exception:
                pass
        return self._memory_cache.get(key)

    def _set_raw(self, key: str, value: str, ttl_seconds: int | None = None) -> None:
        ttl = ttl_seconds or self._config.default_ttl_seconds
        if self._redis_client is not None:
            try:
                self._redis_client.setex(key, ttl, value)
                return
            except Exception:
                pass
        self._memory_cache[key] = value


cache_service = CacheService()
