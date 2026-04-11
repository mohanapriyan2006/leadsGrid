# PitchPilot / leadsGrid — Project Report

## Executive Summary

- Purpose: PitchPilot (a.k.a. leadsGrid) is a SaaS-style lead discovery and outreach platform combining multi-source lead aggregation, AI-driven scoring and planning, and execution (email/CRM handoff and agent workflows).
- Structure: Monorepo-style workspace with a FastAPI backend (`backend/`), React + TypeScript frontend (`frontend/`), and supporting `firebase-functions/`.
- Primary capabilities: lead discovery (multiple sources), AI plan generation & execution (Agent Mode), a Manage Leads UI (kanban/table), CSV import/mapping, and CRM handoff.

---

## Quick Facts

- Backend: Python + FastAPI (uvicorn), modular services (aggregator, ai_router, agent_executor, email_service).
- Frontend: React (TS) + Vite + Tailwind, React Router, React Query, Zustand, Framer Motion.
- Persistence / Infra: Firebase client integration exists; run state currently held in-memory (prototype). Cloud functions folder present.
- Tests: Basic FastAPI test coverage for health and agent run lifecycle (`backend/tests/test_health_and_agent.py`).

---

## Repo Layout (key folders)

- `backend/` — FastAPI service and AI/agent orchestration.
	- `app/main.py` — app bootstrap (service initialization, CORS, router).
	- `app/api/routes/agent.py` — agent endpoints: plan, execute, run lifecycle, discover.
	- `app/services/agent_run_service.py` — in-memory run orchestration (start, approve, skip, abort, advance steps).
	- `app/modules/` — `sources/` (google_search, hackernews, reddit) and `processors/` (cleaner, deduplicator, scorer).

- `frontend/` — React client and feature modules.
	- `src/app/router.tsx` — app routes, lazy-loaded pages, protected app shell.
	- `src/app/views/ManageLeadsPage.tsx` — Manage Leads UI (kanban + table, CSV import, DnD, modals).
	- `src/features/leads/` — components, hooks, services and feature-level docs.

- `firebase-functions/` — cloud functions scaffold (TypeScript).

---

## Architecture Overview

- Frontend calls backend API for agent workflows and lead operations. Backend is the primary orchestrator for Agent Mode.
- Data pipeline concept: Fetch (sources) → Clean → Deduplicate → Score → Persist / present to UI.
- AI layer: `ai_router` is designed to support multi-provider routing and fallback (Gemini / Groq / OpenRouter pattern described in docs).
- Agent orchestration: plan construction, step-by-step execution with human approval modes, and run lifecycle management.

---

## How to Run (developer quick-start)

Backend (Windows dev example):

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Frontend (dev):

```bash
cd frontend
npm install
# set VITE_API_BASE_URL in frontend/.env (e.g. VITE_API_BASE_URL=http://localhost:8000/api)
npm run dev
```

Tests (backend):

```bash
cd backend
# if pytest plugin autoload causes plugin errors, use:
set PYTEST_DISABLE_PLUGIN_AUTOLOAD=1
pytest -q
```

---

## Notable Files & Endpoints

- `backend/app/main.py` — app bootstrap, service wiring, CORS registration.
- `backend/app/api/routes/agent.py` —
	- `POST /api/agent/plan` → build plan
	- `POST /api/agent/execute` → execute single step
	- `POST /api/agent/run` → run plan end-to-end
	- `POST /api/agent/runs/start` and `GET /api/agent/runs/{run_id}` and approve/skip/abort endpoints
	- `GET /api/agent/discover?query=...`
- `backend/app/services/agent_run_service.py` — in-memory run lifecycle and step advancement.
- `frontend/src/app/views/ManageLeadsPage.tsx` — Kanban/table UI, DnD handling, CSV import flow, modals for lead actions.

---

## Strengths

- Clear separation of concerns and modular service design in backend (aggregator, AI router, executor).
- Agent orchestration includes approval flows (human-in-the-loop), skip, and abort controls—well suited for production workflows.
- Frontend UI is feature-rich: kanban + table views, CSV upload + mapping, hover modals, and polished UI components.
- Docs and engineering guidance (`AGENT-INSTRUCTION.md`, `PLAN.md`) show disciplined architecture and long-term strategy.

---

## Risks & Gaps

- Persistence: `AgentRunService` keeps run state in-memory — not durable across restarts. Needs DB/Redis.
- Background processing: long-running scraping or AI calls are synchronous patterns now — move to background workers (Celery/RQ) for scale.
- Authentication: frontend uses a development placeholder token; full JWT-based auth needs end-to-end wiring and protecting agent endpoints.
- Observability & rate-limiting: AI provider cost controls, rate limits, structured logging, and metrics are not yet formalized.

---

## Recommendations & Next Steps (prioritized)

1. Persist agent run state to Redis or a small DB table and add TTL / archival.
2. Wire production auth: implement JWT issuance and enforce `get_current_user` for agent APIs; replace dev placeholder in frontend `AuthProvider`.
3. Introduce background workers (Celery + Redis) for scraping and heavy AI jobs; expose task status via run endpoints or websockets.
4. Add provider controls in `ai_router`: retry/backoff, rate limiting, cost tracking, and graceful fallback.
5. Expand tests: unit tests for `AgentExecutor`, aggregator mocks for source adapters, and integration tests for run lifecycle with persistent store.

---

## Suggested Roadmap (3 sprints)

- Sprint 1 (MVP hardening): persist runs, implement auth, add simple metric/logging.
- Sprint 2 (reliability): background worker integration, durable job queues, and retry logic.
- Sprint 3 (scale & product): provider cost controls, webhooks/websockets for run progress, pagination and rate-limits on discovery.

---

## Quick Reference

- Backend start: `uvicorn app.main:app --reload --port 8000`
- Frontend start: `npm run dev` (in `frontend/`)
- Env: `VITE_API_BASE_URL` must be prefixed with `VITE_` for client access.

---

## Appendix: Testing notes

- Backend tests exist for endpoints and run lifecycle: `backend/tests/test_health_and_agent.py`.
- Local pytest may require `PYTEST_DISABLE_PLUGIN_AUTOLOAD=1` to avoid pytest-flask plugin errors (see workspace debugging notes).

---

