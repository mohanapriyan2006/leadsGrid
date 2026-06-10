from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any

import httpx

from app.core.config import get_settings
from app.services.discovery_engine.cache import DiscoveryCache
from app.services.discovery_engine.deduplicator import deduplicate_signals
from app.services.discovery_engine.models import EnrichedLead, RawSignal
from app.services.discovery_engine.opportunity_scorer import score_opportunity
from app.services.discovery_engine.query_expander import expand_query
from app.services.discovery_engine.rate_limiter import SourceRateLimiter
from app.services.discovery_engine.signal_classifier import classify_signal
from app.services.discovery_engine.sources.devto_source import DevtoSource
from app.services.discovery_engine.sources.gdelt_source import GdeltSource
from app.services.discovery_engine.sources.github_source import GitHubSource
from app.services.discovery_engine.sources.hackernews_source import HackerNewsSource
from app.services.discovery_engine.sources.producthunt_source import ProductHuntSource
from app.services.discovery_engine.sources.reddit_source import RedditSource
from app.services.discovery_engine.sources.search_source import SearchSource
from app.services.discovery_engine.sources.stackexchange_source import StackExchangeSource

logger = logging.getLogger(__name__)


class LeadDiscoveryEngine:
    """Production-grade multi-source lead discovery engine.

    Flow:
    1. Expand user query into domain-specific variations
    2. Fetch from all sources concurrently (with rate limiting + cache)
    3. Pre-filter heuristics on each source
    4. Merge + deduplicate
    5. Classify intent + score opportunities
    6. (Optional) LLM enrich top candidates
    7. Return enriched leads
    """

    def __init__(self, source_limit: int = 20, timeout_seconds: int = 15):
        self.settings = get_settings()
        self.source_limit = source_limit
        self.timeout_seconds = timeout_seconds
        self.cache = DiscoveryCache(
            ttl_seconds=self.settings.discovery_cache_ttl_seconds,
            max_entries=self.settings.discovery_cache_max_entries,
        )
        self.rate_limiter = SourceRateLimiter()
        self._http_client = httpx.AsyncClient(
            timeout=self.timeout_seconds,
            limits=httpx.Limits(
                max_connections=self.settings.http_max_connections,
                max_keepalive_connections=self.settings.http_max_keepalive_connections,
            ),
        )
        self._sources = [
            GitHubSource(self.rate_limiter),
            HackerNewsSource(self.rate_limiter),
            StackExchangeSource(self.rate_limiter),
            SearchSource(self.rate_limiter),
            RedditSource(self.rate_limiter),
            DevtoSource(self.rate_limiter),
            ProductHuntSource(self.rate_limiter),
            GdeltSource(self.rate_limiter),
        ]

    async def aclose(self) -> None:
        await self._http_client.aclose()

    async def discover(self, query: str, limit: int = 20) -> list[dict]:
        """Discover leads from all sources, classify, score, dedupe, and return."""
        query_plan = expand_query(query)

        # Check cache
        cached = self.cache.get(query, limit)
        if cached is not None:
            return cached

        # Fetch from all sources concurrently, each with its own timeout
        semaphore = asyncio.Semaphore(max(1, self.settings.source_fetch_concurrency))

        async def _fetch_source(source):
            async with semaphore:
                if source.name == "github":
                    return await source.discover(query_plan.github_queries, self.source_limit, self._http_client)
                elif source.name == "hackernews":
                    return await source.discover(query_plan.hackernews_queries, self.source_limit, self._http_client)
                elif source.name == "stackexchange":
                    return await source.discover(query_plan.stackexchange_queries, self.source_limit, self._http_client)
                elif source.name == "search":
                    return await source.discover(query_plan.search_queries, self.source_limit, self._http_client)
                elif source.name == "reddit":
                    return await source.discover(query_plan.search_queries, self.source_limit, self._http_client)
                elif source.name == "devto":
                    return await source.discover(query_plan.search_queries, self.source_limit, self._http_client)
                elif source.name == "producthunt":
                    return await source.discover([], self.source_limit, self._http_client)
                elif source.name == "gdelt":
                    return await source.discover(query_plan.search_queries, self.source_limit, self._http_client)
                return []

        # Wrap each source in its own timeout so partial results are preserved
        tasks = []
        for src in self._sources:
            coro = _fetch_source(src)
            task = asyncio.create_task(asyncio.wait_for(coro, timeout=self.timeout_seconds))
            tasks.append(task)

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Log per-source counts
        for src, result in zip(self._sources, results):
            count = len(result) if not isinstance(result, Exception) else 0
            logger.info("Source %s returned %s business signals", src.name, count)

        # Merge all signals
        merged: list[RawSignal] = []
        for result in results:
            if isinstance(result, Exception):
                continue
            merged.extend(result)

        logger.info("Total merged signals: %s", len(merged))

        # Deduplicate
        deduped = deduplicate_signals(merged)
        logger.info("After dedupe: %s", len(deduped))

        # Classify + score each signal
        enriched_leads: list[EnrichedLead] = []
        for signal in deduped:
            classification = classify_signal(signal)
            if not classification["is_actionable"]:
                # Still create a lead but mark as dropped with original score
                lead = _raw_to_enriched(signal, classification)
                enriched_leads.append(lead)
                continue

            scores = score_opportunity(signal, classification)
            lead = _raw_to_enriched(signal, classification, scores)
            enriched_leads.append(lead)

        # Sort by opportunity score descending
        enriched_leads.sort(key=lambda l: l.opportunity_score, reverse=True)

        # Convert to legacy dict format
        final_results = [lead.model_dump_legacy() for lead in enriched_leads]

        self.cache.set(query, limit, final_results)
        logger.info("Final results: %s leads", len(final_results))
        return final_results


