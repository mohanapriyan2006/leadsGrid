# Backend Overview

## Architecture
Layered FastAPI architecture:
- API routes: transport and validation boundary
- Services: business workflows
- Repositories: persistence abstraction
- Workers: async pipeline entrypoints

## Current Modules
- Auth: JWT signup/login/me
- Leads: sync + async ingest/score pipeline
- AI: multi-provider fallback strategy
- CRM: status tracking lifecycle

## Next
- Replace in-memory repositories with PostgreSQL repositories
- Add Celery worker and Redis broker integration
- Add tests for scoring and AI fallback behavior
