# 🚀 PITCHPILOT — MASTER BUILD PLAN (REAL SaaS)

---

# 🧠 0. CORE SYSTEM THINKING (IMPORTANT)

PitchPilot is **3 engines combined**:

```
1. DATA ENGINE      → finds leads
2. INTELLIGENCE     → scores + understands intent
3. ACTION ENGINE    → generates messages + tracks deals
```

Most devs fail because they build UI first.

👉 You will build **PIPELINES FIRST → UI SECOND**

---

# 🏗️ 1. SYSTEM ARCHITECTURE (PRODUCTION LEVEL)

## 🔥 High-Level Architecture

```
Frontend (React TS)
   ↓
API Gateway (FastAPI)
   ↓
--------------------------------
|  Core Services (Modular)     |
|-----------------------------|
| Lead Service                |
| AI Service (multi-provider) |
| CRM Service                 |
| User/Auth Service           |
--------------------------------
   ↓
PostgreSQL + Redis
   ↓
Background Workers (Celery / RQ)
```

---

## ⚙️ Key Decisions (Critical)

### ✅ Use Redis

* Caching leads
* AI response caching
* Queue system

### ✅ Background Workers (MANDATORY)

Lead scraping + AI scoring MUST NOT block API

👉 Use:

* Celery + Redis (best)
  OR
* FastAPI BackgroundTasks (MVP)

---

## 📦 Backend Folder Structure

```
/app
  /api
    leads.py
    ai.py
    crm.py
    auth.py

  /services
    lead_service.py
    ai_service.py
    scoring_service.py
    message_service.py

  /workers
    lead_worker.py
    scoring_worker.py

  /models
    user.py
    lead.py
    message.py
    crm.py

  /schemas
  /core
    config.py
    security.py
    database.py

main.py
```

---

# 🤖 2. AI LAYER (MULTI-MODEL STRATEGY — VERY IMPORTANT)

You asked for:

* Gemini (Primary)
* Groq (Fast fallback)
* OpenRouter (universal fallback)

👉 This is **correct architecture thinking**

---

## 🔁 AI Routing System (MUST BUILD)

### ai_service.py

```python
class AIProvider:
    def generate(self, prompt): pass

class GeminiProvider(AIProvider): ...
class GroqProvider(AIProvider): ...
class OpenRouterProvider(AIProvider): ...

class AIService:
    def __init__(self):
        self.providers = [
            GeminiProvider(),
            GroqProvider(),
            OpenRouterProvider()
        ]

    async def generate(self, prompt):
        for provider in self.providers:
            try:
                return await provider.generate(prompt)
            except Exception:
                continue
        raise Exception("All AI providers failed")
```

---

## 🧠 AI WORKFLOWS (REAL INTELLIGENCE)

From your document:

👉 Use **Agentic Pattern (VERY IMPORTANT)** 

---

### 🔥 Workflow 1: Lead Scoring

```
Input: raw post
↓

Step 1 → classify type
Step 2 → extract signals
Step 3 → score (0–100)
↓

Output: JSON
```

---

### 🔥 Workflow 2: Message Generation (Evaluator Loop)

```
Draft → Evaluate → Improve → Final Output
```

This makes your product:
👉 10x better than basic ChatGPT clones

---

## 🧾 Prompt Example (Production Level)

```text
ROLE:
You are a senior freelance sales engineer.

TASK:
Analyze the lead and generate a high-conversion outreach message.

RULES:
- No generic lines
- Mention their exact problem
- Suggest 1 solution
- Keep under 120 words

OUTPUT:
Return JSON:
{
 "message": "...",
 "confidence": 0-100
}
```

---

# 🔍 3. LEAD ENGINE (MOST IMPORTANT FEATURE)

---

## 🧠 Data Sources

Start with:

* Reddit (best signal)
* X (Twitter)
* LinkedIn (later, harder)

---

## ⚡ Strategy (REALISTIC)

DO NOT scrape directly first.

Use:

* Reddit API (free)
* SerpAPI (Google search scraping)
* Apify (for scale later)

---

## 🔎 Search Queries

From your doc (VERY STRONG insight):

👉 Use intent-based queries 

