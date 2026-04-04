import logging

import httpx

logger = logging.getLogger(__name__)


async def fetch_hackernews(query: str, limit: int = 20, timeout: int = 15) -> list[dict]:
    url = "https://hn.algolia.com/api/v1/search"
    params = {"query": query, "tags": "story", "hitsPerPage": max(1, min(limit, 50))}

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            payload = response.json()
    except Exception as exc:
        logger.warning("HackerNews fetch failed: %s", exc)
        return []

    records: list[dict] = []
    for hit in payload.get("hits", []):
        title = (hit.get("title") or hit.get("story_title") or "").strip()
        if not title:
            continue

        summary = (hit.get("comment_text") or "").strip()[:280]
        records.append(
            {
                "id": hit.get("objectID"),
                "title": title,
                "summary": summary,
                "content": summary,
                "platform": "hackernews",
                "upvotes": int(hit.get("points", 0) or 0),
                "url": hit.get("url"),
                "author": hit.get("author"),
            }
        )

    return records
