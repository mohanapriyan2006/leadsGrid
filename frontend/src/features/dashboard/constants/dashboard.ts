import type { ManageLeadStage } from "../../leads/types/manageLead";
import type { DashboardQuickAction } from "../types/dashboard";

export const DASHBOARD_STAGE_ORDER: ManageLeadStage[] = [
  "NEW",
  "QUALIFIED",
  "CONTACTED",
  "RESPONDED",
  "NEGOTIATION",
  "CONTRACTED",
  "IN_PROGRESS",
  "CLOSED",
];

export const DASHBOARD_STAGE_LABELS: Record<ManageLeadStage, string> = {
  NEW: "New",
  QUALIFIED: "Qualified",
  CONTACTED: "Contacted",
  RESPONDED: "Responded",
  NEGOTIATION: "Negotiation",
  CONTRACTED: "Contracted",
  IN_PROGRESS: "In Progress",
  CLOSED: "Closed",
};

export const DASHBOARD_STAGE_COLORS: Record<ManageLeadStage, string> = {
  NEW: "#64748b",
  QUALIFIED: "#60a5fa",
  CONTACTED: "#22d3ee",
  RESPONDED: "#a78bfa",
  NEGOTIATION: "#f59e0b",
  CONTRACTED: "#10b981",
  IN_PROGRESS: "#c084fc",
  CLOSED: "#34d399",
};

export const DASHBOARD_QUICK_ACTIONS: DashboardQuickAction[] = [
  {
    id: "discover",
    label: "Discover Leads",
    description: "Find high-intent prospects from active channels",
    path: "/leads-discovery",
  },
  {
    id: "manage",
    label: "Manage Pipeline",
    description: "Move deals through stages and run actions",
    path: "/manage-leads",
  },
  {
    id: "crm",
    label: "Open CRM",
    description: "Review deal health and close opportunities",
    path: "/crm",
  },
  {
    id: "messages",
    label: "Send Messages",
    description: "Compose and send personalized outreach",
    path: "/messages",
  },
  {
    id: "ai",
    label: "AI Workspace",
    description: "Generate strategy and outreach assistance",
    path: "/ai",
  },
];
