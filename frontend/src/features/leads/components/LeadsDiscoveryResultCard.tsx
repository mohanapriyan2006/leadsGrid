import type { Lead } from "../types/lead";
import { AIIcon, SourceIcon, initials, scoreColor } from "./leadsPagePrimitives";

type LeadsDiscoveryResultCardProps = {
  lead: Lead;
  index: number;
  isSelected: boolean;
  onSelect: (leadId: string) => void;
  onGenerateDraft: (lead: Lead) => void;
};

const sourceLabel = (source: Lead["source"]) => {
  if (source === "hackernews") return "HackerNews Thread";
  if (source === "search") return "Web Search Signal";
  if (source === "reddit") return "Reddit Signal";
  if (source === "linkedin") return "LinkedIn Post";
  return "X Thread";
};

export const LeadsDiscoveryResultCard = ({
  lead,
  index,
  isSelected,
  onSelect,
  onGenerateDraft,
}: LeadsDiscoveryResultCardProps) => {
  const isHot = lead.score >= 90;
  const displayName = lead.author || lead.id;

  return (
    <article
      onClick={() => onSelect(lead.id)}
      className={`relative cursor-pointer overflow-hidden rounded-2xl border p-4 transition hover:-translate-y-0.5 ${
        isSelected
          ? "border-accent/40 bg-surface-secondary/90 shadow-glow"
          : "border-accent/10 bg-surface-secondary/70 hover:border-accent/30"
      }`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {isHot ? <span className="absolute inset-y-0 right-0 w-1 bg-warning/70" /> : null}

      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-sm font-semibold text-content-secondary">
            {initials(displayName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-content">{displayName}</p>
            <p className="truncate text-xs text-content-secondary">{lead.title ?? "Unknown Role"}</p>
          </div>
        </div>

        <div className="text-right">
          {isHot ? (
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-warning">Hot Signal</p>
          ) : null}
          <p className="text-xl font-bold text-content">{lead.score}</p>
          <div className="mt-1 h-1 w-20 rounded bg-surface">
            <div
              className="h-1 rounded"
              style={{ width: `${lead.score}%`, backgroundColor: scoreColor(lead.score) }}
            />
          </div>
        </div>
      </div>

      <div className="mb-3 grid gap-2 md:grid-cols-2">
        <div className="rounded-xl border border-accent/10 bg-surface/60 p-3">
          <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-content-tertiary">
            <SourceIcon source={lead.source} />
            {sourceLabel(lead.source)}
          </p>
          <p className="line-clamp-3 text-xs text-content-secondary">{lead.content}</p>
        </div>

        <div className="rounded-xl border border-accent/10 bg-surface/60 p-3">
          <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-accent">
            <AIIcon />
            AI Take
          </p>
          <p className="line-clamp-3 text-xs text-content-secondary">{lead.summary}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-content-tertiary">
          <span>{lead.timeAgo ?? "just now"}</span>
          <span>•</span>
          <span>{lead.intent_label}</span>
          <span>•</span>
          <span>{lead.tags.slice(0, 2).join(" · ")}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="glass-btn px-2 py-1 text-[11px]"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            Save
          </button>
          <button
            type="button"
            className="accent-btn px-2.5 py-1 text-[11px]"
            onClick={(event) => {
              event.stopPropagation();
              void onGenerateDraft(lead);
            }}
          >
            Generate Draft
          </button>
        </div>
      </div>
    </article>
  );
};
