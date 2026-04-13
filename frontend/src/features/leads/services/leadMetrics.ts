import type { ManageLead, ManageLeadAnalytics, ManageLeadInsights } from "../types/manageLead";

export const buildManageLeadInsights = (leads: ManageLead[]): ManageLeadInsights => ({
  hot_leads_need_reply: leads.filter((lead) => lead.score >= 80 && lead.stage === "RESPONDED").length,
  leads_going_cold: leads.filter((lead) => lead.is_going_cold).length,
  leads_likely_to_close: leads.filter((lead) => lead.score >= 70 && lead.stage === "NEGOTIATION").length,
});

export const buildManageLeadAnalytics = (leads: ManageLead[]): ManageLeadAnalytics => ({
  total_leads: leads.length,
  NEGOTIATION_count: leads.filter((lead) => lead.stage === "NEGOTIATION").length,
  conversion_rate: 15.5,
  pipeline_value: leads.reduce((acc, lead) => acc + (lead.budget_estimate || 0), 0),
  stage_drop_offs: { NEW: 10, CONTACTED: 5 },
});
