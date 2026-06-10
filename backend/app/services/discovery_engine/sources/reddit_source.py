from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

import httpx

from app.services.discovery_engine.models import RawSignal
from app.services.discovery_engine.sources.base import DROP_TERMS, KEEP_TERMS, DiscoverySource

logger = logging.getLogger(__name__)

REDDIT_SEARCH_URL = "https://old.reddit.com/search.json"
REDDIT_PUSHSHIFT_URL = "https://api.pullpush.io/reddit/search/submission"
REDDIT_USER_URL_TEMPLATE = "https://old.reddit.com/user/{username}/submitted.json"


class RedditSource(DiscoverySource):
    name = "reddit"

    async def discover(
        self,
        queries: list[str],
        limit: int,
        client: httpx.AsyncClient,
    ) -> list[RawSignal]:
        signals: list[RawSignal] = []
        per_query_limit = max(3, min(limit, 10))

        for query in queries:
            if len(signals) >= limit:
                break
            # Try PullPush (Pushshift mirror) first — no auth needed
            batch = await self._fetch_pullpush(query, per_query_limit, client)
            for s in batch:
                if self._is_business_signal(s):
                    signals.append(s)
                    if len(signals) >= limit:
                        break
            if len(signals) >= limit:
                break

            # Fallback: try old.reddit.com search
            batch = await self._fetch_reddit_json(query, per_query_limit, client)
            for s in batch:
                if self._is_business_signal(s):
                    signals.append(s)
                    if len(signals) >= limit:
                        break

        logger.info("Reddit source produced %s business signals", len(signals))
        return signals

    def _parse_response(self, data: Any, query: str) -> list[RawSignal]:
        """Dispatch to the correct parser based on response shape."""
        if not isinstance(data, dict):
            return []
        # PullShift format: {"data": [{"title": ...}, ...]}
        if "data" in data and isinstance(data.get("data"), list):
            return self._parse_pullpush(data, query)
        # Reddit JSON format: {"data": {"children": [...]}}
        if "data" in data and isinstance(data.get("data"), dict) and "children" in data["data"]:
            return self._parse_reddit_json(data, query)
        return []

    def _is_business_signal(self, signal: RawSignal) -> bool:
        text = signal.full_text().lower()
        if any(term in text for term in DROP_TERMS):
            return False
        # Reddit posts about hiring/help often have weak body text;
        # accept if title has business terms or post has engagement
        has_business = any(term in text for term in KEEP_TERMS)
        decent_engagement = signal.engagement.get("upvotes", 0) >= 1 or signal.engagement.get("comments", 0) >= 1
        return has_business or decent_engagement

    async def _fetch_pullpush(
        self,
        query: str,
        limit: int,
        client: httpx.AsyncClient,
    ) -> list[RawSignal]:
        params = {"q": query, "size": limit, "sort": "desc", "sort_type": "created_utc"}
        try:
            data = await self._fetch(client, "GET", REDDIT_PUSHSHIFT_URL, params=params)
        except Exception as exc:
            logger.debug("PullPush fetch failed: %s", exc)
            return []
        if not data:
            return []
        return self._parse_pullpush(data, query)

    def _parse_pullpush(self, data: dict, query: str) -> list[RawSignal]:
        signals: list[RawSignal] = []
        posts = data.get("data", [])
        for post in posts:
            title = (post.get("title") or "").strip()
            if not title:
                continue
            body = (post.get("selftext") or post.get("body") or "").strip()[:800]
            author = post.get("author")
            subreddit = post.get("subreddit")
            created_utc = post.get("created_utc")
            created = None
            if isinstance(created_utc, (int, float)):
                created = datetime.fromtimestamp(created_utc, tz=timezone.utc).isoformat()

            signal = RawSignal(
                source="reddit",
                source_type="post",
                title=title,
                content=body,
                author=author,
                url=f"https://reddit.com{post.get('permalink', '')}",
                created_at=created,
                engagement={
                    "upvotes": int(post.get("score", 0) or 0),
                    "comments": int(post.get("num_comments", 0) or 0),
                },
                metadata={
                    "subreddit": subreddit,
                    "query": query,
                    "post_id": post.get("id"),
                },
            )
            signals.append(signal)
        return signals

    async def _fetch_reddit_json(
        self,
        query: str,
        limit: int,
        client: httpx.AsyncClient,
    ) -> list[RawSignal]:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
            ),
            "Accept": "application/json",
        }
        params = {"q": query, "sort": "top", "limit": limit}
        try:
            response = await client.get(REDDIT_SEARCH_URL, params=params, headers=headers, timeout=15)
            response.raise_for_status()
            data = response.json()
        except Exception as exc:
            logger.debug("Reddit JSON fallback failed: %s", exc)
            return []
        return self._parse_reddit_json(data, query)

    def _parse_reddit_json(self, data: dict, query: str) -> list[RawSignal]:
        signals: list[RawSignal] = []
        children = data.get("data", {}).get("children", [])
        for item in children:
            post = item.get("data", {})
            title = (post.get("title") or "").strip()
            if not title:
                continue
            body = (post.get("selftext") or "").strip()[:800]
            created_utc = post.get("created_utc")
            created = None
            if isinstance(created_utc, (int, float)):
                created = datetime.fromtimestamp(created_utc, tz=timezone.utc).isoformat()
            permalink = post.get("permalink", "")

            signal = RawSignal(
                source="reddit",
                source_type="post",
                title=title,
                content=body,
                author=post.get("author"),
                url=f"https://reddit.com{permalink}" if permalink else post.get("url"),
                created_at=created,
                engagement={
                    "upvotes": int(post.get("ups", 0) or 0),
                    "comments": int(post.get("num_comments", 0) or 0),
                },
                metadata={
                    "subreddit": post.get("subreddit"),
                    "query": query,
                    "post_id": post.get("id"),
                },
            )
            signals.append(signal)
        return signals

    # ------------------------------------------------------------------
    # Author timeline (optional enrichment for high-value authors)
    # ------------------------------------------------------------------

    async def fetch_author_timeline(
        self,
        username: str,
        client: httpx.AsyncClient,
        max_posts: int = 10,
    ) -> list[RawSignal]:
        """Fetch recent submissions from a Reddit user to detect patterns."""
        url = REDDIT_USER_URL_TEMPLATE.format(username=username)
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
            ),
            "Accept": "application/json",
        }
        try:
            response = await client.get(url, headers=headers, params={"limit": max_posts}, timeout=10)
            response.raise_for_status()
            data = response.json()
        except Exception:
            return []
        return self._parse_reddit_json(data, f"user:{username}")
