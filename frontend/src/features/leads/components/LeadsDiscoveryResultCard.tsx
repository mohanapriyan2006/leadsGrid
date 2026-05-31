import type { Lead } from "../types/lead";
import type { AdvancedLeadIntent } from "../services/leadAnalysisService";
import { AIIcon, SourceIcon, initials, scoreColor } from "./leadsPagePrimitives";

type LeadsDiscoveryResultCardProps = {
  lead: Lead;
  advancedIntent?: AdvancedLeadIntent;
  isAnalyzing?: boolean;
  isSaving?: boolean;
  index: number;
  isSelected: boolean;
  onSelect: (leadId: string) => void;
  onAnalyze: (lead: Lead) => void;
  onGenerateDraft: (lead: Lead) => void;
  onSaveLead: (lead: Lead) => void;
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
  advancedIntent,
  isAnalyzing = false,
  isSaving = false,
  index,
  isSelected,
  onSelect,
  onAnalyze,
  onGenerateDraft,
  onSaveLead,
}: LeadsDiscoveryResultCardProps) => {
  const isHot = lead.score >= 85;
  const displayName = lead.author || lead.id;
  const isQualified = advancedIntent?.status === "qualified";
  const disableSave = !!advancedIntent && !isQualified;

  return (
    <article
      onClick={() => onSelect(lead.id)}
      className={`relative cursor-pointer overflow-auto rounded-2xl border p-4 transition-all ${
        isSelected
          ? "border-accent/40 bg-surface-secondary/95 shadow-[0_8px_28px_rgba(167,139,250,0.18)]"
          : "border-accent/12 bg-surface-secondary/75 hover:border-accent/30 hover:bg-surface-secondary/90"
      }`}
      style={{ animationDelay: `${index * 55}ms` }}
    >
      {isHot ? <span className="absolute inset-y-0 left-0 w-1 bg-accent-secondary/80" /> : null}

      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-surface/60 text-sm font-semibold text-content-secondary">
            {initials(displayName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-content">{displayName}</p>
            <p className="truncate text-xs text-content-secondary">{lead.title ?? "Opportunity"}</p>
            <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-accent/15 bg-surface/50 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em]  ">
              <SourceIcon source={lead.source} />
              {sourceLabel(lead.source)}
            </div>
          </div>
        </div>

        <div className="text-right">
          {isHot ? (
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-accent-secondary">High Intent</p>
          ) : null}
          <p className="text-xl font-bold text-content">{lead.score}</p>
          <div className="mt-1 h-1 w-20 rounded bg-surface/70">
            <div
              className="h-1 rounded"
              style={{ width: `${lead.score}%`, backgroundColor: scoreColor(lead.score) }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="overflow-hidden break-words text-sm text-content-secondary [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
          {lead.content}
        </p>
        <div className="rounded-xl border border-accent-tertiary/20 bg-accent-tertiary/10 px-3 py-2">
          <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-accent-tertiary">
            <AIIcon />
            Signal Summary
          </p>
          <p className="overflow-hidden break-words text-xs text-content-secondary [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
            {lead.summary}
          </p>
        </div>

        {advancedIntent ? (
          <div className="rounded-xl border border-accent-secondary/20 bg-accent-secondary/10 px-3 py-2">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full border border-accent/20 bg-surface/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-content-secondary">
                {advancedIntent.status}
              </span>
              <span className="rounded-full border border-accent/20 bg-surface/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-content-secondary">
                {advancedIntent.category}
              </span>
              <span className="rounded-full border border-accent/20 bg-surface/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-content-secondary">
                Decision: {advancedIntent.decision_maker}
              </span>
              <span className="rounded-full border border-accent/20 bg-surface/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-content-secondary">
                Urgency: {advancedIntent.urgency}
              </span>
              {advancedIntent.buying_signals.length > 0 ? (
                <span className="rounded-full border border-accent/20 bg-surface/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-content-secondary">
                  Signals: {advancedIntent.buying_signals.length}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-content-secondary">Pain: {advancedIntent.pain_point}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-accent/10 pt-3">
        <div className="flex flex-wrap items-center gap-2 text-xs  ">
          <span>{lead.timeAgo ?? "just now"}</span>
          <span>•</span>
          <span className="capitalize">{lead.intent_label}</span>
          {lead.tags.length > 0 ? (
            <>
              <span>•</span>
              <span className="break-words">{lead.tags.slice(0, 2).join(" · ")}</span>
            </>
          ) : null}
        </div>

        <div className="flex md:flex-row flex-col items-center gap-2">
          <button
            type="button"
            className="glass-btn px-3 py-1.5 text-[11px]"
            disabled={isAnalyzing}
            onClick={(event) => {
              event.stopPropagation();
              onAnalyze(lead);
            }}
          >
            {isAnalyzing ? "Analyzing..." : "Analyze"}
          </button>
          <button
            type="button"
            className="glass-btn px-3 py-1.5 text-[11px]"
            disabled={disableSave || isSaving || isAnalyzing}
            onClick={(event) => {
              event.stopPropagation();
              onSaveLead(lead);
            }}
          >
            {isSaving ? "Saving..." : disableSave ? "Unqualified" : "Save"}
          </button>
          <button
            type="button"
            className="accent-btn px-3 py-1.5 text-[11px]"
            disabled={isAnalyzing}
            onClick={(event) => {
              event.stopPropagation();
              void onGenerateDraft(lead);
            }}
          >
            {isAnalyzing ? "Analyzing..." : "Generate Draft"}
          </button>
        </div>
      </div>
    </article>
  );
};
