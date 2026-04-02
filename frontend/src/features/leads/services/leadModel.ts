import { Timestamp, type DocumentData } from "firebase/firestore";

import type { ManageLead, ManageLeadSource, ManageLeadStage } from "../types/manageLead";

export type LeadStatus = "new" | "contacted" | "proposal" | "won" | "lost";

export type FirestoreLead = {
  name?: string;
  email?: string | null;
  company?: string;
  status?: LeadStatus;
  pipelineStage?: string;
  isDeleted?: boolean;
  deletedAt?: Timestamp | string | null;
  source?: "manual" | "csv" | "ai";
  notes?: string | null;
  tags?: string[];
  phone?: string | null;
  budgetEstimate?: number;
  score?: number;
  urgency?: "low" | "medium" | "high";
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
  lastActivityAt?: Timestamp | string;
};

const STATUS_TO_STAGE: Record<LeadStatus, ManageLeadStage> = {
  new: "NEW",
  contacted: "CONTACTED",
  proposal: "NEGOTIATION",
  won: "NEGOTIATION",
  lost: "NEGOTIATION",
};

const STAGE_TO_STATUS: Record<ManageLeadStage, LeadStatus> = {
  NEW: "new",
  QUALIFIED: "new",
  CONTACTED: "contacted",
  RESPONDED: "proposal",
  NEGOTIATION: "proposal",
};

const SOURCE_TO_MANAGE: Record<NonNullable<FirestoreLead["source"]>, ManageLeadSource> = {
  manual: "website",
  csv: "website",
  ai: "linkedin",
};

const toISO = (value: Timestamp | string | null | undefined) => {
  if (!value) {
    return new Date().toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  try {
    return value.toDate().toISOString();
  } catch {
    return new Date().toISOString();
  }
};

export const toManageLead = (id: string, data: DocumentData): ManageLead => {
  const lead = data as FirestoreLead;
  const stageFromPipeline = (lead.pipelineStage || "").toUpperCase() as ManageLeadStage;
  const stage = ["NEW", "QUALIFIED", "CONTACTED", "RESPONDED", "NEGOTIATION"].includes(stageFromPipeline)
    ? stageFromPipeline
    : STATUS_TO_STAGE[lead.status ?? "new"];

  return {
    id,
    name: lead.name ?? "Unknown",
    company: lead.company ?? "Unknown",
    source: SOURCE_TO_MANAGE[lead.source ?? "manual"],
    stage,
    email: lead.email ?? null,
    phone: lead.phone ?? null,
    budget_estimate: lead.budgetEstimate ?? 0,
    urgency: lead.urgency ?? "medium",
    score: lead.score ?? 50,
    last_activity_at: toISO(lead.lastActivityAt ?? lead.updatedAt),
    created_at: toISO(lead.createdAt),
    updated_at: toISO(lead.updatedAt),
    notes: lead.notes ?? null,
    is_going_cold: false,
    is_deleted: lead.isDeleted ?? false,
    deleted_at: toISO(lead.deletedAt),
    ai_analysis: {
      intent_score: lead.score ?? 50,
      pain_points: [],
      suggested_pitch: "",
      portfolio_match: "",
      next_action: "",
      deal_probability: lead.score ?? 50,
      expected_close_days: 14,
      ghost_probability: 20,
      winning_strategy: "",
    },
  };
};

export const toFirestoreLeadPatch = (
  payload: Partial<ManageLead>,
): Partial<FirestoreLead> => {
  const patch: Partial<FirestoreLead> = {
    updatedAt: Timestamp.now(),
    lastActivityAt: Timestamp.now(),
  };

  if (payload.name !== undefined) patch.name = payload.name;
  if (payload.company !== undefined) patch.company = payload.company;
  if (payload.email !== undefined) patch.email = payload.email;
  if (payload.phone !== undefined) patch.phone = payload.phone;
  if (payload.notes !== undefined) patch.notes = payload.notes;
  if (payload.budget_estimate !== undefined) patch.budgetEstimate = payload.budget_estimate;
  if (payload.score !== undefined) patch.score = payload.score;
  if (payload.urgency !== undefined) patch.urgency = payload.urgency;
  if (payload.stage !== undefined) {
    patch.pipelineStage = payload.stage;
    patch.status = STAGE_TO_STATUS[payload.stage];
  }

  return patch;
};

export const createFirestoreLead = (
  payload: {
    name: string;
    company: string;
    email?: string;
    phone?: string;
    stage?: ManageLeadStage;
    budget_estimate?: number;
  },
): FirestoreLead => {
  const stage = payload.stage ?? "NEW";
  const now = Timestamp.now();

  return {
    name: payload.name,
    company: payload.company,
    email: payload.email ?? null,
    phone: payload.phone ?? null,
    status: STAGE_TO_STATUS[stage],
    pipelineStage: stage,
    isDeleted: false,
    deletedAt: null,
    source: "manual",
    notes: null,
    tags: [],
    budgetEstimate: payload.budget_estimate ?? 0,
    score: 50,
    urgency: "medium",
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
  };
};
