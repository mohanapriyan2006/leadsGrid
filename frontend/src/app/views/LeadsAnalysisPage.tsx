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
    </section>
  );
};
