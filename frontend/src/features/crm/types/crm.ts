import type { DealStatus } from "../../common/types/ui";
import type { ManageLeadStage } from "../../leads/types/manageLead";

export type CRMStage = Extract<
  ManageLeadStage,
  "NEGOTIATION" | "CONTRACTED" | "IN_PROGRESS" | "CLOSED"
>;

export type Deal = {
  id: string;
  name: string;
  company: string;
  status: DealStatus;
  score: number;
  lastAction: string;
  daysInStage: number;
  value: string;
  email?: string | null;
  phone?: string | null;
  category?: string | null;
  rating?: number | null;
  review_count?: number | null;
  address?: string | null;
  website_url?: string | null;
  google_maps_url?: string | null;
  notes?: string | null;
};

export type NewDealDraft = Omit<Deal, "id">;
