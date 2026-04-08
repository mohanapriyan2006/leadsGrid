import { MetricWidget } from "../../../components/ui/MetricWidget";
import type { DashboardKpi } from "../types/dashboard";

type DashboardKpiGridProps = {
  kpis: DashboardKpi[];
};

export const DashboardKpiGrid = ({ kpis }: DashboardKpiGridProps) => {
  return (
    <section className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
      {kpis.map((kpi) => (
        <MetricWidget key={kpi.id} title={kpi.title} value={kpi.value} delta={kpi.delta} />
      ))}
    </section>
  );
};
