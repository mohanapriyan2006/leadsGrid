# PitchPilot Backend

FastAPI microservice for Agent Mode execution, lead discovery, AI planning, and email orchestration.

## Structure

```text
backend/
  app/
    api/
    core/
    firebase/
    modules/
      processors/
      sources/
    schemas/
    services/
    main.py
  docs/
  tests/
  requirements.txt
```

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

## Core Endpoints

- `GET /api/health`
- `GET /api/health/ready`
- `POST /api/agent/plan`
- `POST /api/agent/execute`
- `POST /api/agent/run`
- `GET /api/agent/discover?query=...`

## Notes

- Ask Mode remains frontend-direct AI by design.
- Agent Mode is now backend-executable through `/api/agent/*` endpoints.
- Firebase and SMTP operate in graceful simulated mode when not configured.
