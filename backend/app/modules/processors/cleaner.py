def _normalize_text(value: str | None) -> str:
    if not value:
        return ""
    return " ".join(value.split()).strip()


def clean_records(records: list[dict]) -> list[dict]:
    cleaned: list[dict] = []
    for item in records:
        title = _normalize_text(item.get("title"))
        summary = _normalize_text(item.get("summary"))
        content = _normalize_text(item.get("content") or summary)
        if not title and not summary:
            continue

        cleaned.append(
            {
                "id": item.get("id"),
                "title": title or summary[:80],
                "summary": summary,
                "content": content,
                "platform": (item.get("platform") or "unknown").lower(),
                "upvotes": int(item.get("upvotes") or 0),
                "url": item.get("url"),
                "author": item.get("author"),
                "score": float(item.get("score") or 0),
                "email": item.get("email"),
            }
        )

    return cleaned
