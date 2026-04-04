import type { ManageLeadStage, ManageLeadView } from "../types/manageLead";

export const BOARD_STAGES: { id: ManageLeadStage; label: string; icon: string }[] = [
  { id: "NEW", label: "New", icon: "🧲" },
  { id: "QUALIFIED", label: "Qualified", icon: "🔍" },
  { id: "CONTACTED", label: "Contacted", icon: "💬" },
  { id: "RESPONDED", label: "Responded", icon: "🟢" },
];

export const VIEW_OPTIONS: { value: ManageLeadView; label: string }[] = [
  { value: "kanban", label: "Kanban" },
  { value: "table", label: "Table" },
];

export const NEXT_STAGE: Record<ManageLeadStage, ManageLeadStage | null> = {
  NEW: "QUALIFIED",
  QUALIFIED: "CONTACTED",
  CONTACTED: "RESPONDED",
  RESPONDED: null,
  NEGOTIATION: null,
  CONTRACTED: null,
  IN_PROGRESS: null,
  CLOSED: null,
};

export const APP_IMPORT_FIELDS = [
  "name",
  "company",
  "email",
  "phone",
  "stage",
  "score",
  "budget_estimate",
  "urgency",
  "source",
  "last_activity_at",
  "category",
  "rating",
  "review_count",
  "address",
  "website_url",
  "google_maps_url",
] as const;

export const guessMapping = (header: string): string => {
  const normalized = header
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  const aliases: Record<string, string> = {
    name: "name",
    lead_name: "name",
    client_name: "name",
    business_name: "name",
    company: "company",
    company_name: "company",
    mail: "email",
    email: "email",
    email_address: "email",
    phone: "phone",
    phone_number: "phone",
    mobile: "phone",
    status: "stage",
    pipeline_stage: "stage",
    stage: "stage",
    ai_score: "score",
    score: "score",
    budget: "budget_estimate",
    budget_estimate: "budget_estimate",
    urgency: "urgency",
    priority: "urgency",
    source: "source",
    last_activity: "last_activity_at",
    last_activity_at: "last_activity_at",
    category: "category",
    rating: "rating",
    review_count: "review_count",
    reviews: "review_count",
    address: "address",
    website_url: "website_url",
    website: "website_url",
    url: "website_url",
    google_maps_url: "google_maps_url",
    maps_url: "google_maps_url",
    google_maps: "google_maps_url",
  };

  return aliases[normalized] ?? "";
};

export const formatMoney = (amount: number) => `$${amount.toLocaleString()}`;

export const fromNow = (iso: string) => {
  const deltaMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(deltaMs / (1000 * 60 * 60));
  if (hours < 24) {
    return `${Math.max(hours, 0)}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};
