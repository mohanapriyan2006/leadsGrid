import { PanelCard } from "../../../components/ui/PanelCard";
import { ScoreBadge } from "../../../components/ui/ScoreBadge";
import { Tag } from "../../../components/ui/Tag";
import type { ManageLead } from "../../leads/types/manageLead";

type DashboardHotLeadsWidgetProps = {
  leads: ManageLead[];
};

const sourceLabel = (source: ManageLead["source"]) => {
  if (source === "linkedin") return "LinkedIn";
  if (source === "reddit") return "Reddit";
  return "Website";
};

export const DashboardHotLeadsWidget = ({ leads }: DashboardHotLeadsWidgetProps) => {
  return (
    <PanelCard className="p-0">
      <div className="border-b border-accent/10 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.18em] text-accent">Hot Leads</p>
        <h2 className="text-xl font-semibold text-content">Reply Queue</h2>
      </div>

      <div className="space-y-2 p-3">
        {leads.length === 0 ? (
          <div className="rounded-glass-sm border border-accent/10 bg-surface-secondary/70 p-4 text-sm text-content-secondary">
            No hot leads yet. Add or score more leads to populate this queue.
          </div>
        ) : (
          leads.map((lead) => (
            <article
              key={lead.id}
              className="rounded-glass-sm border border-accent/10 bg-surface-secondary/65 p-3 transition hover:border-accent/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-content">{lead.name}</p>
                  <p className="text-xs text-content-secondary">{lead.company}</p>
                </div>
                <ScoreBadge score={lead.score} />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-content-secondary">
                <span className="rounded-full border border-info/30 bg-info-soft  text-white  px-2 py-0.5 text-info">
                  {sourceLabel(lead.source)}
                </span>
                <span className="rounded-full  text-white  border border-accent/20 bg-accent-soft px-2 py-0.5 text-accent">
                  {lead.stage}
                </span>
                {lead.urgency === "high" ? <Tag label="URGENT" /> : null}
                {lead.score >= 90 ? <Tag label="HOT SIGNAL" /> : null}
              </div>

              <p className="mt-2 line-clamp-2 text-xs text-content-secondary">
                {lead.ai_analysis.next_action || "Review lead details and send a personalized follow up."}
              </p>
            </article>
          ))
        )}
      </div>
    </PanelCard>
  );
};
