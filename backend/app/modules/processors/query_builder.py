from __future__ import annotations


INTENT_TERMS = ["need", "looking for", "hiring"]
ROLE_TERMS = ["developer", "freelancer", "engineer"]
URGENCY_TERMS = ["urgent", "asap", "budget"]


def _compact(value: str) -> str:
    return " ".join(value.split()).strip()


def _quoted_or(values: list[str]) -> str:
    return "(" + " OR ".join(f'"{value}"' for value in values) + ")"


def build_query_plan(query: str) -> dict[str, str]:
    base_query = _compact(query)
    intent_query = f"{_quoted_or(INTENT_TERMS)} {_quoted_or(ROLE_TERMS)} {_quoted_or(URGENCY_TERMS)}"

    if base_query:
        combined_query = f"{base_query} {intent_query}"
    else:
        combined_query = intent_query

    return {
        "base": base_query,
        "high_intent": combined_query,
        # Native APIs should use intent-rich plain text queries.
        "reddit": combined_query,
        "hackernews": combined_query,
        "search": combined_query,
        # Serper benefits from source-scoped operators.
        "serper": f"site:reddit.com OR site:news.ycombinator.com {combined_query}",
    }
