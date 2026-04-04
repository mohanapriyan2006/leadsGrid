def _contains_any(text: str, keywords: list[str]) -> bool:
    lower = text.lower()
    return any(keyword in lower for keyword in keywords)


def score_records(records: list[dict], query: str) -> list[dict]:
    tokens = [token for token in query.lower().split() if len(token) > 2]
    negative_keywords = ["tutorial", "course", "job opening", "hiring only", "student"]
    urgency_keywords = ["urgent", "asap", "today", "immediately"]
    hiring_keywords = ["looking for", "need", "hire", "hiring", "freelancer", "developer"]
    budget_keywords = ["budget", "$", "usd", "payment", "paid"]
    founder_keywords = ["founder", "cofounder", "ceo"]

    scored: list[dict] = []
    for item in records:
        title = (item.get("title") or "").lower()
        summary = (item.get("summary") or "").lower()
        content = (item.get("content") or "").lower()
        combined = f"{title} {summary} {content}".strip()

        score = 0.0

        urgency = 30 if _contains_any(combined, urgency_keywords) else 0
        hiring_intent = 25 if _contains_any(combined, hiring_keywords) else 0
        budget_signal = 20 if _contains_any(combined, budget_keywords) else 0
        founder_signal = 15 if _contains_any(combined, founder_keywords) else 0
        engagement = min(int(item.get("upvotes") or 0) * 0.5, 10)

        score += urgency + hiring_intent + budget_signal + founder_signal + engagement

        match_boost = sum(2.5 for token in tokens if token in combined)
        score += min(match_boost, 15)

        if _contains_any(combined, negative_keywords):
            score -= 20

        score = max(1.0, min(score, 100.0))

        scored.append(
            {
                **item,
                "score": round(score, 2),
                "score_explanation": {
                    "urgency": urgency,
                    "hiring_intent": hiring_intent,
                    "budget_signals": budget_signal,
                    "founder_role": founder_signal,
                    "engagement": engagement,
                },
            }
        )

    return scored
