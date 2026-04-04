import logging

import httpx

logger = logging.getLogger(__name__)


async def fetch_reddit(query: str, limit: int = 20, timeout: int = 15) -> list[dict]:
    url = "https://www.reddit.com/search.json"
    params = {"q": query, "sort": "top", "limit": max(1, min(limit, 50))}
    headers = {"User-Agent": "PitchPilotAgent/1.0"}

    try:
        async with httpx.AsyncClient(timeout=timeout, headers=headers) as client:
            response = await client.get(url, params=params)
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
            }
        )

    return records
