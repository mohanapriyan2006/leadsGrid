from __future__ import annotations

import logging
from datetime import datetime, timezone

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)


async def fetch_serper(query: str, limit: int = 20, timeout: int = 15) -> list[dict]:
    settings = get_settings()
    if not settings.serper_api_key:
        return []

    url = "https://google.serper.dev/search"
    headers = {
        "X-API-KEY": settings.serper_api_key,
        "Content-Type": "application/json",
    }
    payload = {
        "q": query,
        "num": max(1, min(limit, 50)),
    }

    try:
        async with httpx.AsyncClient(timeout=timeout, headers=headers) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
    except Exception as exc:
        logger.warning("Serper fetch failed: %s", exc)
        return []

    records: list[dict] = []
    for index, item in enumerate(data.get("organic", [])):
        title = (item.get("title") or "").strip()
        if not title:
            continue

        snippet = (item.get("snippet") or "").strip()
        records.append(
            {
                "id": f"serper-{index}",
                "title": title,
                "summary": snippet[:280],
                "content": snippet[:600],
                "platform": "search",
                "upvotes": 0,
                "url": item.get("link"),
                "author": None,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )

    return records
