# leadsGrid Backend

FastAPI API gateway and core services for the leadsGrid SaaS platform.

## Tech Stack
- FastAPI
- Pydantic Settings
- SQLAlchemy (base setup)
- JWT auth (`python-jose`)
- Password hashing (`passlib` + bcrypt)
- Redis client (for upcoming cache/queue integration)

## Current Capabilities
- Modular API routing:
  - `/api/auth`
  - `/api/leads`
  - `/api/ai`
  - `/api/crm`
- JWT signup/login/me flow
- Lead pipeline skeleton (fetch -> score -> store)
- Multi-provider AI service fallback skeleton:
  - Gemini (primary)
  - Groq (fallback)
  - OpenRouter (fallback)
- CRM status update/read endpoints
- Worker entrypoints for async-style orchestration
- Central exception handler with structured logging

## Project Structure

```text
backend/
  app/
    api/
      router.py
      routes/
    core/
      config.py
      security.py
      database.py
      dependencies.py
    models/
    repositories/
    schemas/
    services/
    workers/
    main.py
  docs/
  requirements.txt
```

## Setup

1. Create and activate virtual environment:

```bash
python -m venv .venv
.venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. (Optional) Create `.env` in `backend/`:

```env
APP_ENV=development
SECRET_KEY=change-me-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=120
DATABASE_URL=sqlite:///./leadsgrid.db
REDIS_URL=redis://localhost:6379/0
CORS_ORIGINS=["http://localhost:5173"]
GEMINI_API_KEY=
GROQ_API_KEY=
OPENROUTER_API_KEY=
```

## Run

From `backend/`:

```bash
uvicorn app.main:app --reload --port 8000
```

Health check:
- `GET http://localhost:8000/health`

Docs:
- `http://localhost:8000/docs`

## Validation

```bash
python -m compileall app
```

## Tests

```bash
set PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 && pytest -q
```

## API Notes
- Most feature endpoints are protected and require `Authorization: Bearer <token>`.
- Use `/api/auth/signup` or `/api/auth/login` first to obtain access token.

## Next Implementation Steps
- Replace in-memory repositories with PostgreSQL persistence
- Add Celery + Redis worker queue
- Add repository/service tests
- Implement real Reddit source ingestion
