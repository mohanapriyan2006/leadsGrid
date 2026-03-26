from datetime import datetime, timezone

import httpx


class RedditService:
    async def search_posts(self, query: str, limit: int) -> list[dict]:
        url = "https://www.reddit.com/r/all/search.json"
        params = {
            "q": query,
            "limit": limit,
            "sort": "new",
            "restrict_sr": "false",
        }
        headers = {
            "User-Agent": "PitchPilot/0.1 (+https://pitchpilot.local)",
        }

        async with httpx.AsyncClient(timeout=12.0) as client:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            payload = response.json()

        children = payload.get("data", {}).get("children", [])
        posts: list[dict] = []
        for item in children:
            data = item.get("data", {})
            created_utc = data.get("created_utc")
            if created_utc is None:
                created_at = datetime.now(timezone.utc)
            else:
                created_at = datetime.fromtimestamp(created_utc, tz=timezone.utc)

            title = data.get("title", "")
            body = data.get("selftext", "")
            posts.append(
                {
                    "id": data.get("id", ""),
                    "author": data.get("author", "unknown"),
                    "permalink": f"https://reddit.com{data.get('permalink', '')}",
                    "content": f"{title}. {body}".strip(),
                    "created_at": created_at,
                }
            )

        return [post for post in posts if post["content"]][:limit]


reddit_service = RedditService()
