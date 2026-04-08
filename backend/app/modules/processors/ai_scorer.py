from app.services.ai_prompts_service import ai_prompts_service


def _contains_any(text: str, keywords: list[str]) -> bool:
    lower = text.lower()
    return any(keyword in lower for keyword in keywords)


async def score_records_with_ai(records: list[dict], query: str) -> list[dict]:
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

    for item in scored:
        lead_text = f"{item.get('title', '')} {item.get('summary', '')} {item.get('content', '')}"
        if len(lead_text.strip()) > 10:
            try:
                validation = await ai_prompts_service.validate_lead(lead_text)
                if not validation.is_valid_lead:
                    item["score"] = max(1.0, item["score"] - 30)
                    item["ai_filtered"] = True
                    item["ai_filter_reason"] = validation.reason

                intent = await ai_prompts_service.analyze_intent(lead_text)
                item["ai_intent"] = intent.model_dump()
                item["score"] = round((item["score"] * 0.4) + (intent.score * 0.6), 2)
            except Exception:
                pass

    return sorted(scored, key=lambda item: float(item.get("score") or 0), reverse=True)
