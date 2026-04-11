def _normalize_key(value: str | None) -> str:
    if not value:
        return ""
    return "".join(ch for ch in value.lower() if ch.isalnum())


def dedupe_records(records: list[dict]) -> list[dict]:
    deduped: list[dict] = []
    seen: set[str] = set()

    for item in records:
        url_key = _normalize_key(item.get("url"))
        title_key = _normalize_key(item.get("title"))
        platform_key = _normalize_key(item.get("platform"))

        dedupe_key = url_key or f"{title_key}:{platform_key}"
        if not dedupe_key or dedupe_key in seen:
            continue

        seen.add(dedupe_key)
        deduped.append(item)

    return deduped
