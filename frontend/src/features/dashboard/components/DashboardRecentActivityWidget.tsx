import { PanelCard } from "../../../components/ui/PanelCard";
import type { DashboardRecentActivity } from "../types/dashboard";

type DashboardRecentActivityWidgetProps = {
  activity: DashboardRecentActivity[];
};

export const DashboardRecentActivityWidget = ({
  activity,
}: DashboardRecentActivityWidgetProps) => {
  return (
    <PanelCard className="space-y-3">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-accent">Recent Activity</p>
        <h2 className="text-xl font-semibold text-content">Latest Lead Signals</h2>
      </div>

      <div className="space-y-2">
        {activity.length === 0 ? (
          <div className="rounded-glass-sm border border-accent/10 bg-surface-secondary/70 p-4 text-sm text-content-secondary">
            Activity will appear here after lead updates and actions.
          </div>
        ) : (
          activity.map((entry) => (
            <article
              key={entry.id}
              className="flex items-start justify-between gap-3 rounded-glass-sm border border-accent/10 bg-surface-secondary/65 p-3"
            >
              <div>
                <p className="text-sm font-semibold text-content">{entry.title}</p>
                <p className="text-xs text-content-secondary">{entry.subtitle}</p>
              </div>
              <span className="whitespace-nowrap text-[11px] text-content-tertiary">{entry.timestamp}</span>
            </article>
          ))
        )}
      </div>
    </PanelCard>
  );
};