def _raw_to_enriched(
    signal: RawSignal,
    classification: dict,
    scores: dict | None = None,
) -> EnrichedLead:
    engagement = signal.engagement
    upvotes = int(engagement.get("upvotes", 0))
    views = int(engagement.get("views", 0))
    answers = int(engagement.get("answers", 0))
    comments = int(engagement.get("comments", 0))
    score_val = int(engagement.get("score", 0))

    # Base keyword score (legacy)
    base_score = upvotes + views // 100 + answers * 5 + comments + score_val

    if scores is None:
        return EnrichedLead(
            id=f"{signal.source}-{hash(signal.title) & 0xFFFFFFFF}",
            title=signal.title,
            summary=signal.content[:280],
            content=signal.content,
            platform=signal.source,
            score=float(base_score),
            upvotes=upvotes,
            url=signal.url,
            author=signal.author,
            created_at=signal.created_at,
            ai_enriched=False,
            ai_dropped=True,
            drop_reason=classification.get("drop_reason", "Unknown"),
            lead_category=classification.get("lead_category", "DROPPED"),
            is_actionable_lead=False,
            primary_problem=signal.content[:140] if signal.content else "No clear problem detected.",
            lead_score=base_score,
            raw_score=float(base_score),
            opportunity_score=0,
            metadata=signal.metadata,
        )

    return EnrichedLead(
        id=f"{signal.source}-{hash(signal.title) & 0xFFFFFFFF}",
        title=signal.title,
        summary=signal.content[:280],
        content=signal.content,
        platform=signal.source,
        score=float(scores["opportunity_score"]),
        upvotes=upvotes,
        url=signal.url,
        author=signal.author,
        created_at=signal.created_at,
        ai_enriched=True,
        ai_dropped=False,
        lead_category=classification.get("lead_category", "UNKNOWN"),
        is_actionable_lead=True,
        authority_level=classification.get("authority_level", "Unknown"),
        authority_confidence=classification.get("authority_confidence", 30),
        primary_problem=signal.content[:200] if signal.content else "Business pain point detected.",
        desired_outcome="Resolve the stated problem efficiently.",
        evidence=[f"Detected: {classification.get('lead_category', 'UNKNOWN')}"],
        lead_score=scores["opportunity_score"],
        priority=scores["priority"],
        raw_score=float(base_score),
        opportunity_score=scores["opportunity_score"],
        reachability_score=scores["reachability_score"],
        metadata=signal.metadata,
    )
