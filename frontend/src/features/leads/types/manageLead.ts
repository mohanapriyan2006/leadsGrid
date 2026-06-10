export type ManageLeadStage =
  | "NEW"
  | "QUALIFIED"
  | "CONTACTED"
  | "RESPONDED"
  | "NEGOTIATION"
  | "CONTRACTED"
  | "IN_PROGRESS"
  | "CLOSED";

export type ManageLeadSource =
  | "reddit"
  | "linkedin"
  | "twitter"
  | "hackernews"
  | "search"
  | "website";
export type ManageLeadUrgency = "low" | "medium" | "high";

export type ManageLeadAnalysis = {
  intent_score: number;
  pain_points: string[];
  buying_signals?: string[];
  decision_maker?: "yes" | "no" | "unknown";
  qualification_status?: "qualified" | "unqualified";
  suggested_pitch: string;
  portfolio_match: string;
  next_action: string;
  deal_probability: number;
  expected_close_days: number;
  ghost_probability: number;
  winning_strategy: string;

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

export type ManageLead = {
  id: string;
  // Core fields (mapped from CSV business_name)
  name: string;
  company: string;
  // CSV fields
  category: string | null;
  rating: number | null;
  review_count: number | null;
  phone: string | null;  // maps to phone_number
  email: string | null;
  address: string | null;
  website_url: string | null;
  google_maps_url: string | null;
  // Existing business fields
  source: ManageLeadSource;
  stage: ManageLeadStage;
  budget_estimate: number;
  urgency: ManageLeadUrgency;
  score: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
  notes: string | null;
  is_going_cold: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  ai_analysis: ManageLeadAnalysis;
};

export type ManageLeadInsights = {
  hot_leads_need_reply: number;
  leads_going_cold: number;
  leads_likely_to_close: number;
};

export type ManageLeadActivity = {
  id: string;
  lead_id: string;
  activity_type: string;
  message: string;
  created_at: string;
};

export type ManageLeadAnalytics = {
  total_leads: number;
  NEGOTIATION_count: number;
  conversion_rate: number;
  pipeline_value: number;
  stage_drop_offs: Record<string, number>;
};

export type BinLead = {
  id: string;
  name: string;
  company: string;
  email: string | null;
  deleted_at: string;
};

export type BulkLeadAction = "MOVE_STAGE" | "MARK_CONTACTED" | "MARK_RESPONDED" | "SOFT_DELETE";

export type CSVImportResult = {
  accepted: number;
  skipped: number;
  invalid: number;
  warnings: string[];
  errors: string[];
};

export type ManageLeadActionType =
  | "SEND_FOLLOW_UP"
  | "PROPOSE_PRICING"
  | "SCHEDULE_CALL"
  | "MOVE_STAGE";

export type ManageLeadView = "kanban" | "table" | "analytics" | "ai";
