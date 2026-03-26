from uuid import uuid4

from app.repositories.lead_repository import lead_repository
from app.schemas.lead import Lead, LeadFetchRequest
from app.services.cache_service import cache_service
from app.services.reddit_service import reddit_service
from app.services.scoring_service import scoring_service
from app.utils.time import utc_now


class LeadService:
    def list_leads(self) -> list[Lead]:
        return lead_repository.list_leads()

    async def fetch_and_score(self, payload: LeadFetchRequest) -> list[Lead]:
        cache_key = f"leads:{payload.source}:{payload.query.lower()}:{payload.limit}"
        cached = cache_service.get_json(cache_key)
        if isinstance(cached, list) and cached:
            leads = [Lead.model_validate(item) for item in cached]
            lead_repository.save_leads(leads)
            return leads

        posts: list[dict]
        if payload.source == "reddit":
            posts = await reddit_service.search_posts(payload.query, payload.limit)
        else:
            posts = self._seed_posts(payload)

        leads: list[Lead] = []
        for post in posts[: payload.limit]:
            scoring = await scoring_service.score_content(post["content"])
            lead = Lead(
                id=str(uuid4()),
                source=payload.source,
                author=post.get("author", "unknown"),
                permalink=post.get("permalink"),
                content=post["content"],
                summary=scoring.summary,
                score=scoring.score,
                tags=scoring.tags,
                intent_label=scoring.intent_label,
                created_at=post.get("created_at", utc_now()),
            )
            leads.append(lead)

        lead_repository.save_leads(leads)
        cache_service.set_json(
            cache_key,
            [lead.model_dump(mode="json") for lead in leads],
            ttl_seconds=120,
        )
        return leads

    def _seed_posts(self, payload: LeadFetchRequest) -> list[dict]:
        return [
            {
                "author": "signal-feed",
                "permalink": None,
                "content": f"{payload.query}: looking for a faster way to automate outbound",
                "created_at": utc_now(),
            },
            {
                "author": "signal-feed",
                "permalink": None,
                "content": f"{payload.query}: frustrated with current CRM workflow",
                "created_at": utc_now(),
            },
            {
                "author": "signal-feed",
                "permalink": None,
                "content": f"{payload.query}: need better intent scoring for pipeline",
                "created_at": utc_now(),
            },
        ]


lead_service = LeadService()
