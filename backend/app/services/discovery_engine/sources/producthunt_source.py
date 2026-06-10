from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

import httpx

from app.core.config import get_settings
from app.services.discovery_engine.models import RawSignal
from app.services.discovery_engine.sources.base import DROP_TERMS, KEEP_TERMS, DiscoverySource

logger = logging.getLogger(__name__)

PH_GRAPHQL_URL = "https://api.producthunt.com/v2/api/graphql"

# GraphQL query to fetch recent posts with comments
PH_POSTS_QUERY = """
query {
  posts(first: 15) {
    edges {
      node {
        id
        name
        tagline
        description
        url
        votesCount
        commentsCount
        createdAt
        maker {
          name
          username
        }
        topics {
          edges {
            node {
              name
            }
          }
        }
      }
    }
  }
}
"""


class ProductHuntSource(DiscoverySource):
    name = "producthunt"

    async def discover(
        self,
        queries: list[str],
        limit: int,
        client: httpx.AsyncClient,
    ) -> list[RawSignal]:
        settings = get_settings()
        token = getattr(settings, "producthunt_api_token", None)
        if not token:
            logger.info("Product Hunt API token not configured; skipping")
            return []

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
        try:
            response = await client.post(
                PH_GRAPHQL_URL,
                json={"query": PH_POSTS_QUERY},
                headers=headers,
                timeout=15,
            )
            response.raise_for_status()
            data = response.json()
        except Exception as exc:
            logger.warning("Product Hunt fetch failed: %s", exc)
            return []

        signals = self._parse_response(data, "recent_posts")
        business_signals: list[RawSignal] = []
        for s in signals:
            if self._is_business_signal(s):
                business_signals.append(s)
                if len(business_signals) >= limit:
                    break
        logger.info("Product Hunt source produced %s business signals", len(business_signals))
        return business_signals

    def _parse_response(self, data: Any, query: str) -> list[RawSignal]:
        signals: list[RawSignal] = []
        posts = data.get("data", {}).get("posts", {}).get("edges", [])
        for edge in posts:
            node = edge.get("node", {})
            title = (node.get("name") or "").strip()
            tagline = (node.get("tagline") or "").strip()
            description = (node.get("description") or "").strip()[:600]
            content = f"{tagline}\n{description}".strip()
            if not title:
                continue
            maker = node.get("maker", {})
            author = maker.get("name") or maker.get("username")
            created = node.get("createdAt")
            topics = [
                t.get("node", {}).get("name", "")
                for t in node.get("topics", {}).get("edges", [])
            ]

            signal = RawSignal(
                source="producthunt",
                source_type="launch",
                title=title,
                content=content,
                author=author,
                url=node.get("url"),
                created_at=created,
                engagement={
                    "upvotes": int(node.get("votesCount", 0) or 0),
                    "comments": int(node.get("commentsCount", 0) or 0),
                },
                metadata={
                    "topics": topics,
                    "query": query,
                    "post_id": node.get("id"),
                    "maker_present": bool(maker),
                },
            )
            signals.append(signal)
        return signals

    def _is_business_signal(self, signal: RawSignal) -> bool:
        text = signal.full_text().lower()
        if any(term in text for term in DROP_TERMS):
            return False
        topics = [t.lower() for t in signal.metadata.get("topics", [])]
        # Product Hunt launches are inherently business-oriented;
        # only drop obvious spam and low-engagement noise
        decent_engagement = signal.engagement.get("upvotes", 0) >= 3
        has_business = any(term in text for term in KEEP_TERMS)
        return has_business or decent_engagement
