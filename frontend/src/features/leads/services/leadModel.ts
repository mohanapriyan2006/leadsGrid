import { Timestamp, type DocumentData } from "firebase/firestore";

import type { Lead } from "../types/lead";
import type { ManageLead, ManageLeadSource, ManageLeadStage } from "../types/manageLead";

export type DiscoveryLeadAIIntent = {
  score: number;
  urgency: "low" | "medium" | "high";
  buying_signals: string[];
  decision_maker: "yes" | "no" | "unknown";
  pain_point: string;
  details: string;
  category: "hiring" | "problem" | "switching" | "learning" | "discussion";
  status: "qualified" | "unqualified";

  // 3-stage pipeline fields
  lead_category?: string | null;
  industry?: string | null;
  authority_level?: string | null;
  authority_confidence?: number | null;
  buying_stage?: string | null;
  primary_problem?: string | null;
  secondary_problems?: string[];
  desired_outcome?: string | null;
  evidence?: string[];
  verdict?: string | null;
  closing_confidence?: number | null;
  recommended_action?: string | null;
  lead_score?: number;
  priority?: "HOT" | "HIGH" | "MEDIUM" | "LOW";
};

export type LeadStatus = "new" | "contacted" | "proposal" | "won" | "lost";

export type FirestoreLead = {
  name?: string;
  email?: string | null;
  company?: string;
  title?: string;
  summary?: string;
  content?: string;
  author?: string;
  platform?: string;
  upvotes?: number;
  url?: string | null;
  status?: LeadStatus;
  pipelineStage?: string;
  stage?: string;
  isDeleted?: boolean;
  deletedAt?: Timestamp | string | null;
  source?: "manual" | "csv" | "ai" | "reddit" | "linkedin" | "twitter" | "hackernews" | "search";
  notes?: string | null;
  tags?: string[];
  phone?: string | null;
  budgetEstimate?: number;
  score?: number;
  urgency?: "low" | "medium" | "high";
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
  lastActivityAt?: Timestamp | string;
  created_at?: Timestamp | string;
  updated_at?: Timestamp | string;
  last_activity_at?: Timestamp | string;
  // CSV fields
  category?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  address?: string | null;
  websiteUrl?: string | null;
  googleMapsUrl?: string | null;
  dedupeKey?: string;
  aiAnalysis?: Partial<DiscoveryLeadAIIntent>;
};

export type CreateManageLeadInput = {
  name: string;
  company: string;
  email?: string;
  phone?: string;
  stage?: ManageLeadStage;
  budget_estimate?: number;
  category?: string | null;
  rating?: number | null;
  review_count?: number | null;
  address?: string | null;
  website_url?: string | null;
  google_maps_url?: string | null;
  source?: ManageLeadSource;
  notes?: string | null;
  score?: number;
  urgency?: "low" | "medium" | "high";
  aiAnalysis?: Partial<DiscoveryLeadAIIntent>;
};

const STATUS_TO_STAGE: Record<LeadStatus, ManageLeadStage> = {
  new: "NEW",
  contacted: "CONTACTED",
  proposal: "NEGOTIATION",
  won: "NEGOTIATION",
  lost: "NEGOTIATION",
};

export const STAGE_TO_STATUS: Record<ManageLeadStage, LeadStatus> = {
  NEW: "new",
  QUALIFIED: "new",
  CONTACTED: "contacted",
  RESPONDED: "proposal",
  NEGOTIATION: "proposal",
  CONTRACTED: "won",
  IN_PROGRESS: "proposal",
  CLOSED: "won",
};

const SOURCE_TO_MANAGE: Record<NonNullable<FirestoreLead["source"]>, ManageLeadSource> = {
  manual: "website",
  csv: "website",
  ai: "website",
  reddit: "reddit",
  linkedin: "linkedin",
  twitter: "twitter",
  hackernews: "hackernews",
  search: "search",
};

const pickFirstText = (...values: Array<string | null | undefined>): string | null => {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }
  return null;
};

