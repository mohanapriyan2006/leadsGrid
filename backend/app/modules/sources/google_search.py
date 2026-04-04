import logging

import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


async def fetch_google_like_search(query: str, limit: int = 20, timeout: int = 15) -> list[dict]:
    # Uses DuckDuckGo HTML results as a free search fallback to avoid paid APIs.
    url = "https://duckduckgo.com/html/"
    params = {"q": query}
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }

    try:
        async with httpx.AsyncClient(timeout=timeout, headers=headers, follow_redirects=True) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
    except Exception as exc:
        logger.warning("Search fetch failed: %s", exc)
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    records: list[dict] = []
    anchors = soup.select("a.result__a")

    for index, anchor in enumerate(anchors[: max(1, min(limit, 30))]):
        title = anchor.get_text(strip=True)
        link = anchor.get("href")
        snippet_node = anchor.find_parent("div", class_="result").select_one("a.result__snippet") if anchor.find_parent("div", class_="result") else None
        summary = snippet_node.get_text(" ", strip=True) if snippet_node else ""

        if not title:
            continue

        records.append(
            {
                "id": f"search-{index}",
                "title": title,
                "summary": summary[:280],
                "content": summary[:600],
                "platform": "search",
                "upvotes": 0,
                "url": link,
                "author": None,
            }
        )

    return records
