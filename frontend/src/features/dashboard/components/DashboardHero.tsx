type DashboardHeroProps = {
  totalLeads: number;
  refreshing: boolean;
  lastUpdatedIso: string;
  onRefresh: () => void;
};

export const DashboardHero = ({
  totalLeads,
  refreshing,
  lastUpdatedIso,
  onRefresh,
}: DashboardHeroProps) => {
  const updatedLabel = new Date(lastUpdatedIso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header className="glass-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-accent">Command Center</p>
          <h1 className="bg-gradient-to-r from-content via-accent to-info bg-clip-text text-4xl font-semibold text-transparent">
            Growth Dashboard
          </h1>
          <p className="mt-2 text-sm text-content-secondary">
            Live signal overview across discovery, pipeline, and outreach.
          </p>
          <p className="mt-1 text-xs  ">
            {totalLeads} active leads | Updated at {updatedLabel}
          </p>
        </div>

        <button
          type="button"
          className="accent-btn min-w-36 px-4 py-2 text-xs uppercase tracking-[0.1em]"
          onClick={onRefresh}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>
    </header>
  );
};
