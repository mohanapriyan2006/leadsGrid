import { PanelCard } from "../../../components/ui/PanelCard";
import { DASHBOARD_STAGE_COLORS } from "../constants/dashboard";
import type { DashboardStageMetric } from "../types/dashboard";

type DashboardPipelineWidgetProps = {
  stageMetrics: DashboardStageMetric[];
};

export const DashboardPipelineWidget = ({ stageMetrics }: DashboardPipelineWidgetProps) => {
  const maxCount = Math.max(1, ...stageMetrics.map((item) => item.count));

  return (
    <PanelCard className="space-y-3">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-accent">Pipeline</p>
        <h2 className="text-xl font-semibold text-content">Stage Distribution</h2>
      </div>

      <div className="space-y-2">
        {stageMetrics.map((metric) => {
          const width = `${Math.max((metric.count / maxCount) * 100, metric.count > 0 ? 8 : 0)}%`;

          return (
            <div key={metric.stage} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-content-secondary">{metric.label}</span>
                <span className="font-semibold text-content">{metric.count}</span>
              </div>

              <div className="h-2 rounded-full bg-surface-secondary/90">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width,
                    background: `linear-gradient(90deg, ${DASHBOARD_STAGE_COLORS[metric.stage]}99, ${DASHBOARD_STAGE_COLORS[metric.stage]})`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </PanelCard>
  );
};
