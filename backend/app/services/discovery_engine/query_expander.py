from __future__ import annotations

from app.services.discovery_engine.models import QueryPlan

# Business-intent suffixes / phrases that convert a topic into a lead signal
INTENT_PHRASES = [
    "need help",
    "looking for",
    "hiring",
    "recommendation",
    "alternative to",
    "migration",
    "replace",
    "integration",
    "implementation",
    "consultant",
    "agency",
    "freelancer",
    "outsourcing",
    "budget",
    "stuck with",
    "frustrated with",
    "broken",
    "issue with",
    "problem with",
    "scaling",
    "production",
]

# Source-specific query templates
GITHUB_TEMPLATES = [
    '"need help" {topic} in:title,body',
    '"looking for" {topic} in:title,body',
    '"integration" OR "migration" {topic} in:title,body',
    '"consultant" OR "agency" {topic} in:title,body',
    '"implementation" {topic} in:title,body',
    '{topic} "help wanted"',
    '{topic} label:bug',
    '{topic} label:"help wanted"',
]

HN_TEMPLATES = [
    '{topic} hiring',
    '{topic} "looking for"',
    '{topic} "need help"',
    '{topic} outsourcing',
    '{topic} contractor',
    '{topic} freelancer',
    '{topic} agency',
    '{topic} "asap"',
    '{topic} "urgent"',
]

SE_TEMPLATES = [
    '{topic} "production issue"',
    '{topic} "scaling problem"',
    '{topic} "migration"',
    '{topic} "implementation blocker"',
    '{topic} "performance issue"',
]

SEARCH_TEMPLATES = [
    '{topic} "need help"',
    '{topic} "looking for"',
    '{topic} "hiring"',
    '{topic} "recommendation"',
    '{topic} "alternative to"',
    '{topic} "consultant"',
    '{topic} "agency"',
]


def _compact(value: str) -> str:
    return " ".join(value.split()).strip()


def expand_query(user_query: str) -> QueryPlan:
    base = _compact(user_query)

    # Generate intent-combined phrases
    variations: list[str] = []
    for phrase in INTENT_PHRASES:
        variations.append(f"{phrase} {base}")
    variations.append(base)

    # Deduplicate while preserving order
    seen = set()
    unique_variations: list[str] = []
    for v in variations:
        key = v.lower()
        if key not in seen:
            seen.add(key)
            unique_variations.append(v)

    github = [tpl.format(topic=base) for tpl in GITHUB_TEMPLATES]
    hackernews = [tpl.format(topic=base) for tpl in HN_TEMPLATES]
    stackexchange = [tpl.format(topic=base) for tpl in SE_TEMPLATES]
    search = [tpl.format(topic=base) for tpl in SEARCH_TEMPLATES]

    return QueryPlan(
        base_query=base,
        variations=unique_variations,
        github_queries=github,
        hackernews_queries=hackernews,
        stackexchange_queries=stackexchange,
        search_queries=search,
    )
