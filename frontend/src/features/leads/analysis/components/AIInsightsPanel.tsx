import type { LeadsAIInsights } from "../types/leadsAnalytics";

type AIInsightsPanelProps = {
  insights: LeadsAIInsights;
};

export const AIInsightsPanel = ({ insights }: AIInsightsPanelProps) => {
  return (
    <section className="glass-card space-y-4 p-4 sm:p-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-content">AI Insights</h3>
        <span className="rounded-full border border-accent/25 bg-accent-soft px-3 py-1 text-xs">
          Lead Intelligence
        </span>
      </header>

      <div className="grid gap-3 lg:grid-cols-3">
        <article className="rounded-glass-sm border border-info/25 bg-info-soft p-3 text-info">
          <p className="text-xs uppercase tracking-[0.16em]">Insights</p>
          <ul className="mt-2 space-y-2 text-sm">
            {insights.insights.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-glass-sm border border-success/25 bg-success-soft p-3 text-success">
          <p className="text-xs uppercase tracking-[0.16em]">Actions</p>
          <ul className="mt-2 space-y-2 text-sm">
            {insights.actions.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-glass-sm border border-danger/25 bg-danger-soft p-3 text-danger">
          <p className="text-xs uppercase tracking-[0.16em]">Warning</p>
          <p className="mt-2 rounded-glass-sm border border-danger/30 bg-surface/35 px-2 py-1.5 text-sm">
            {insights.warning}
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.16em]">Best Leads Today</p>
          <ul className="mt-1 max-h-28 space-y-1 overflow-auto text-xs">
            {insights.bestLeadsToday.map((lead) => (
              <li key={lead.id}>- {lead.name} ({lead.score})</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
};
