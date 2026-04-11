import type { LeadPrediction } from "../types/leadsAnalytics";

type PredictionPanelProps = {
  prediction: LeadPrediction;
};

export const PredictionPanel = ({ prediction }: PredictionPanelProps) => {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <article className="glass-card-sm p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-content-tertiary">Likely to Convert</p>
        <p className="mt-2 text-2xl font-semibold text-content">{prediction.highPotentialLeads.length}</p>
        <p className="mt-1 text-xs text-success">High-potential leads</p>
      </article>

      <article className="glass-card-sm p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-content-tertiary">Leads to Discard</p>
        <p className="mt-2 text-2xl font-semibold text-content">{prediction.discardCandidates.length}</p>
        <p className="mt-1 text-xs text-danger">{prediction.lowQualityLeads.length} low-quality identified</p>
      </article>

      <article className="glass-card-sm p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-content-tertiary">Conversion Probability</p>
        <p className="mt-2 text-2xl font-semibold text-content">{prediction.conversionProbability}%</p>
        <p className="mt-1 text-xs text-info">Expected conversions: {prediction.expectedConversions}</p>
      </article>

      <article className="glass-card-sm p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-content-tertiary">High ROI Leads</p>
        <p className="mt-2 text-2xl font-semibold text-content">{prediction.highRoiLeads.length}</p>
        <p className="mt-1 text-xs text-accent">Best score + budget fit</p>
      </article>
    </section>
  );
};
