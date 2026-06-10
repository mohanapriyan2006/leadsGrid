from __future__ import annotations

import logging
import re

from app.services.discovery_engine.models import RawSignal

logger = logging.getLogger(__name__)

# Intent patterns with weights
INTENT_PATTERNS: dict[str, list[str]] = {
    "HIRING_NOW": [
        r"\bhire\b",
        r"\bhiring\b",
        r"\blooking for (a|an|some)\b",
        r"\bneed (someone|a developer|an engineer|a contractor)\b",
        r"\bseeking (a|an)\b",
        r"\brecruiting\b",
        r"\bopen position\b",
    ],
    "SERVICE_NEEDED": [
        r"\bfreelancer\b",
        r"\bagency\b",
        r"\bconsultant\b",
        r"\bdeveloper needed\b",
        r"\bneed (a|an) (dev|developer|engineer)\b",
        r"\boutsourc\w*\b",
        r"\bcontractor\b",
    ],
    "BUYING_SOFTWARE": [
        r"\brecommendation\b",
        r"\balternative to\b",
        r"\blooking for (a|an)? (tool|software|platform|solution)\b",
        r"\bwhat (is|are) the best\b",
        r"\bswitch to\b",
        r"\bevaluating\b",
    ],
    "OPERATIONAL_PAIN": [
        r"\bbroken\b",
        r"\bfailing\b",
        r"\bfrustrated\b",
        r"\bissue\b",
        r"\bproblem\b",
        r"\bstuck\b",
        r"\bcan.?t (get|make|do)\b",
        r"\bproduction (outage|down|error)\b",
        r"\bworkflow (broken|issue|problem)\b",
    ],
    "TOOL_SWITCHING": [
        r"\bmigrat\w*\b",
        r"\bswitch\w* (from|to)\b",
        r"\breplac\w*\b",
        r"\bmoving (from|to|away from)\b",
        r"\btransition\w* (from|to)\b",
    ],
}

AUTHORITY_PATTERNS: dict[str, list[str]] = {
    "Founder": [r"\bfounder\b", r"\bco-founder\b", r"\bstarted (a|the) company\b"],
    "CEO": [r"\bceo\b", r"\bchief executive\b"],
    "CTO": [r"\bcto\b", r"\bchief technology\b"],
    "Manager": [r"\bmanager\b", r"\bhead of\b", r"\blead\b", r"\bdirector\b"],
    "Developer": [r"\bdeveloper\b", r"\bengineer\b", r"\bprogrammer\b"],
}

# Budget / urgency signals
BUDGET_TERMS = frozenset(["budget", "paid", "$", "freelancer", "agency", "consultant", "contract", "rate", "quote", "estimate"])
URGENCY_TERMS = frozenset(["urgent", "asap", "immediately", "today", "deadline", "stuck", "frustrated", "critical", "blocking"])

# Drop terms (must NOT be present for a signal to be actionable)
DROP_TERMS = frozenset([
    "student", "tutorial", "course", "learning", "bootcamp",
    "job seeker", "resume", "portfolio review", "homework",
    "exam", "assignment", "beginner guide", "getting started",
    "how do i learn", "should i learn", "career change", "interview prep",
])


def classify_signal(signal: RawSignal) -> dict:
    text = signal.full_text().lower()

    # Pre-filter: drop educational / career-change content
    if any(term in text for term in DROP_TERMS):
        return {
            "is_actionable": False,
            "lead_category": "DROPPED",
            "drop_reason": "Contains educational/career-change terms",
            "intent_confidence": 0.0,
        }

    # Detect lead category
    best_category = "UNKNOWN"
    best_score = 0
    for category, patterns in INTENT_PATTERNS.items():
        score = 0
        for pattern in patterns:
            matches = len(re.findall(pattern, text))
            score += matches * 1.5
        if score > best_score:
            best_score = score
            best_category = category

    # Detect authority level
    best_authority = "Unknown"
    best_auth_score = 0
    for authority, patterns in AUTHORITY_PATTERNS.items():
        score = 0
        for pattern in patterns:
            if re.search(pattern, text):
                score += 1
        if score > best_auth_score:
            best_auth_score = score
            best_authority = authority

    # Budget and urgency detection
    has_budget = any(term in text for term in BUDGET_TERMS)
    has_urgency = any(term in text for term in URGENCY_TERMS)

    is_actionable = best_score >= 1.5 or best_auth_score > 0 or has_budget or has_urgency
    if not is_actionable:
        return {
            "is_actionable": False,
            "lead_category": "DROPPED",
            "drop_reason": "No business intent signals detected",
            "intent_confidence": 0.0,
        }

    return {
        "is_actionable": True,
        "lead_category": best_category,
        "intent_confidence": min(1.0, best_score / 5.0),
        "authority_level": best_authority,
        "authority_confidence": min(100, best_auth_score * 30 + 30),
        "has_budget_signal": has_budget,
        "has_urgency_signal": has_urgency,
    }
