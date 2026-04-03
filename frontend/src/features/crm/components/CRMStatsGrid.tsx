import type { Deal } from "../types/crm";

type CRMStatsGridProps = {
  deals: Deal[];
  totalValue: number;
  closedValue: number;
};

export const CRMStatsGrid = ({
  deals,
  totalValue,
  closedValue,
}: CRMStatsGridProps) => {
  const averageScore = deals.length
    ? Math.round(
        deals.reduce((sum, deal) => sum + deal.score, 0) / deals.length,
      )
    : 0;

  const stats = [
    {
      label: "ACTIVE PIPELINE",
      value: `$${totalValue.toLocaleString()}`,
      color: "#b595ff",
      sub: "Open opportunities",
    },
    {
      label: "CLOSED WON",
      value: `$${closedValue.toLocaleString()}`,
      color: "#10B981",
      sub: "Realized revenue",
    },
    {
      label: "TOTAL LEADS",
      value: String(deals.length),
      color: "#F9FAFB",
      sub: "Tracked accounts",
    },
    {
      label: "AVG. SCORE",
      value: String(averageScore),
      color: "#F59E0B",
      sub: "Overall quality",
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <article
          key={item.label}
          className="glass-card group relative overflow-hidden p-4 transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-glow"
        >
          <div className="pointer-events-none absolute inset-0 opacity-0 blur-3xl transition group-hover:opacity-100">
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(167,139,250,0.4),transparent_60%)]" />
          </div>
          <p className="text-[11px] tracking-[0.18em] text-content-tertiary">
            {item.label}
          </p>
          <p
            className="mt-2 text-3xl font-semibold drop-shadow-sm"
            style={{ color: item.color }}
          >
            {item.value}
          </p>
          <p className="mt-1 text-[11px] text-content-secondary">{item.sub}</p>
        </article>
      ))}
    </div>
  );
};
