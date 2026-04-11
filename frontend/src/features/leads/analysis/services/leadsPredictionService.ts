import type { ManageLead } from "../../types/manageLead";
import type { LeadPrediction } from "../types/leadsAnalytics";

const getProbability = (lead: ManageLead) => {
  const base = lead.score / 100;
  const stageBoost =
    lead.stage === "NEGOTIATION"
      ? 0.2
      : lead.stage === "RESPONDED"
        ? 0.12
        : lead.stage === "QUALIFIED"
          ? 0.07
          : 0;

  return Math.min(1, Number((base + stageBoost).toFixed(2)));
};

export const leadsPredictionService = {
  buildPrediction(leads: ManageLead[]): LeadPrediction {
    const highPotentialLeads = leads
      .filter((lead) => lead.score > 70)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    const lowQualityLeads = leads
      .filter((lead) => lead.score < 30)
      .sort((a, b) => a.score - b.score)
      .slice(0, 8);

    const probabilities = leads.map(getProbability);
    const conversionProbability =
      probabilities.length === 0
        ? 0
        : Number(((probabilities.reduce((sum, probability) => sum + probability, 0) / probabilities.length) * 100).toFixed(1));

    const expectedConversions = Number(probabilities.reduce((sum, probability) => sum + probability, 0).toFixed(1));

    const highRoiLeads = leads
      .filter((lead) => lead.score >= 75 && lead.budget_estimate >= 1000)
      .sort((a, b) => (b.score + b.budget_estimate / 1000) - (a.score + a.budget_estimate / 1000))
      .slice(0, 5);

    const discardCandidates = leads
      .filter((lead) => lead.score <= 25 && lead.stage === "NEW")
      .sort((a, b) => a.score - b.score)
      .slice(0, 10);

    return {
      highPotentialLeads,
      lowQualityLeads,
      conversionProbability,
      expectedConversions,
      highRoiLeads,
      discardCandidates,
    };
  },
};
