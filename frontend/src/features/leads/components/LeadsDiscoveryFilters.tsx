import { LEAD_INDUSTRIES, LEAD_SOURCES } from "../constants/leadsPageOptions";
import type { Lead } from "../types/lead";

type LeadsDiscoveryFiltersProps = {
  sources: Lead["source"][];
  scoreMin: number;
  industry: string;
  onToggleSource: (source: Lead["source"]) => void;
  onScoreChange: (value: number) => void;
  onIndustryChange: (value: string) => void;
  onClear: () => void;
};

const sourceLabel = (source: Lead["source"]) => {
  if (source === "hackernews") return "HackerNews";
  if (source === "search") return "Web Search";
  if (source === "reddit") return "Reddit";
  if (source === "linkedin") return "LinkedIn";
  return "X";
};

export const LeadsDiscoveryFilters = ({
  sources,
  scoreMin,
  industry,
  onToggleSource,
  onScoreChange,
  onIndustryChange,
  onClear,
}: LeadsDiscoveryFiltersProps) => {
  return (
    <section className="rounded-2xl border border-accent/[0.12] bg-surface-secondary/80 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-content-tertiary">Signal Source</span>

        {LEAD_SOURCES.map((source) => {
          const active = sources.includes(source);
          return (
            <button
              key={source}
              type="button"
              onClick={() => onToggleSource(source)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                active
                  ? "border-accent/50 bg-accent/15 text-content"
                  : "border-accent/10 bg-surface/55 text-content-secondary hover:border-accent/30"
              }`}
            >
              {sourceLabel(source)}
            </button>
          );
        })}

        <div className="mx-1 h-5 w-px bg-accent/20" />

        <div className="flex items-center gap-2 rounded-full border border-accent/15 bg-surface/55 px-3 py-1">
          <span className="text-xs text-content-secondary">Min Score</span>
          <input
            type="range"
            min={0}
            max={100}
            value={scoreMin}
            onChange={(event) => onScoreChange(Number(event.target.value))}
            className="w-24 accent-accent"
          />
          <span className="text-xs font-semibold text-content">{scoreMin}</span>
        </div>

        <div className="mx-1 h-5 w-px bg-accent/20" />

        <select
          className="w-52 rounded-xl border border-accent/15 bg-surface/55 px-3 py-2 text-sm text-content outline-none focus:border-accent/40"
          value={industry}
          onChange={(event) => onIndustryChange(event.target.value)}
        >
          {LEAD_INDUSTRIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onClear}
          className="ml-auto rounded-lg border border-accent/15 bg-surface/55 px-2.5 py-1 text-xs text-content-secondary transition hover:border-accent/35 hover:text-content"
        >
          Clear all
        </button>
      </div>
    </section>
  );
};
