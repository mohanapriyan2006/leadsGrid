import { MetricWidget } from "../../components/ui/MetricWidget";
import type { ManageLead } from "../../features/leads/types/manageLead";
import { AIInsightsPanel } from "../../features/leads/analysis/components/AIInsightsPanel";
import { FiltersBar } from "../../features/leads/analysis/components/FiltersBar";
import { LeadQualityChart } from "../../features/leads/analysis/components/LeadQualityChart";
import { LeadScoreDistribution } from "../../features/leads/analysis/components/LeadScoreDistribution";
import { PredictionPanel } from "../../features/leads/analysis/components/PredictionPanel";
import { SourcePerformanceChart } from "../../features/leads/analysis/components/SourcePerformanceChart";
import { StageConversionChart } from "../../features/leads/analysis/components/StageConversionChart";
import { useLeadsAnalytics } from "../../features/leads/analysis/hooks/useLeadsAnalytics";
import { useLeadPredictions } from "../../features/leads/analysis/hooks/useLeadPredictions";

type LeadsAnalysisPageProps = {
  leads: ManageLead[];
};

export const LeadsAnalysisPage = ({ leads }: LeadsAnalysisPageProps) => {
  const {
    filters,
    filteredLeads,
    analytics,
    insights,
    setRange,
    setSource,
    setStage,
  } = useLeadsAnalytics(leads);

  const { prediction } = useLeadPredictions(filteredLeads);

  if (filteredLeads.length === 0) {
    return (
      <section className="glass-card space-y-3 p-6 text-center">
        <h3 className="text-xl font-semibold text-content">No leads match current filters</h3>
        <p className="text-sm text-content-secondary">
          Expand your time range or choose broader source/stage filters to unlock analytics.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <FiltersBar
        range={filters.range}
        source={filters.source}
        stage={filters.stage}
        onRangeChange={setRange}
        onSourceChange={setSource}
        onStageChange={setStage}
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricWidget title="Total Leads" value={String(analytics.totalLeads)} delta="Current filtered set" />
        <MetricWidget title="Qualified Leads" value={`${analytics.qualifiedLeadsPercent}%`} delta={`${analytics.qualifiedLeads} qualified`} />
        <MetricWidget title="Avg Lead Score" value={String(analytics.avgScore)} delta="Lead quality baseline" />
        <MetricWidget title="Conversion To CRM" value={`${analytics.conversionRate}%`} delta="Moved beyond board" />
        <MetricWidget title="High-Intent Leads" value={String(analytics.highIntentCount)} delta="Priority outreach queue" />
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <LeadScoreDistribution data={analytics.scoreDistribution} />
        <SourcePerformanceChart data={analytics.sourcePerformance} />
        <StageConversionChart data={analytics.stageConversion} />
        <LeadQualityChart data={analytics.leadVelocity} />
      </section>

      <PredictionPanel prediction={prediction} />
      <AIInsightsPanel insights={insights} />

      <section className="grid gap-3 lg:grid-cols-2">
        <article className="glass-card-sm p-4">
          <p className="text-xs uppercase tracking-[0.16em]  ">Best Leads To Contact Today</p>
          <ul className="mt-3 space-y-2 text-sm ">
            {prediction.highPotentialLeads.slice(0, 5).map((lead) => (
              <li key={lead.id} className="flex items-center justify-between gap-2 rounded-glass-sm border border-success/20 bg-success-soft px-3 py-2">
                <span>{lead.name}</span>
                <span className="text-xs ">Score {lead.score}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="glass-card-sm p-4">
          <p className="text-xs uppercase tracking-[0.16em]  ">Auto Discard Suggestions</p>
          <ul className="mt-3 space-y-2 text-sm text-content-secondary">
            {prediction.discardCandidates.slice(0, 5).map((lead) => (
              <li key={lead.id} className="flex items-center justify-between gap-2 rounded-glass-sm border border-danger/20 bg-danger-soft px-3 py-2">
                <span>{lead.name}</span>
                <span className="text-xs text-danger">Score {lead.score}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </section>
  );
};
