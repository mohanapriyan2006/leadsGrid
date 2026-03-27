export type ManageLeadStage =
  | "NEW_LEADS"
  | "QUALIFIED"
  | "CONTACTED"
  | "NEGOTIATION"
  | "WON"
  | "LOST";

export type ManageLeadSource = "reddit" | "linkedin" | "website";
export type ManageLeadUrgency = "low" | "medium" | "high";

export type ManageLeadAnalysis = {
  intent_score: number;
  pain_points: string[];
  suggested_pitch: string;
  portfolio_match: string;
  next_action: string;
  deal_probability: number;
  expected_close_days: number;
  ghost_probability: number;
  winning_strategy: string;
};

export type ManageLead = {
  id: string;
  name: string;
  company: string;
  source: ManageLeadSource;
  stage: ManageLeadStage;
  email: string | null;
  phone: string | null;
  budget_estimate: number;
  urgency: ManageLeadUrgency;
  score: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
  notes: string | null;
  is_going_cold: boolean;
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
  won_count: number;
  lost_count: number;
  conversion_rate: number;
  pipeline_value: number;
  stage_drop_offs: Record<string, number>;
};

export type ManageLeadActionType =
  | "SEND_FOLLOW_UP"
  | "PROPOSE_PRICING"
  | "SCHEDULE_CALL"
  | "MOVE_STAGE";

export type ManageLeadView = "kanban" | "table" | "analytics" | "ai";
