from __future__ import annotations


INTENT_TERMS = ["need", "looking for", "hiring"]
ROLE_TERMS = ["developer", "freelancer", "engineer"]
URGENCY_TERMS = ["urgent", "asap", "budget"]


def _compact(value: str) -> str:
    return " ".join(value.split()).strip()


def _quoted_or(values: list[str]) -> str:
    return "(" + " OR ".join(f'"{value}"' for value in values) + ")"


def _simple_intent() -> str:
    """Plain text version without OR/quote operators for Reddit and DDG."""
    return "need developer freelancer urgent asap budget"


def build_query_plan(query: str) -> dict[str, str]:
    base_query = _compact(query)
    simple_intent = _simple_intent()

    if base_query:
        combined_query = f"{base_query} {simple_intent}"
    else:
        combined_query = simple_intent

    # Serper query is more structured but avoids complex nested quotes.
    serper_query = (
        f"{base_query} "
        "need developer freelancer hire hiring urgent asap budget"
        if base_query else
        "need developer freelancer hire hiring urgent asap budget"
    )

    return {
        "base": base_query,
        "high_intent": combined_query,
        # Reddit/HackerNews/DDG work best with plain-text queries.
        "reddit": combined_query,
        "hackernews": combined_query,
        "search": combined_query,
        # Serper can handle site-scoped operators.
        "serper": f"site:reddit.com OR site:news.ycombinator.com {serper_query}",
    }
