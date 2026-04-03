import { Link } from "react-router-dom";

import { PanelCard } from "../../../components/ui/PanelCard";
import type { DashboardQuickAction } from "../types/dashboard";

type DashboardQuickActionsWidgetProps = {
  actions: DashboardQuickAction[];
};

export const DashboardQuickActionsWidget = ({
  actions,
}: DashboardQuickActionsWidgetProps) => {
  return (
    <PanelCard className="space-y-3">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-accent">Quick Actions</p>
        <h2 className="text-xl font-semibold text-content">Jump to Workspaces</h2>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {actions.map((action) => (
          <Link
            key={action.id}
            to={action.path}
            className="rounded-glass-sm border border-accent/15 bg-surface-secondary/70 p-3 transition hover:-translate-y-0.5 hover:border-accent/35"
          >
            <p className="text-sm font-semibold text-content">{action.label}</p>
            <p className="mt-1 text-xs text-content-secondary">{action.description}</p>
          </Link>
        ))}
      </div>
    </PanelCard>
  );
};
