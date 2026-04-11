from __future__ import annotations

from datetime import datetime, timedelta, timezone


REJECT_TERMS = ["student", "tutorial", "course", "learning"]
BUYING_TERMS = ["need", "looking for", "hire", "hiring", "help", "budget", "asap", "urgent"]


def _contains_any(text: str, tokens: list[str]) -> bool:
    lowered = text.lower()
    return any(token in lowered for token in tokens)


def _is_recent(iso_value: str | None, max_age_days: int) -> bool:
    if not iso_value:
        return True
    try:
        parsed = datetime.fromisoformat(iso_value.replace("Z", "+00:00"))
    except ValueError:
        return True
    cutoff = datetime.now(timezone.utc) - timedelta(days=max_age_days)
    return parsed >= cutoff


def verify_records(records: list[dict], max_age_days: int = 5) -> list[dict]:
    verified: list[dict] = []

    for item in records:
        text = " ".join(
            [
                str(item.get("title") or ""),
                str(item.get("summary") or ""),
                str(item.get("content") or ""),
            ]
        ).strip()

        if not text:
            continue
        if _contains_any(text, REJECT_TERMS):
            continue
        if not _contains_any(text, BUYING_TERMS):
            continue
        if not _is_recent(item.get("created_at"), max_age_days=max_age_days):
            continue

        verified.append(item)

    return verified
