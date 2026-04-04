def _contains_any(text: str, keywords: list[str]) -> bool:
    lower = text.lower()
    return any(keyword in lower for keyword in keywords)


def score_records(records: list[dict], query: str) -> list[dict]:
    tokens = [token for token in query.lower().split() if len(token) > 2]
    negative_keywords = ["tutorial", "course", "job opening", "hiring only"]

    scored: list[dict] = []
    for item in records:
        title = (item.get("title") or "").lower()
        summary = (item.get("summary") or "").lower()
        content = (item.get("content") or "").lower()

        score = float(item.get("score") or 0)
        score += min(int(item.get("upvotes") or 0) * 0.35, 25)

        match_boost = sum(5 for token in tokens if token in title or token in summary or token in content)
        score += min(match_boost, 35)

        if _contains_any(f"{title} {summary}", negative_keywords):
            score -= 20

        score = max(1.0, min(score, 100.0))

        scored.append({**item, "score": round(score, 2)})

    return scored
