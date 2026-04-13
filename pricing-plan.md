You are building a SaaS feature for a React (TypeScript) + Firebase (Firestore) app.

⚠️ IMPORTANT:
- ALL plan logic, limits, and enforcement must be handled ONLY in:
  - Frontend (React)
  - Firebase (Firestore)
- NO backend validation (Python/FastAPI not used for limits)

Goal:
Implement a complete "Frontend-Driven Plan & Usage Limiting System"

---

# 🧠 CORE ARCHITECTURE

We rely on:
1. Firestore → single source of truth
2. Frontend → enforces limits + UI control
3. Atomic updates → prevent race conditions

---

# 🗂️ FIRESTORE STRUCTURE

Collection: users/{userId}

{
  plan: "free" | "pro" | "max",

  usage: {
    leads_discovery_today: 0,
    email_sent_today: 0,
    crm_ai_analysis_today: 0,
    other_ai_today: 0,

    ask_ai_used_month: 0,
    agent_ai_used_month: 0,

    last_daily_reset: Timestamp,
    last_monthly_reset: Timestamp
  },

  limits: {
    leads_discovery_per_day: 2,
    email_sending_per_day: 5,
    crm_ai_analysis_per_day: 2,
    other_ai_per_day: 10,
    ask_ai_per_month: 100,
    agent_ai_per_month: 30,
    storage_limit: 100
  }
}

---

# 🧾 PLAN CONFIG (STATIC)

Create config file:

planConfig.ts

export const PLAN_CONFIG = {
  free: {
    storage: 100,
    leads_discovery_per_day: 2,
    email_sending_per_day: 5,
    crm_ai_analysis_per_day: 2,
    other_ai_per_day: 10,
    ask_ai_per_month: 100,
    agent_ai_per_month: 30
  },
  pro: {
    storage: 5000,
    leads_discovery_per_day: 75,
    email_sending_per_day: 300,
    crm_ai_analysis_per_day: 150,
    other_ai_per_day: 100,
    ask_ai_per_month: 2500,
    agent_ai_per_month: 800
  },
  max: {
    storage: 25000,
    leads_discovery_per_day: 250,
    email_sending_per_day: 1500,
    crm_ai_analysis_per_day: "unlimited",
    other_ai_per_day: 500,
    ask_ai_per_month: 10000,
    agent_ai_per_month: 3000
  }
}

---

# 🔁 RESET LOGIC (FRONTEND)

On app load or action:

function resetIfNeeded(userDoc) {
  const now = new Date()

  // Daily reset
  if (dayChanged(userDoc.last_daily_reset)) {
    reset:
      leads_discovery_today
      email_sent_today
      crm_ai_analysis_today
      other_ai_today
  }

  // Monthly reset
  if (monthChanged(userDoc.last_monthly_reset)) {
    reset:
      ask_ai_used_month
      agent_ai_used_month
  }
}

Update Firestore after reset.

---

# ⚙️ CORE HOOK

Create hook:

usePlanLimits()

Returns:
- isAllowed(feature)
- remaining(feature)
- consume(feature, amount)

---

# 🧠 FEATURE CHECK

function isAllowed(feature) {
  const usage = user.usage
  const limit = user.limits[feature]

  if (limit === "unlimited") return true

  return usage < limit
}

---

# 🔥 ATOMIC USAGE UPDATE (IMPORTANT)

Use Firestore increment:

import { increment } from "firebase/firestore"

await updateDoc(userRef, {
  "usage.leads_discovery_today": increment(1)
})

---

# 🚫 BLOCK FLOW

Before any action:

if (!isAllowed("leads_discovery")) {
  openUpgradeModal("leads_discovery")
  return
}

---

# 💎 UPGRADE MODAL

Create component:

<UpgradeModal />

Props:
- feature
- currentPlan

Logic:
- Suggest next plan:
   free → pro
   pro → max

UI:
- "Limit Reached 🚫"
- Show:
   "You reached 2/2 leads today"
- Show upgrade benefit:
   "Upgrade to Pro → 75 leads/day"

Buttons:
- Upgrade Now
- View Pricing
- Cancel

Use:
- Tailwind CSS
- Framer Motion animation

---

# 🧠 UX IMPROVEMENTS

- Show usage everywhere:
  "45 / 75 used"

- Progress bar

- Warning:
  If usage > 80% → show orange alert

- Disable buttons when blocked

---

# 🔐 FIRESTORE SECURITY RULES

IMPORTANT: prevent tampering

rules:

allow update: if request.auth.uid == userId
  && request.resource.data.usage >= resource.data.usage

(only allow increments, not manual resets or decreases)

---

# 🔄 PLAN UPGRADE FLOW

When user upgrades:

1. Update:
   plan = "pro"

2. Replace limits from PLAN_CONFIG

3. Keep usage (do NOT reset)

---

# 📦 OPTIONAL

- Add "Buy Credits" feature
- Add usage analytics UI
- Add notifications:
   "You are near your limit"

---

# 🎯 EXPECTED OUTPUT

- React hooks (usePlanLimits)
- Firebase integration (read/write)
- Upgrade modal UI
- Plan config system
- Clean scalable architecture

Focus on:
- simplicity
- real-time updates
- smooth UX
- production-ready code