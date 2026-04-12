export type Lead = {
  company: any;
  id: string;
  source: "reddit" | "twitter" | "linkedin" | "hackernews" | "search";
  author: string;
  title?: string;
  email?: string | null;
  avatar?: string;
  location?: string;
  timeAgo?: string;
  budget?: boolean;
  urgency?: boolean;
  permalink?: string | null;
  content: string;
  summary: string;
  score: number;
  decision_maker?: "yes" | "no" | "unknown";
  buying_signals?: string[];
  pain_point?: string;
  category?: "hiring" | "problem" | "switching" | "learning" | "discussion";
  status?: "qualified" | "unqualified";
  tags: string[];
  intent_label: string;
  created_at: string;
  ai_analysis?: LeadAnalysis;
};

export type LeadIntentDetails = {
  score: number;
  urgency: "low" | "medium" | "high";
  budget: "low" | "medium" | "high" | "unknown";
  decision_maker: "yes" | "no" | "unknown";
  pain_point: string;
  lead_type: "job" | "complaint" | "learning" | "hiring";
};

export type LeadValidationResult = {
  is_valid_lead: boolean;
  reason: string;
};

export type LeadOutreachMessage = {
  message: string;
};

export type LeadFollowUpMessage = {
  message: string;
};

export type LeadActionSuggestion = {
  action: "ignore" | "save" | "contact_now";
  reason: string;
};

export type LeadPortfolioMatch = {
  project_name: string;
  why_match: string;
};

export type LeadAnalysis = {
  intent: LeadIntentDetails;
  validation: LeadValidationResult;
  outreach: LeadOutreachMessage;
  follow_up: LeadFollowUpMessage;
  action: LeadActionSuggestion;
  portfolio_match: LeadPortfolioMatch | null;
  analyzed_at: string;
};

export type HyperPersonalizedOutreachRequest = {
  lead_text: string;
  lead_title?: string;
  lead_author?: string;
  pain_point: string;
  user_skills: string[];
  portfolio_summary: string;
  tone: "professional" | "friendly" | "direct";
};

export type HyperPersonalizedOutreachMetadata = {
  provider: string;
  personalization_score: number;
  compliance_score: number;
  word_count: number;
  within_word_limit: boolean;
  has_soft_cta: boolean;
  rewritten: boolean;
  violations: string[];
  constraints_checked: string[];
};

export type HyperPersonalizedOutreachResult = {
  message: string;
  metadata: HyperPersonalizedOutreachMetadata;
};
