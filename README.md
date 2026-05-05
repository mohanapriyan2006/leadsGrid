# LeadsGrid — AI-powered Lead Discovery, CRM & Agentic Outreach

Find high-intent leads, qualify them fast, and run personalized outreach with **Agentic AI** — all from one clean workspace.

![logo](./frontend/public/logo.png)

**LeadsGrid** combines:
- **Lead discovery** (search + enrich)
- **Lightweight CRM** (pipeline + notes + tracking)
- **Agent Mode** (AI plans + executes multi-step workflows)
- **Email orchestration** (SMTP-ready, template-aware)

---

## Why LeadsGrid?

Sales tools are either:
1) Great CRMs with weak discovery, or  
2) Great scrapers with no workflow, or  
3) AI chats that don’t actually *do* the work.

**LeadsGrid is built to execute.**  
Discover → qualify → manage → outreach → iterate — with AI that can plan and run tasks, not just suggest them.

---

## What you can do today

### Lead Discovery + CRM
- Discover leads from multiple sources
- Store, dedupe, and manage leads in a CRM-style workflow
- Organize by projects and run analysis without unbounded reads (Firestore-friendly patterns)

### Agentic AI (Plan → Execute)
- Generate structured plans for prospecting/outreach
- Execute workflows via backend agent endpoints
- Track agent runs and snapshots (with graceful simulated mode when not configured)

### Email Sending (SMTP)
- Send outreach via SMTP
- Supports plain + HTML bodies and template metadata
- Friendly identity formatting:
  - **From:** `"<User Name> via LeadsGrid" <SMTP_EMAIL>`
  - **Reply-To:** the user’s email

---

## Tech Stack

**Frontend**
- React + TypeScript + Vite
- Tailwind CSS
- React Router, React Query, Zustand
- Framer Motion, Axios

**Backend**
- FastAPI (Python)
- Agent execution + planning
- Email orchestration
- Firebase/Firestore integration (optional, with safe fallbacks)

---

## Repository Structure

```text
frontend/   # React + TS app
backend/    # FastAPI service for agent mode, discovery, email
```

---

## Quickstart (Local Development)

### 1) Frontend
```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 2) Backend
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

---

## Core API Endpoints (Backend)

- `GET  /api/health`
- `GET  /api/health/ready`
- `POST /api/agent/plan`
- `POST /api/agent/execute`
- `POST /api/agent/run`
- `GET  /api/agent/discover?query=...`
- `POST /api/email/send`

---

## SMTP Setup (Recommended)

Gmail SMTP for dev/low volume:

1. Enable 2-Step Verification  
2. Create an App Password  
3. Update `backend/.env`:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USE_STARTTLS=true
SMTP_EMAIL=yourgmail@gmail.com
SMTP_PASSWORD=your_16_char_app_password
SMTP_RATE_LIMIT_PER_MIN=20
SMTP_TIMEOUT_SECONDS=15
```

For production sending at scale: use a transactional provider + SPF/DKIM/DMARC.

---

## Product Positioning (One-liner)

**LeadsGrid is a precision sales engine that turns “find leads” into “close deals” — with agentic AI that executes.**

---

## Roadmap (Suggested Next Steps)
- Full auth flow + protected routes
- Real JWT injection into API calls
- Deeper AI messaging integration (`/api/ai/message`)
- Outreach sequences, inbox warm-up signals, analytics

---

## Contributing
PRs welcome. If you’re adding a new lead source, include:
- schema updates (if needed)
- dedupe key strategy
- tests for parsing + normalization

---

## License
Add your preferred license here (MIT, Apache-2.0, proprietary, etc.).
