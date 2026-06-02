import logging
from datetime import datetime, timezone

import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


async def fetch_google_like_search(
    query: str,
    limit: int = 20,
    timeout: int = 15,
    client: httpx.AsyncClient | None = None,
) -> list[dict]:
    # Uses DuckDuckGo Lite as a free search fallback.
    url = "https://lite.duckduckgo.com/lite/"
    data = {"q": query, "kl": "us-en"}
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": "https://lite.duckduckgo.com/",
    }

    try:
        if client is None:
            async with httpx.AsyncClient(timeout=timeout, headers=headers, follow_redirects=True) as owned_client:
                response = await owned_client.post(url, data=data)
                response.raise_for_status()
        else:
            response = await client.post(url, data=data, headers=headers, timeout=timeout, follow_redirects=True)
            response.raise_for_status()
    except Exception as exc:
        logger.warning("Search fetch failed: %s", exc)
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    records: list[dict] = []

    # DuckDuckGo Lite uses .result-link anchors inside table rows.
    results = soup.find_all("a", class_="result-link")

    for index, link in enumerate(results[: max(1, min(limit, 30))]):
        title = link.get_text(strip=True)
        href = link.get("href")

        if not title:
            continue

        snippet = ""
        parent_tr = link.find_parent("tr")
        if parent_tr:
            snippet_td = parent_tr.find("td", class_="result-snippet")
            if snippet_td:
                snippet = snippet_td.get_text(" ", strip=True)
            else:
                row_text = parent_tr.get_text(" ", strip=True)
                snippet = row_text.replace(title, "").strip()

        records.append(
            {
                "id": f"search-{index}",
                "title": title,
                "summary": snippet[:280],
                "content": snippet[:600],
                "platform": "search",
                "upvotes": 0,
                "url": href,
                "author": None,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )

    return records
