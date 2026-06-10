from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

import httpx

from app.core.config import get_settings
from app.services.discovery_engine.models import RawSignal
from app.services.discovery_engine.sources.base import DiscoverySource

logger = logging.getLogger(__name__)

# Labels that indicate a business / production issue
HIGH_VALUE_LABELS = frozenset(
    ["bug", "production", "help wanted", "support", "integration", "migration", "breaking change"]
)


class GitHubSource(DiscoverySource):
    name = "github"

    async def discover(
        self,
        queries: list[str],
        limit: int,
        client: httpx.AsyncClient,
    ) -> list[RawSignal]:
        settings = get_settings()
        token = getattr(settings, "github_api_token", None)
        headers = {"Accept": "application/vnd.github+json"}
        if token:
            headers["Authorization"] = f"token {token}"

        signals: list[RawSignal] = []
        per_query_limit = max(3, min(limit, 10))

        for query in queries:
            if len(signals) >= limit:
                break
            url = "https://api.github.com/search/issues"
            params = {
                "q": query,
                "sort": "updated",
                "order": "desc",
                "per_page": per_query_limit,
            }
            data = await self._fetch(client, "GET", url, params=params, headers=headers)
            if data:
                batch = self._parse_response(data, query)
                for s in batch:
                    if self._is_business_signal(s):
                        signals.append(s)
                        if len(signals) >= limit:
                            break
        logger.info("GitHub source produced %s business signals", len(signals))
        return signals

    def _parse_response(self, data: Any, query: str) -> list[RawSignal]:
        items = data.get("items", [])
        signals: list[RawSignal] = []
        for item in items:
            title = (item.get("title") or "").strip()
            body = (item.get("body") or "").strip()[:800]
            html_url = item.get("html_url")
            repo = item.get("repository_url", "")
            repo_name = repo.split("/")[-1] if repo else "unknown"
            org = repo.split("/")[-2] if repo else "unknown"
            labels = [l.get("name", "").lower() for l in item.get("labels", [])]
            author = item.get("user", {}).get("login")
            author_url = item.get("user", {}).get("html_url")
            created = item.get("created_at")

            signal = RawSignal(
                source="github",
                source_type="issue",
                title=title,
                content=body,
                author=author,
                author_url=author_url,
                url=html_url,
                created_at=created,
                engagement={
                    "comments": item.get("comments", 0),
                    "score": self._score_for_labels(labels),
                },
                metadata={
                    "repo": repo_name,
                    "organization": org,
                    "labels": labels,
                    "state": item.get("state"),
                    "query": query,
                },
            )
            signals.append(signal)
        return signals

    @staticmethod
    def _score_for_labels(labels: list[str]) -> int:
        return sum(5 for lbl in labels if lbl in HIGH_VALUE_LABELS)
