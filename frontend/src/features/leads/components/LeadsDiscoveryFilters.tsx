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
    <section className="glass-card-sm p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-content">Refine Results</h3>
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border border-accent/15 bg-surface/50 px-2.5 py-1 text-xs text-content-secondary transition hover:border-accent/35 hover:text-content"
        >
          Reset
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em]  ">Sources</p>
          <div className="flex flex-wrap gap-2">
            {LEAD_SOURCES.map((source) => {
              const active = sources.includes(source);
              return (
                <button
                  key={source}
                  type="button"
                  onClick={() => onToggleSource(source)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    active
                      ? "border-accent-secondary/50 bg-accent-secondary/15 text-content"
                      : "border-accent/10 bg-surface/55 text-content-secondary hover:border-accent/30"
                  }`}
                >
                  {sourceLabel(source)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em]  ">Minimum Score</p>
          <div className="rounded-xl border border-accent/15 bg-surface/50 px-3 py-2">
            <input
              type="range"
              min={0}
              max={100}
              value={scoreMin}
              onChange={(event) => onScoreChange(Number(event.target.value))}
              className="w-full accent-accent"
            />
            <div className="mt-1 flex items-center justify-between text-xs text-content-secondary">
              <span>0</span>
              <span className="font-semibold text-content">{scoreMin}</span>
              <span>100</span>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em]  ">Industry</p>
          <select
            className="glass-input h-[42px] px-3"
            value={industry}
            onChange={(event) => onIndustryChange(event.target.value)}
          >
            {LEAD_INDUSTRIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
};
