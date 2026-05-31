import type { AIInsights } from "../types/analytics";

type AIInsightsPanelProps = {
  insights: AIInsights;
};

export const AIInsightsPanel = ({ insights }: AIInsightsPanelProps) => {
  return (
    <section className="glass-card space-y-4 p-4 sm:p-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-content">AI Insights Panel</h3>
        <span className="rounded-full border border-accent/25 bg-accent-soft px-3 py-1 text-xs">
          Decision Intelligence
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
          <p className="text-xs uppercase tracking-[0.16em]">Recommended Actions</p>
          <ul className="mt-2 space-y-2 text-sm">
            {insights.actions.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-glass-sm border border-danger/25 bg-danger-soft p-3 text-danger">
          <p className="text-xs uppercase tracking-[0.16em]">Risk Alerts</p>
          <ul className="mt-2 space-y-2 text-sm">
            {insights.risks.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </article>
      </div>

      <div className="rounded-glass-sm border border-accent/25 bg-surface-secondary/70 p-3">
        <p className="text-xs uppercase tracking-[0.18em]  ">Next Best Action</p>
        <p className="mt-2 text-sm text-content">{insights.nextBestAction}</p>
      </div>
    </section>
  );
};
