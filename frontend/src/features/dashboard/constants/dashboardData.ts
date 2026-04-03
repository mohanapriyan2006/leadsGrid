export const barData = [
  { label: "4.25", value: 30 },
  { label: "1.29", value: 45 },
  { label: "8.01", value: 35 },
  { label: "1.3+", value: 50 },
  { label: "F.20", value: 40 },
  { label: "2.2+", value: 55 },
  { label: "5.07", value: 95 },
];

export const healthMetrics = [
  { label: "RELEVANCE", value: 96.2, color: "#a78bfa", delay: 0 },
  { label: "SENTIMENT", value: 84.2, color: "#f59e0b", delay: 100 },
  { label: "LATENT_RISK", value: 9.4, color: "#f87171", delay: 200 },
];

export const fallbackMetrics = [
  { title: "LEADS CAPTURED", rawValue: 1284, displayValue: "1,284", delta: "+12.4% this week", icon: "⊞", accent: "#a78bfa" },
  { title: "HIGH INTENT", rawValue: 42, displayValue: "42", delta: "ACTIVE_QUEUE", icon: "⚡", accent: "#f59e0b" },
  { title: "ENGAGEMENT", rawValue: 86, displayValue: "86", delta: "86_INDEX", icon: "◎", accent: "#34d399" },
  { title: "EFFICIENCY", rawValue: 6, displayValue: "6.4%", delta: "6PT_OPTIMIZER", icon: "↗", accent: "#60a5fa" },
];

export const fallbackSignals = [
  {
    signal: "Scaling B2B outbound workflows with AI",
    tags: [
      { label: "URGENT", type: "urgent" },
      { label: "BUDGET_CONFIRMED", type: "budget" },
    ],
    score: 92,
    source: "/r/sales",
  },
  {
    signal: "Evaluating CRM replacements for Q3",
    tags: [
      { label: "ENTERPRISE", type: "enterprise" },
      { label: "DECISION_MAKER", type: "decision" },
    ],
    score: 88,
    source: "LinkedIn",
  },
  {
    signal: "Seeking tool for multi-channel prospecting",
    tags: [{ label: "EXPANSION", type: "expansion" }],
    score: 74,
    source: "Direct",
  },
];
