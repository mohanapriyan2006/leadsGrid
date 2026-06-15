import { Search, ExternalLink, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { AgentCardData } from "../../types/agent";

type DiscoveryOverviewCardProps = {
  card: AgentCardData;
  onAction: (action: string, payload?: Record<string, unknown>) => void;
};

export const DiscoveryOverviewCard = ({ card, onAction }: DiscoveryOverviewCardProps) => {
  const navigate = useNavigate();
  const leads = (card.data.leads as Array<Record<string, unknown>>) || [];
  const query = (card.data.query as string) || "";

  return (
    <div className="mt-2 w-full overflow-hidden rounded-xl border border-accent/[0.1] bg-surface-secondary/50">
      <div className="flex items-center gap-2 border-b border-accent/[0.08] px-3 py-2">
        <Search className="h-4 w-4 text-accent" />
        <span className="text-sm font-semibold text-content">{card.title}</span>
        <span className="ml-auto text-xs text-content-secondary">{query}</span>
      </div>

      {leads.length > 0 ? (
        <div className="max-h-64 overflow-y-auto px-1 py-1">
          {leads.map((lead, index) => (
            <div
              key={String(lead.id || index)}
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 transition hover:bg-surface-tertiary/40"
            >
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-accent/[0.08] text-xs font-bold text-accent">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-content">
                  {String(lead.name || lead.title || "Unnamed Lead")}
                </p>
                <p className="truncate text-[11px] text-content-secondary">
                  {String(lead.company || lead.platform || "")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onAction("save_lead", { lead })}
                className="flex h-7 items-center gap-1 rounded-lg border border-accent/[0.12] bg-surface/40 px-2 text-[11px] text-content-secondary transition hover:bg-accent/10 hover:text-accent"
                title="Save to Manage Leads"
              >
                <Save className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="px-3 py-4 text-center text-sm text-content-secondary">No leads found.</p>
      )}

      <div className="flex gap-2 border-t border-accent/[0.08] px-3 py-2">
        <button
          type="button"
          onClick={() => navigate("/leads-discovery")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-accent/[0.1] bg-surface/40 py-2 text-[12px] font-medium text-content-secondary transition hover:border-accent/20 hover:text-content"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Go to Page
        </button>
        <button
          type="button"
          onClick={() => onAction("save_all_leads", { leads })}
          disabled={leads.length === 0}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent/90 py-2 text-[12px] font-semibold text-surface transition hover:bg-accent disabled:opacity-40"
        >
          <Save className="h-3.5 w-3.5" />
          Save All
        </button>
      </div>
    </div>
  );
};
