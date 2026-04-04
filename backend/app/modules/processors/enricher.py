from __future__ import annotations

import logging
from urllib.parse import urlparse

import httpx

from app.core.config import Settings

logger = logging.getLogger(__name__)


def _extract_domain(value: str | None) -> str | None:
    if not value:
        return None
    try:
        parsed = urlparse(value)
        host = parsed.netloc.lower().strip()
        return host or None
    except Exception:
        return None


async def _enrich_with_hunter(domain: str, settings: Settings, timeout: int) -> dict:
    if not settings.hunter_api_key:
        return {}

    url = "https://api.hunter.io/v2/domain-search"
    params = {"domain": domain, "api_key": settings.hunter_api_key}

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            payload = response.json().get("data", {})
    except Exception as exc:
        logger.warning("Hunter enrichment failed for %s: %s", domain, exc)
        return {}

    emails = payload.get("emails") or []
    first = emails[0] if emails else {}
    return {
        "email": first.get("value"),
        "company": payload.get("organization"),
    }


async def _enrich_with_clearbit(domain: str, settings: Settings, timeout: int) -> dict:
    if not settings.clearbit_api_key:
        return {}

    url = "https://company.clearbit.com/v2/companies/find"
    headers = {"Authorization": f"Bearer {settings.clearbit_api_key}"}
    params = {"domain": domain}

    try:
        async with httpx.AsyncClient(timeout=timeout, headers=headers) as client:
            response = await client.get(url, params=params)
            if response.status_code >= 400:
                return {}
            payload = response.json()
    except Exception as exc:
        logger.warning("Clearbit enrichment failed for %s: %s", domain, exc)
        return {}

    return {
        "company": payload.get("name"),
        "category": (payload.get("category") or {}).get("industry"),
    }


async def enrich_records(records: list[dict], settings: Settings, timeout_seconds: int = 15) -> list[dict]:
    enriched: list[dict] = []

    for item in records:
        domain = _extract_domain(item.get("url"))
        if not domain:
            enriched.append(item)
            continue

        hunter = await _enrich_with_hunter(domain, settings, timeout_seconds)
        clearbit = await _enrich_with_clearbit(domain, settings, timeout_seconds)

        merged = {
            **item,
            "email": item.get("email") or hunter.get("email"),
            "company": clearbit.get("company") or hunter.get("company") or item.get("company"),
            "category": clearbit.get("category") or item.get("category"),
        }
        enriched.append(merged)

    return enriched
