import { MetricWidget } from "../../components/ui/MetricWidget";
import type { Deal } from "../../features/crm/types/crm";
import { AIInsightsPanel } from "../../features/crm/analysis/components/AIInsightsPanel";
import { ConversionFunnel } from "../../features/crm/analysis/components/ConversionFunnel";
import { DealVelocityChart } from "../../features/crm/analysis/components/DealVelocityChart";
import { FiltersBar } from "../../features/crm/analysis/components/FiltersBar";
import { PipelineChart } from "../../features/crm/analysis/components/PipelineChart";
import { PredictionCards } from "../../features/crm/analysis/components/PredictionCards";
import { RevenueForecastChart } from "../../features/crm/analysis/components/RevenueForecastChart";
import { useCRMAnalytics } from "../../features/crm/analysis/hooks/useCRMAnalytics";
import { usePrediction } from "../../features/crm/analysis/hooks/usePrediction";

type CRMAnalysisPageProps = {
  deals: Deal[];
};

const toCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export const CRMAnalysisPage = ({ deals }: CRMAnalysisPageProps) => {
  const {
    analytics,
    dateRange,
    setDateRange,
    pipelineFilter,
    setPipelineFilter,
  } = useCRMAnalytics(deals);

  const { prediction, insights } = usePrediction(deals, analytics);

  return (
    <section className="space-y-4">
      <FiltersBar
        dateRange={dateRange}
        pipelineFilter={pipelineFilter}
        onDateRangeChange={setDateRange}
        onPipelineFilterChange={setPipelineFilter}
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricWidget title="Total Deals" value={String(analytics.totalDeals)} delta="Filtered active window" />
        <MetricWidget title="Pipeline Value" value={toCurrency(analytics.totalValue)} delta="Current weighted value" />
        <MetricWidget title="Win Rate" value={`${analytics.winRate}%`} delta="Closed deal conversion" />
        <MetricWidget title="Avg Deal Size" value={toCurrency(analytics.avgDealSize)} delta="Value efficiency" />
        <MetricWidget title="Avg Time To Close" value={`${analytics.avgCloseTime}d`} delta="Velocity benchmark" />
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <PipelineChart data={analytics.stageDistribution} />
        <ConversionFunnel data={analytics.conversionFunnel} />
        <RevenueForecastChart data={analytics.revenueTrend} />
        <DealVelocityChart data={analytics.dealVelocity} />
      </section>

      <PredictionCards prediction={prediction} />
      <AIInsightsPanel insights={insights} />
    </section>
  );
};
