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
    filteredDeals,
    analytics,
    dateRange,
    setDateRange,
    pipelineFilter,
    setPipelineFilter,
  } = useCRMAnalytics(deals);

  const { prediction, insights } = usePrediction(filteredDeals, analytics);

  if (filteredDeals.length === 0) {
    return (
      <section className="glass-card space-y-3 p-6 text-center">
        <h3 className="text-xl font-semibold text-content">No deals match current filters</h3>
        <p className="text-sm  ">
          Adjust the time window or pipeline filter to surface analytics insights.
        </p>
      </section>
    );
  }

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

      <section className="grid gap-3 lg:grid-cols-2">
        <article className="glass-card-sm p-4">
          <p className="text-xs uppercase tracking-[0.16em]  text-content-tertiaryy">Top Close Candidates</p>
          <ul className="mt-3 space-y-2 text-sm  ">
            {prediction.closingDeals.slice(0, 5).map((deal) => (
              <li key={deal.id} className="flex items-center justify-between gap-2 rounded-glass-sm border border-success/20 bg-success-soft px-3 py-2">
                <span>{deal.name}</span>
                <span className="text-xs text-success">Score {deal.score}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="glass-card-sm p-4">
          <p className="text-xs uppercase tracking-[0.16em]  text-content-tertiaryy">Needs Intervention</p>
          <ul className="mt-3 space-y-2 text-sm  ">
            {prediction.atRiskDeals.slice(0, 5).map((deal) => (
              <li key={deal.id} className="flex items-center justify-between gap-2 rounded-glass-sm border border-danger/20 bg-danger-soft px-3 py-2">
                <span>{deal.name}</span>
                <span className="text-xs ">{deal.daysInStage}d in stage</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </section>
  );
};
