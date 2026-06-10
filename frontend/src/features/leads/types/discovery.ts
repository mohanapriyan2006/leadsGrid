import type { Lead } from "./lead";

export type DiscoveryLeadDto = {
  id: string | null;
  title: string;
  summary: string;
  content: string;
  platform: string;
  score: number;
  upvotes: number;
  url: string | null;
  author: string | null;
  email: string | null;
  created_at: string | null;

  // 3-stage AI pipeline enrichment
  ai_enriched?: boolean;
  ai_dropped?: boolean;
  drop_reason?: string | null;
  lead_category?: string | null;
  is_actionable_lead?: boolean | null;
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
  raw_score?: number | null;
};

export type DiscoveryParams = {
  query: string;
  limit?: number;
  selectedSources?: Lead["source"][];
};
