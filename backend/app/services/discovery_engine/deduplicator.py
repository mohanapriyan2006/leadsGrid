from __future__ import annotations

import re
from difflib import SequenceMatcher

from app.services.discovery_engine.models import RawSignal


def _normalize_url(url: str | None) -> str:
    if not url:
        return ""
    u = url.lower().split("?")[0].rstrip("/")
    u = re.sub(r"^https?://(www\.)?", "", u)
    return u


def _normalize_text(text: str) -> str:
    return re.sub(r"[^a-z0-9]", "", text.lower())


def _fingerprint(text: str) -> str:
    t = text.lower()
    t = re.sub(r"[^a-z0-9\s]", "", t)
    words = t.split()[:20]
    return " ".join(words)


def _similarity(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def deduplicate_signals(signals: list[RawSignal]) -> list[RawSignal]:
    """Deduplicate signals by URL, title similarity, and content fingerprint.
    Keeps the highest-scored duplicate."""
    kept: list[RawSignal] = []
    seen_urls: dict[str, RawSignal] = {}
    seen_titles: list[tuple[str, RawSignal]] = []
    seen_fps: list[tuple[str, RawSignal]] = []

    for sig in signals:
        url_key = _normalize_url(sig.url)
        title_norm = _normalize_text(sig.title)
        fp = _fingerprint(sig.content or sig.title)
        score = _signal_score(sig)

        # Exact URL match
        if url_key and url_key in seen_urls:
            existing = seen_urls[url_key]
            if score > _signal_score(existing):
                seen_urls[url_key] = sig
                # Replace in kept list
                for i, k in enumerate(kept):
                    if _normalize_url(k.url) == url_key:
                        kept[i] = sig
                        break
            continue

        # Title similarity match (>= 0.85)
        dup_title = False
        for t, existing in seen_titles:
            if _similarity(title_norm, t) >= 0.85:
                if score > _signal_score(existing):
                    # Replace existing
                    for i, k in enumerate(kept):
                        if k == existing:
                            kept[i] = sig
                            break
                    seen_titles = [(tt, ss) for tt, ss in seen_titles if ss != existing]
                    seen_titles.append((title_norm, sig))
                dup_title = True
                break
        if dup_title:
            continue

        # Content fingerprint similarity (>= 0.82)
        dup_fp = False
        for f, existing in seen_fps:
            if _similarity(fp, f) >= 0.82:
                if score > _signal_score(existing):
                    for i, k in enumerate(kept):
                        if k == existing:
                            kept[i] = sig
                            break
                    seen_fps = [(ff, ss) for ff, ss in seen_fps if ss != existing]
                    seen_fps.append((fp, sig))
                dup_fp = True
                break
        if dup_fp:
            continue

        # New unique signal
        kept.append(sig)
        if url_key:
            seen_urls[url_key] = sig
        seen_titles.append((title_norm, sig))
        seen_fps.append((fp, sig))

    return kept


def _signal_score(signal: RawSignal) -> float:
    engagement = signal.engagement
    score = 0.0
    score += min(10.0, int(engagement.get("upvotes", 0)) / 10.0)
    score += min(10.0, int(engagement.get("views", 0)) / 100.0)
    score += min(10.0, int(engagement.get("answers", 0)) * 2.0)
    score += min(10.0, int(engagement.get("comments", 0)) / 5.0)
    score += min(5.0, int(engagement.get("score", 0)))
    return score
