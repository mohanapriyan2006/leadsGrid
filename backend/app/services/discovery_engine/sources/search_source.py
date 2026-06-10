from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

import httpx
from bs4 import BeautifulSoup

from app.core.config import get_settings
from app.services.discovery_engine.models import RawSignal
from app.services.discovery_engine.sources.base import DiscoverySource, DROP_TERMS

logger = logging.getLogger(__name__)


class SearchSource(DiscoverySource):
    name = "search"

    def _is_business_signal(self, signal: RawSignal) -> bool:
        # Web search queries are already business-targeted; only drop obvious junk
        text = signal.full_text().lower()
        return not any(term in text for term in DROP_TERMS)

    def _parse_response(self, data: Any, query: str) -> list[RawSignal]:
        # Handled by _parse_serper and _parse_ddg
        return []

    async def discover(
        self,
        queries: list[str],
        limit: int,
        client: httpx.AsyncClient,
    ) -> list[RawSignal]:
        signals: list[RawSignal] = []
        per_query_limit = max(3, min(limit, 10))

        # Try Serper first (higher quality) then DDG fallback
        for query in queries:
            if len(signals) >= limit:
                break
            batch = await self._fetch_serper(query, per_query_limit, client)
            for s in batch:
                if self._is_business_signal(s):
                    signals.append(s)
                    if len(signals) >= limit:
                        break

        # Fill remaining slots with DDG
        for query in queries:
            if len(signals) >= limit:
                break
            batch = await self._fetch_ddg(query, per_query_limit, client)
            for s in batch:
                if self._is_business_signal(s):
                    signals.append(s)
                    if len(signals) >= limit:
                        break

        logger.info("Search source produced %s business signals", len(signals))
        return signals

    # ------------------------------------------------------------------
    # Serper
    # ------------------------------------------------------------------

    async def _fetch_serper(
        self,
        query: str,
        limit: int,
        client: httpx.AsyncClient,
    ) -> list[RawSignal]:
        settings = get_settings()
        key = getattr(settings, "serper_api_key", None)
        if not key:
            return []
        url = "https://google.serper.dev/search"
        headers = {
            "X-API-KEY": key,
            "Content-Type": "application/json",
        }
        payload = {"q": query, "num": max(1, min(limit, 50))}

        async def _post(_payload: dict) -> dict | None:
            try:
                resp = await client.post(url, json=_payload, headers=headers, timeout=15)
                resp.raise_for_status()
                return resp.json()
            except httpx.HTTPStatusError as exc:
                body = ""
                try:
                    body = exc.response.text[:500]
                except Exception:
                    pass
                if exc.response.status_code == 400 and "Query pattern not allowed" in body:
                    fallback = " ".join(query.split()[:6])
                    logger.info("Serper free-tier retry: %s", fallback)
                    try:
                        resp2 = await client.post(url, json={"q": fallback, "num": max(1, min(limit, 50))}, headers=headers, timeout=15)
                        resp2.raise_for_status()
                        return resp2.json()
                    except Exception:
                        return None
                return None
            except Exception:
                return None

        data = await _post(payload)
        if not data:
            return []
        return self._parse_serper(data)

    def _parse_serper(self, data: dict) -> list[RawSignal]:
        records: list[RawSignal] = []
        for idx, item in enumerate(data.get("organic", [])):
            title = (item.get("title") or "").strip()
            if not title:
                continue
            snippet = (item.get("snippet") or "").strip()
            records.append(
                RawSignal(
                    source="search",
                    source_type="organic",
                    title=title,
                    content=snippet[:800],
                    url=item.get("link"),
                    created_at=datetime.now(timezone.utc).isoformat(),
                    engagement={},
                    metadata={"index": idx, "engine": "serper"},
                )
            )
        return records

    # ------------------------------------------------------------------
    # DuckDuckGo Lite
    # ------------------------------------------------------------------

    async def _fetch_ddg(
        self,
        query: str,
        limit: int,
        client: httpx.AsyncClient,
    ) -> list[RawSignal]:
        url = "https://lite.duckduckgo.com/lite/"
        data = {"q": query, "kl": "us-en"}
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Referer": "https://lite.duckduckgo.com/",
        }
        try:
            response = await client.post(url, data=data, headers=headers, timeout=15, follow_redirects=True)
            response.raise_for_status()
        except Exception as exc:
            logger.warning("DDG fetch failed: %s", exc)
            return []

        records = self._parse_ddg(response.text, limit)

        # Retry with shorter query if very few results
        if len(records) < 3 and " " in query:
            short = " ".join(query.split()[:4])
            try:
                retry_resp = await client.post(url, data={"q": short, "kl": "us-en"}, headers=headers, timeout=15, follow_redirects=True)
                retry_resp.raise_for_status()
                records = self._parse_ddg(retry_resp.text, limit)
            except Exception:
                pass
        return records

    @staticmethod
    def _parse_ddg(html: str, limit: int) -> list[RawSignal]:
        s = BeautifulSoup(html, "html.parser")
        parsed: list[RawSignal] = []

        selectors = [
            ("a", {"class_": "result-link"}),
            ("a", {"class_": "result__a"}),
        ]
        links = []
        for tag, kwargs in selectors:
            found = s.find_all(tag, **kwargs)
            if found:
                links = found
                break
        if not links:
            links = [
                a for a in s.find_all("a", href=True)
                if a.find_parent(["tr", "div", "li"], class_=lambda c: c and ("result" in c or "result" in str(c)))
            ]

        for idx, link in enumerate(links[: max(1, min(limit, 30))]):
            title = link.get_text(strip=True)
            href = link.get("href")
            if not title or not href:
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
            else:
                container = link.find_parent(["div", "li"])
                if container:
                    snippet = container.get_text(" ", strip=True).replace(title, "").strip()[:300]

            parsed.append(
                RawSignal(
                    source="search",
                    source_type="organic",
                    title=title,
                    content=snippet[:800],
                    url=href,
                    created_at=datetime.now(timezone.utc).isoformat(),
                    engagement={},
                    metadata={"index": idx, "engine": "duckduckgo"},
                )
            )
        return parsed
