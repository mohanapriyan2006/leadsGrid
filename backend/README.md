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
- `POST /api/email/send`

## Email Sending (SMTP + User Identity)

The backend now uses SMTP as the delivery transport and keeps user identity in the sender label.

- `From`: `"<User Name> via LeadsGrid" <SMTP_EMAIL>`
- `Reply-To`: user email (from request payload/header)
- Mode: real SMTP when configured, simulated mode when credentials are missing.

Recommended Gmail SMTP setup:

1. Enable 2-Step Verification on the Gmail account.
2. Create an App Password for Mail.
3. Configure `.env`:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USE_STARTTLS=true
SMTP_EMAIL=yourgmail@gmail.com
SMTP_PASSWORD=your_16_char_app_password
SMTP_RATE_LIMIT_PER_MIN=20
SMTP_TIMEOUT_SECONDS=15
```

Notes:

- Gmail is good for development and low volume.
- For high-volume outreach SaaS, migrate to a transactional provider later.
- Add SPF, DKIM, and DMARC on your domain when moving to production sending domains.

`POST /api/email/send` supports both legacy and template-aware payloads:

- Legacy: `message`
- Preferred: `body_plain` with optional `body_html`
- Optional metadata: `template_id`, `primary_color`, `secondary_color`

## Notes

- Ask Mode remains frontend-direct AI by design.
- Agent Mode is now backend-executable through `/api/agent/*` endpoints.
- Firebase and SMTP operate in graceful simulated mode when not configured.
