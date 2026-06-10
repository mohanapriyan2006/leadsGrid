from __future__ import annotations

import math

from app.services.discovery_engine.models import RawSignal


AUTHORITY_WEIGHTS = {
    "Founder": 20,
    "CEO": 20,
    "CTO": 20,
    "Co-Founder": 20,
    "VP": 18,
    "Director": 16,
    "Manager": 12,
    "Team Lead": 10,
    "Developer": 6,
    "Employee": 5,
    "Student": 2,
    "Unknown": 5,
}

INTENT_CATEGORY_WEIGHTS = {
    "HIRING_NOW": 40,
    "SERVICE_NEEDED": 38,
    "BUYING_SOFTWARE": 35,
    "TOOL_SWITCHING": 32,
    "OPERATIONAL_PAIN": 30,
    "UNKNOWN": 10,
    "DROPPED": 0,
}


def score_opportunity(
    signal: RawSignal,
    classification: dict,
) -> dict:
    """Compute multi-signal opportunity score (0-100) and priority bucket."""
    text = signal.full_text().lower()
    engagement = signal.engagement

    # --- Intent score (0-40) ---
    intent_score = INTENT_CATEGORY_WEIGHTS.get(classification.get("lead_category", "UNKNOWN"), 10)
    intent_conf = classification.get("intent_confidence", 0.5)
    intent_score = int(intent_score * (0.5 + 0.5 * intent_conf))

    # --- Authority score (0-20) ---
    auth_level = classification.get("authority_level", "Unknown")
    auth_conf = classification.get("authority_confidence", 30)
    authority_score = int(AUTHORITY_WEIGHTS.get(auth_level, 5) * (auth_conf / 100))

    # --- Budget score (0-15) ---
    budget_score = 12 if classification.get("has_budget_signal") else 5
    if any(t in text for t in ["budget", "$", "rate", "quote", "estimate", "paid"]):
        budget_score += 3
    budget_score = min(15, budget_score)

    # --- Urgency score (0-15) ---
    urgency_score = 12 if classification.get("has_urgency_signal") else 5
    if any(t in text for t in ["urgent", "asap", "immediately", "critical", "blocking", "deadline"]):
        urgency_score += 3
    urgency_score = min(15, urgency_score)

    # --- Reachability score (0-10) ---
    reachability = 3
    if signal.author_url:
        reachability += 3
    if signal.author:
        reachability += 2
    if signal.url and "github.com" in signal.url:
        reachability += 2
    reachability = min(10, reachability)

    # --- Engagement bonus (0-5) ---
    engagement_bonus = 0
    upvotes = int(engagement.get("upvotes", 0))
    views = int(engagement.get("views", 0))
    answers = int(engagement.get("answers", 0))
    if upvotes >= 10:
        engagement_bonus += 2
    if views >= 100:
        engagement_bonus += 2
    if answers >= 2:
        engagement_bonus += 1

    total = intent_score + authority_score + budget_score + urgency_score + reachability + engagement_bonus
    total = max(0, min(100, total))

    priority = _priority_bucket(total)

    return {
        "opportunity_score": total,
        "intent_score": intent_score,
        "authority_score": authority_score,
        "budget_score": budget_score,
        "urgency_score": urgency_score,
        "reachability_score": reachability,
        "engagement_bonus": engagement_bonus,
        "priority": priority,
    }


def _priority_bucket(score: int) -> str:
    if score >= 90:
        return "CRITICAL"
    if score >= 75:
        return "HOT"
    if score >= 60:
        return "HIGH"
    if score >= 40:
        return "MEDIUM"
    return "LOW"
