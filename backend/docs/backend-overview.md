# Backend Overview

## Goal
Provide a modular FastAPI service that executes Agent Mode actions in the backend while keeping Ask Mode lightweight in frontend.

## Modules

- `app/api`: HTTP contracts and routing.
- `app/core`: config, logging, error handling, auth dependency.
- `app/modules/sources`: source connectors (Reddit, HackerNews, search fallback).
- `app/modules/processors`: clean, score, dedupe pipeline.
- `app/services`: aggregator, AI router, executor, email.
- `app/firebase`: Firebase auth and persistence adapter.

## Agent Lifecycle

1. Frontend asks for plan via `POST /api/agent/plan`.
2. User approves plan in UI.
3. Frontend executes step-by-step via `POST /api/agent/execute` or full run via `POST /api/agent/run`.
4. Backend discovers leads, scores, persists, drafts outreach, and schedules follow-ups.

## Extension Points

- Replace heuristic AI planner in `app/services/ai_router.py` with live model providers.
- Add additional connectors under `app/modules/sources`.
- Add queue workers for long-running execution and retries.