const toSource = (lead: FirestoreLead): ManageLeadSource => {
  const source = (lead.source || "").toLowerCase() as NonNullable<FirestoreLead["source"]>;
  if (source && SOURCE_TO_MANAGE[source]) {
    return SOURCE_TO_MANAGE[source];
  }

  const platform = (lead.platform || "").toLowerCase();
  if (platform === "reddit") return "reddit";
  if (platform === "linkedin") return "linkedin";
  if (platform === "twitter") return "twitter";
  if (platform === "hackernews") return "hackernews";
  if (platform === "search") return "search";

  return "website";
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
  const normalizedName = pickFirstText(lead.name, lead.author, lead.title, lead.summary, lead.content) ?? "Unknown";
  const normalizedCompany = pickFirstText(lead.company, lead.title, lead.author, lead.name) ?? normalizedName;
  const stageFromPipeline = (lead.pipelineStage || "").toUpperCase() as ManageLeadStage;
  const stageFromLegacy = (lead.stage || "").toUpperCase() as ManageLeadStage;
  const stage = ["NEW", "QUALIFIED", "CONTACTED", "RESPONDED", "NEGOTIATION", "CONTRACTED", "IN_PROGRESS", "CLOSED"].includes(stageFromPipeline)
    ? stageFromPipeline
    : ["NEW", "QUALIFIED", "CONTACTED", "RESPONDED", "NEGOTIATION", "CONTRACTED", "IN_PROGRESS", "CLOSED"].includes(stageFromLegacy)
      ? stageFromLegacy
      : STATUS_TO_STAGE[lead.status ?? "new"];

  return {
    id,
    name: normalizedName,
    company: normalizedCompany,
    // CSV fields
    category: lead.category ?? null,
    rating: lead.rating ?? null,
    review_count: lead.reviewCount ?? null,
    address: lead.address ?? null,
    website_url: lead.websiteUrl ?? null,
    google_maps_url: lead.googleMapsUrl ?? null,
    // Existing fields
    source: toSource(lead),
    stage,
    email: lead.email ?? null,
    phone: lead.phone ?? null,
    budget_estimate: lead.budgetEstimate ?? 0,
    urgency: lead.urgency ?? "medium",
    score: lead.score ?? 50,
    last_activity_at: toISO(lead.lastActivityAt ?? lead.last_activity_at ?? lead.updatedAt ?? lead.updated_at ?? lead.createdAt ?? lead.created_at),
    created_at: toISO(lead.createdAt ?? lead.created_at),
    updated_at: toISO(lead.updatedAt ?? lead.updated_at ?? lead.createdAt ?? lead.created_at),
    notes: lead.notes ?? null,
    is_going_cold: false,
    is_deleted: lead.isDeleted ?? false,
    deleted_at: lead.deletedAt ? toISO(lead.deletedAt) : null,
    ai_analysis: {
      intent_score: lead.aiAnalysis?.lead_score ?? lead.score ?? 50,
      pain_points: lead.aiAnalysis?.primary_problem ? [lead.aiAnalysis.primary_problem] : [],
      buying_signals: lead.aiAnalysis?.buying_signals ?? [],
      decision_maker: lead.aiAnalysis?.decision_maker,
      qualification_status: lead.aiAnalysis?.status,
      suggested_pitch: lead.aiAnalysis?.recommended_action ?? "",
      portfolio_match: "",
      next_action: lead.aiAnalysis?.recommended_action ?? "",
      deal_probability: lead.aiAnalysis?.closing_confidence ?? lead.score ?? 50,
      expected_close_days: 14,
      ghost_probability: 20,
      winning_strategy: "",

      // 3-stage pipeline fields
      lead_category: lead.aiAnalysis?.lead_category ?? null,
      industry: lead.aiAnalysis?.industry ?? null,
      authority_level: lead.aiAnalysis?.authority_level ?? null,
      authority_confidence: lead.aiAnalysis?.authority_confidence ?? null,
      buying_stage: lead.aiAnalysis?.buying_stage ?? null,
      primary_problem: lead.aiAnalysis?.primary_problem ?? null,
      secondary_problems: lead.aiAnalysis?.secondary_problems ?? [],
      desired_outcome: lead.aiAnalysis?.desired_outcome ?? null,
      evidence: lead.aiAnalysis?.evidence ?? [],
      verdict: lead.aiAnalysis?.verdict ?? null,
      closing_confidence: lead.aiAnalysis?.closing_confidence ?? null,
      recommended_action: lead.aiAnalysis?.recommended_action ?? null,
      lead_score: lead.aiAnalysis?.lead_score ?? lead.score ?? 50,
      priority: lead.aiAnalysis?.priority ?? "LOW",
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
  // CSV fields
  if (payload.category !== undefined) patch.category = payload.category;
  if (payload.rating !== undefined) patch.rating = payload.rating;
  if (payload.review_count !== undefined) patch.reviewCount = payload.review_count;
  if (payload.address !== undefined) patch.address = payload.address;
  if (payload.website_url !== undefined) patch.websiteUrl = payload.website_url;
  if (payload.google_maps_url !== undefined) patch.googleMapsUrl = payload.google_maps_url;
  if (payload.stage !== undefined) {
    patch.pipelineStage = payload.stage;
    patch.status = STAGE_TO_STATUS[payload.stage];
  }

  return patch;
};

export const createFirestoreLead = (
  payload: CreateManageLeadInput,
): FirestoreLead => {
  const stage = payload.stage ?? "NEW";
  const now = Timestamp.now();
  const firestoreSource = payload.source === "website" ? "manual" : payload.source;

  return {
    name: payload.name,
    company: payload.company,
    email: payload.email ?? null,
    phone: payload.phone ?? null,
    status: STAGE_TO_STATUS[stage],
    pipelineStage: stage,
    isDeleted: false,
    deletedAt: null,
    source: firestoreSource ?? "manual",
    notes: payload.notes ?? null,
    tags: [],
    budgetEstimate: payload.budget_estimate ?? 0,
    score: payload.score ?? 60,
    urgency: payload.urgency ?? "medium",
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
    // CSV fields
    category: payload.category ?? null,
    rating: payload.rating ?? null,
    reviewCount: payload.review_count ?? null,
    address: payload.address ?? null,
    websiteUrl: payload.website_url ?? null,
    googleMapsUrl: payload.google_maps_url ?? null,
    dedupeKey: buildLeadDedupeKey(payload.name, payload.company, payload.source ?? "website"),
    aiAnalysis: payload.aiAnalysis ?? undefined,
  };
};

const toCanonicalPart = (value: string | undefined | null) =>
  (value ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

export const buildLeadDedupeKey = (
  name: string,
  company: string,
  source: ManageLeadSource,
) => [toCanonicalPart(name), toCanonicalPart(company), toCanonicalPart(source)].join("|");

const toUrgencyFromScore = (score: number): "low" | "medium" | "high" => {
  if (score >= 85) return "high";
  if (score >= 65) return "medium";
  return "low";
};

export const mapDiscoveryLeadToManageInput = (lead: Lead): CreateManageLeadInput => {
  const score = Math.max(1, Math.min(Math.round(lead.score), 100));
  const company = lead.title?.trim() || lead.author || "Unknown Company";
  const notes = [lead.summary, lead.content, lead.permalink ? `Source: ${lead.permalink}` : null]
    .filter(Boolean)
    .join("\n\n");

  return {
    name: lead.author || "Unknown Lead",
    company,
    email: lead.email ?? undefined,
    phone: undefined,
    stage: "NEW",
    budget_estimate: lead.budget ? 5000 : 0,
    category: null,
    rating: null,
    review_count: null,
    address: null,
    website_url: null,
    google_maps_url: null,
    source: lead.source,
    notes: notes || null,
    score,
    urgency: toUrgencyFromScore(score),
  };
};

export const mapDiscoveryLeadToManageInputWithAI = (
  lead: Lead,
  aiIntent?: DiscoveryLeadAIIntent | null,
): CreateManageLeadInput => {
  const base = mapDiscoveryLeadToManageInput(lead);
  const effectiveScore = lead.lead_score ?? aiIntent?.score ?? lead.score ?? 60;
  const score = Math.max(1, Math.min(Math.round(effectiveScore), 100));

  const aiNotes = [
    base.notes,
    lead.primary_problem ? `Primary Problem: ${lead.primary_problem}` : null,
    lead.desired_outcome ? `Desired Outcome: ${lead.desired_outcome}` : null,
    lead.recommended_action ? `Recommended Action: ${lead.recommended_action}` : null,
    lead.buying_stage ? `Buying Stage: ${lead.buying_stage}` : null,
    lead.authority_level ? `Authority: ${lead.authority_level}` : null,
    lead.industry ? `Industry: ${lead.industry}` : null,
    lead.evidence?.length ? `Evidence: ${lead.evidence.join("; ")}` : null,
    aiIntent?.status ? `AI Qualification: ${aiIntent.status}` : null,
    aiIntent?.category ? `AI Category: ${aiIntent.category}` : null,
    aiIntent?.urgency ? `AI Urgency: ${aiIntent.urgency}` : null,
    aiIntent?.pain_point ? `AI Pain Point: ${aiIntent.pain_point}` : null,
    aiIntent?.buying_signals?.length ? `AI Buying Signals: ${aiIntent.buying_signals.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  const aiAnalysis: Partial<DiscoveryLeadAIIntent> = {
    score: effectiveScore,
    urgency: aiIntent?.urgency ?? (lead.priority === "HOT" || lead.priority === "HIGH" ? "high" : "medium"),
    buying_signals: aiIntent?.buying_signals ?? lead.evidence ?? [],
    decision_maker: aiIntent?.decision_maker ?? lead.decision_maker,
    pain_point: aiIntent?.pain_point ?? lead.primary_problem ?? "",
    details: aiIntent?.details ?? lead.recommended_action ?? "",
    category: aiIntent?.category ?? lead.category ?? "discussion",
    status: aiIntent?.status ?? (lead.priority === "HOT" || lead.priority === "HIGH" ? "qualified" : "unqualified"),

    // 3-stage pipeline fields
    lead_category: lead.lead_category ?? null,
    industry: lead.industry ?? null,
    authority_level: lead.authority_level ?? null,
    authority_confidence: lead.authority_confidence ?? null,
    buying_stage: lead.buying_stage ?? null,
    primary_problem: lead.primary_problem ?? null,
    secondary_problems: lead.secondary_problems ?? [],
    desired_outcome: lead.desired_outcome ?? null,
    evidence: lead.evidence ?? [],
    verdict: lead.verdict ?? null,
    closing_confidence: lead.closing_confidence ?? null,
    recommended_action: lead.recommended_action ?? null,
    lead_score: lead.lead_score ?? effectiveScore,
    priority: lead.priority ?? "LOW",
  };

  return {
    ...base,
    stage: aiAnalysis.status === "qualified" ? "QUALIFIED" : "NEW",
    score,
    urgency: aiAnalysis.urgency,
    category: aiAnalysis.category,
    notes: aiNotes || base.notes,
    aiAnalysis,
  };
};
