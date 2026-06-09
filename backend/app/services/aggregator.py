import asyncio
import hashlib
import json
from time import monotonic

import httpx

from app.core.config import get_settings
from app.modules.processors.cleaner import clean_records
from app.modules.processors.deduplicator import dedupe_records
from app.modules.processors.query_builder import build_query_plan
from app.modules.processors.scorer import score_records
from app.modules.processors.verifier import verify_records
from app.modules.sources.google_search import fetch_google_like_search
from app.modules.sources.hackernews import fetch_hackernews
from app.modules.sources.reddit import fetch_reddit
from app.modules.sources.serper import fetch_serper
from app.services.lead_discovery_pipeline import lead_discovery_pipeline


class LeadAggregator:
    def __init__(self, source_limit: int = 20, timeout_seconds: int = 15):
        self.source_limit = source_limit
        self.timeout_seconds = timeout_seconds
        self.settings = get_settings()
        self._cache: dict[str, tuple[float, list[dict]]] = {}
        self._http_client = httpx.AsyncClient(
            timeout=self.timeout_seconds,
            limits=httpx.Limits(
                max_connections=self.settings.http_max_connections,
                max_keepalive_connections=self.settings.http_max_keepalive_connections,
            ),
        )

    async def aclose(self) -> None:
        await self._http_client.aclose()

    def _cache_key(self, query_plan: dict[str, str]) -> str:
        payload = json.dumps(query_plan, sort_keys=True)
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    def _cache_get(self, key: str) -> list[dict] | None:
        item = self._cache.get(key)
        if not item:
            return None
        expires_at, cached = item
        if monotonic() >= expires_at:
            self._cache.pop(key, None)
            return None
        return list(cached)

    def _cache_set(self, key: str, value: list[dict]) -> None:
        if len(self._cache) >= self.settings.discovery_cache_max_entries:
            # Evict one oldest entry by expiry time to keep memory bounded.
            oldest_key = min(self._cache, key=lambda existing: self._cache[existing][0])
            self._cache.pop(oldest_key, None)
        expires_at = monotonic() + self.settings.discovery_cache_ttl_seconds
        self._cache[key] = (expires_at, list(value))

    async def discover(self, query: str) -> list[dict]:
        query_plan = build_query_plan(query)
        cache_key = self._cache_key(query_plan)
        cached = self._cache_get(cache_key)
        if cached is not None:
            return cached

        semaphore = asyncio.Semaphore(max(1, self.settings.source_fetch_concurrency))

        async def _with_semaphore(coro):
            async with semaphore:
                return await coro

        try:
            results = await asyncio.wait_for(
                asyncio.gather(
                    _with_semaphore(
                        fetch_reddit(query_plan["reddit"], self.source_limit, self.timeout_seconds, self._http_client)
                    ),
                    _with_semaphore(
                        fetch_hackernews(
                            query_plan["hackernews"],
                            self.source_limit,
                            self.timeout_seconds,
                            self._http_client,
                        )
                    ),
                    _with_semaphore(
                        fetch_google_like_search(
                            query_plan["search"],
                            self.source_limit,
                            self.timeout_seconds,
                            self._http_client,
                        )
                    ),
                    _with_semaphore(
                        fetch_serper(query_plan["serper"], self.source_limit, self.timeout_seconds, self._http_client)
                    ),
                    return_exceptions=True,
                ),
                timeout=self.settings.discovery_global_timeout_seconds,
            )
        except asyncio.TimeoutError:
            results = []

        merged: list[dict] = []
        for result in results:
            if isinstance(result, Exception):
                continue
            merged.extend(result)

        cleaned = clean_records(merged)
        deduped = dedupe_records(cleaned)
        scored = score_records(deduped, query_plan["high_intent"])
        verified = verify_records(scored, max_age_days=self.settings.max_lead_age_days)

        base_results = verified if verified else scored
        base_results = sorted(base_results, key=lambda item: float(item.get("score") or 0), reverse=True)

        # Run 3-stage AI pipeline on top candidates (batched, max 10 to stay within timeout)
        pipeline_candidates = base_results[:10]
        enriched = await self._enrich_with_pipeline(pipeline_candidates)

        # Merge enriched records back into the full result set
        enriched_by_content: dict[str, dict] = {}
        for r in enriched:
            key = f"{r.get('title', '')}{r.get('content', '')}"[:200]
            enriched_by_content[key] = r

        final_results: list[dict] = []
        for item in base_results:
            key = f"{item.get('title', '')}{item.get('content', '')}"[:200]
            if key in enriched_by_content:
                final_results.append(enriched_by_content[key])
            else:
                final_results.append(item)

        self._cache_set(cache_key, final_results)
        return final_results

    async def _enrich_with_pipeline(self, candidates: list[dict]) -> list[dict]:
        """Run the 3-stage pipeline with a tight timeout. Fallback gracefully."""
        if not candidates:
            return []

        # Add freshness_hours estimate from created_at
        from datetime import datetime, timezone
        pipeline_inputs: list[dict] = []
        for item in candidates:
            freshness_hours = 1.0
            created = item.get("created_at")
            if created:
                try:
                    dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
                    freshness_hours = max(0.0, (datetime.now(timezone.utc) - dt).total_seconds() / 3600)
                except ValueError:
                    pass
            pipeline_inputs.append({
                "source": item.get("platform", "unknown"),
                "title": item.get("title", ""),
                "content": item.get("content", ""),
                "comments": "",
                "author": item.get("author", "Unknown"),
                "engagement_upvotes": item.get("upvotes", 0),
                "freshness_hours": freshness_hours,
                "permalink": item.get("url"),
                "created_at": item.get("created_at"),
                "score": item.get("score"),
            })

        try:
            # Reserve ~8 seconds for pipeline; if exceeded return keyword-only results
            enriched = await asyncio.wait_for(
                lead_discovery_pipeline.run_pipeline_batch(pipeline_inputs),
                timeout=8.0,
            )
        except Exception:
            # Pipeline failed or timed out — return keyword-scored candidates
            return candidates

        # Convert EnrichedLeadRecord back to plain dict and merge legacy fields
        results: list[dict] = []
        for rec in enriched:
            d = rec.model_dump()
            # Map back to legacy field names expected by frontend
            d["platform"] = d.get("source", "unknown")
            d["url"] = d.get("permalink")
            d["upvotes"] = d.get("engagement_upvotes", 0)
            # Use lead_score as the primary score for UI sorting
            d["score"] = d.get("lead_score", 0) if d.get("ai_enriched") else d.get("raw_score", 0)
            results.append(d)

        return results
