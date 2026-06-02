import logging
from datetime import datetime, timezone

import httpx

logger = logging.getLogger(__name__)


async def fetch_reddit(
    query: str,
    limit: int = 20,
    timeout: int = 15,
    client: httpx.AsyncClient | None = None,
) -> list[dict]:
    url = "https://www.reddit.com/search.json"
    params = {"q": query, "sort": "top", "limit": max(1, min(limit, 50))}
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept": "application/json, text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
    }

    try:
        if client is None:
            async with httpx.AsyncClient(timeout=timeout, headers=headers) as owned_client:
                response = await owned_client.get(url, params=params)
                response.raise_for_status()
                payload = response.json()
        else:
            response = await client.get(url, params=params, headers=headers, timeout=timeout)
            response.raise_for_status()
            payload = response.json()
    except Exception as exc:
        logger.warning("Reddit fetch failed: %s", exc)
        return []

    records: list[dict] = []
    children = payload.get("data", {}).get("children", [])
    for item in children:
        data = item.get("data", {})
        title = data.get("title", "").strip()
        if not title:
            continue
        summary = (data.get("selftext", "") or "").strip()[:280]
        permalink = data.get("permalink", "")
        url_value = f"https://reddit.com{permalink}" if permalink else data.get("url")
        created_utc = data.get("created_utc")
        created_at = None
        if isinstance(created_utc, (int, float)):
            created_at = datetime.fromtimestamp(created_utc, tz=timezone.utc).isoformat()
        records.append(
            {
                "id": data.get("id"),
                "title": title,
                "summary": summary,
                "content": summary,
                "platform": "reddit",
                "upvotes": int(data.get("ups", 0) or 0),
                "url": url_value,
                "author": data.get("author"),
                "created_at": created_at,
            }
        )

    return records
