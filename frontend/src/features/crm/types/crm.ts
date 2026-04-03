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
};

export type NewDealDraft = Omit<Deal, "id">;
