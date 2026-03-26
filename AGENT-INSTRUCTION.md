# 🚀 AI AGENT SYSTEM INSTRUCTIONS (PRO DEV MODE)

## 🎯 CORE OBJECTIVE

Build software like a **scalable SaaS product**, not a demo.

The agent must:

* Write **clean, modular, reusable code**
* Maintain **separation of concerns**
* Produce **documentation per feature**
* Think in **systems, not files**
* Avoid "dump code" responses

---

# 🧠 1. ENGINEERING PRINCIPLES (MANDATORY)

## 1.1 Code Quality Rules

* NEVER write everything in one file
* NEVER mix UI + logic + API calls
* ALWAYS split into:

  * components
  * hooks
  * services
  * utils
  * types

👉 Every feature = **mini system**

---

## 1.2 Reusability First

* Extract reusable logic immediately
* No duplicate API calls
* No repeated UI blocks

Example:
❌ Bad: Fetch logic inside component
✅ Good: `services/leadService.ts`

---

## 1.3 Single Responsibility Principle

Each file should do ONE thing:

| Type      | Responsibility |
| --------- | -------------- |
| Component | UI only        |
| Hook      | Logic          |
| Service   | API calls      |
| Utils     | Pure functions |
| Context   | Global state   |

---

## 1.4 Naming Discipline

* No vague names like `data`, `item`, `temp`
* Use:

  * `leadList`
  * `fetchLeads`
  * `useAuthContext`

---

## 1.5 File Size Rule

* Max ~200–300 lines per file
* If bigger → split

---

# 🏗️ 2. PROJECT STRUCTURE (STRICT)

## 📁 FRONTEND (React + TS + Tailwind)

```
src/
 ├── app/
 ├── components/
 │    ├── ui/
 │    ├── shared/
 │    └── feature/
 ├── features/
 │    ├── leads/
 │    │    ├── components/
 │    │    ├── hooks/
 │    │    ├── services/
 │    │    ├── types/
 │    │    └── docs/
 │    │         └── leads.md
 │
 ├── hooks/
 ├── services/
 ├── context/
 ├── utils/
 ├── lib/
 ├── constants/
 ├── types/
 └── styles/
```

---

## 📁 BACKEND (FastAPI)

```
backend/
 ├── app/
 │    ├── api/
 │    ├── core/
 │    ├── models/
 │    ├── schemas/
 │    ├── services/
 │    ├── repositories/
 │    ├── workers/
 │    └── utils/
 │
 ├── tests/
 ├── migrations/
 └── docs/
```

---

# ⚛️ 3. FRONTEND ARCHITECTURE RULES

## 3.1 Component Design

### ✅ Good Pattern

```tsx
// components/LeadCard.tsx
type Props = {
  lead: Lead;
};

export const LeadCard = ({ lead }: Props) => {
  return <div>{lead.name}</div>;
};
```

---

## 3.2 Hooks for Logic

```tsx
// hooks/useLeads.ts
export const useLeads = () => {
  const [leads, setLeads] = useState([]);

  const fetchLeads = async () => {
    const data = await leadService.getLeads();
    setLeads(data);
  };

  return { leads, fetchLeads };
};
```

---

## 3.3 Service Layer (CRITICAL)

```ts
// services/leadService.ts
import axios from "@/lib/api";

export const leadService = {
  getLeads: async () => {
    const res = await axios.get("/leads");
    return res.data;
  }
};
```

👉 No API calls inside components

---

## 3.4 Global State (Context / Zustand)

Use for:

* Auth
* Theme
* User data

---

## 3.5 UI Rules

* Tailwind only
* Use reusable components:

  * Button
  * Card
  * Modal

---

# ⚡ 4. BACKEND ARCHITECTURE (FastAPI)

## 4.1 Layered Design

| Layer      | Responsibility |
| ---------- | -------------- |
| API        | Routes         |
| Service    | Business logic |
| Repository | DB queries     |
| Schema     | Validation     |
| Model      | DB             |

---

## 4.2 Example

### Route

```python
@router.get("/leads")
def get_leads():
    return lead_service.get_all_leads()
```

---

### Service

```python
def get_all_leads():
    return lead_repository.fetch_all()
```

---

### Repository

```python
def fetch_all():
    return db.query(Lead).all()
```

---

## 4.3 Async + Background Jobs

* Use `Celery` / `RQ`
* For scraping, AI tasks

👉 Important for your AI platform


---

## 4.4 AI Integration Layer

* Separate module: `ai_service.py`
* Never mix AI logic in routes

---

# 🧩 5. FEATURE-BASED DEVELOPMENT (VERY IMPORTANT)

Each feature must be isolated:

```
features/
 ├── leads/
 │    ├── components/
 │    ├── hooks/
 │    ├── services/
 │    ├── types/
 │    └── docs/leads.md
```

---

# 📄 6. DOCUMENTATION SYSTEM (.md per feature)

Every feature MUST have:

## Example: `leads.md`

```md
# Leads Feature

## Overview
Handles lead fetching, scoring, and display.

## API
GET /leads

## Components
- LeadCard
- LeadList

## Hooks
- useLeads

## State
- leads[]
- loading

## Future Improvements
- Pagination
- Filters
```

---

👉 This is exactly how scalable systems are built


---

# 🔁 7. CODE REUSE STRATEGY

## Extract Early

* Common UI → `/components/ui`
* API → `/services`
* Logic → `/hooks`

---

## Create Shared Utilities

```ts
// utils/formatDate.ts
export const formatDate = () => {}
```

---

# 🔐 8. ERROR HANDLING + LOGGING

Frontend:

* Toast notifications
* Try/catch in services

Backend:

* Central exception handler
* Structured logging

---

# 🧪 9. TESTING (MINIMUM STANDARD)

* Unit tests for services
* API testing (FastAPI TestClient)
* Mock external APIs

---

# ⚡ 10. PERFORMANCE RULES

Frontend:

* Lazy loading
* Memoization

Backend:

* Async APIs
* Background jobs
* Caching (Redis)

---

# 🤖 11. AI AGENT BEHAVIOR RULES

Your AI should:

### ALWAYS:

* Break features into modules
* Explain structure before coding
* Generate multiple files (not one dump)
* Add docs

### NEVER:

* Write single-file apps
* Mix frontend + backend logic
* Skip types

---

# 🧠 12. THINK LIKE SYSTEM DESIGNER

Before coding, AI must:

1. Define feature scope
2. Identify modules
3. Design API
4. Create folder structure
5. Then code

---

# 🔥 FINAL RULE (MOST IMPORTANT)

👉 “Code should look like a team of senior engineers built it — even if it's just you.”

---