Examples:

```
"looking for developer"
"need CRM tool"
"how to automate business"
"frustrated with current system"
```

---

## 🧱 Lead Pipeline

```
Fetch → Clean → AI Score → Store → Show UI
```

---

## 🧪 Lead Schema

```ts
type Lead = {
  id: string
  source: "reddit" | "twitter"
  content: string
  summary: string
  score: number
  tags: string[]
  created_at: string
}
```

---

# 🎨 4. UI/UX SYSTEM (THIS IS YOUR USP)

You already nailed the style direction.

Now implement it like a **real SaaS designer**.

---

## 🌑 Core UI Principles

### 1. Depth

* layered cards
* soft shadows
* glass effect

### 2. Motion

* hover glow
* card lift
* micro-interactions

### 3. Focus

* highlight HIGH SCORE leads
* reduce noise

---

## 🎯 Key UI Components

### 🔹 Lead Card (CRITICAL)

* avatar
* summary
* source
* score (big + colored)
* CTA button

👉 Add:

* glow if score > 85
* pulse animation

---

### 🔹 Dashboard Widgets

* Leads count
* High intent
* Engagement
* Efficiency

---

### 🔹 AI Message Panel

Split screen:

```
Left → context
Right → generated message
```

(Your screenshot already perfect — just refine spacing)

---

## 🎞️ Animations (Framer Motion)

Use:

```tsx
<motion.div
  whileHover={{ scale: 1.02 }}
  transition={{ duration: 0.2 }}
/>
```

---

## 🔥 Premium Effects

* gradient borders
* blur backgrounds
* animated glow

---

# ⚛️ 5. FRONTEND ARCHITECTURE

---

## 📦 Folder Structure

```
/src
  /components
    LeadCard.tsx
    Sidebar.tsx
    Topbar.tsx

  /pages
    Dashboard.tsx
    Leads.tsx
    CRM.tsx
    AIChat.tsx

  /services
    api.ts

  /store
    useLeadStore.ts

  /hooks
    useLeads.ts
```

---

## 🔄 Data Fetching

Use React Query:

```ts
const { data } = useQuery({
  queryKey: ["leads"],
  queryFn: fetchLeads
})
```

---

## ⚡ State

Use Zustand:

```ts
const useStore = create((set) => ({
  leads: [],
  setLeads: (data) => set({ leads: data })
}))
```

---

# 📊 6. CRM SYSTEM (SIMPLE BUT POWERFUL)

---

## 🎯 Design Philosophy

👉 NOT Salesforce
👉 NOT complex

👉 Minimal + automated

---

## 🧱 Features

* status tracking
* notes
* timeline
* follow-ups

---

## 📦 CRM Status

```
NEW → CONTACTED → REPLIED → CLOSED
```

---

# 🔐 7. AUTH SYSTEM

---

Use:

* JWT (FastAPI)
* bcrypt hashing

---

## Flow

```
Signup → Login → Token → Protected routes
```

---

# ⚡ 8. PERFORMANCE SYSTEM

---

### MUST IMPLEMENT

* API caching (Redis)
* debounce search
* lazy loading routes
* skeleton loaders

---

# 🧪 9. BUILD ROADMAP (REAL EXECUTION)

---

## 🔥 Phase 1 (Week 1–2)

* Auth
* Dashboard UI
* Mock leads

---

## 🔥 Phase 2 (Week 3–4)

* Reddit lead fetch
* AI scoring
* Store in DB

---

## 🔥 Phase 3 (Week 5–6)

* Message generator
* CRM system

---

## 🔥 Phase 4 (Week 7–8)

* AI assistant
* real-time updates

---

# 💰 10. MONETIZATION (DON’T IGNORE)

From your doc:

👉 Hybrid pricing is BEST 

---

## 💡 Model

```
Free → UI only
Pro → AI + Leads
Credits → pay per lead
```

---

# 🧠 FINAL INSIGHT (MOST IMPORTANT)

Your product wins NOT because of:

❌ UI
❌ Features

👉 It wins because of:

```
QUALITY OF LEADS + QUALITY OF MESSAGE
```

That = AI system quality

---
