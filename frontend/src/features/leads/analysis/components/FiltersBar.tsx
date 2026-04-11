import { BOARD_STAGES } from "../../constants/manageLeads";
import type { ManageLeadStage } from "../../types/manageLead";
import type { LeadSourceFilter, LeadsAnalyticsRange, StageFilter } from "../types/leadsAnalytics";

type FiltersBarProps = {
  range: LeadsAnalyticsRange;
  source: LeadSourceFilter;
  stage: StageFilter;
  onRangeChange: (value: LeadsAnalyticsRange) => void;
  onSourceChange: (value: LeadSourceFilter) => void;
  onStageChange: (value: StageFilter) => void;
};

const RANGE_OPTIONS: LeadsAnalyticsRange[] = ["7d", "30d", "90d"];
const SOURCE_OPTIONS: Array<{ value: LeadSourceFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "reddit", label: "Reddit" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "csv", label: "CSV" },
  { value: "manual", label: "Manual" },
];

const STAGE_OPTIONS: Array<{ value: StageFilter; label: string }> = [
  { value: "all", label: "All Stages" },
  ...BOARD_STAGES.map((stage) => ({ value: stage.id as ManageLeadStage, label: stage.label })),
];

export const FiltersBar = ({
  range,
  source,
  stage,
  onRangeChange,
  onSourceChange,
  onStageChange,
}: FiltersBarProps) => {
  return (
    <section className="glass-card-sm flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-[0.16em] text-content-tertiary">Time</span>
        <div className="inline-flex rounded-full border border-accent/15 bg-surface-secondary/70 p-1">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => onRangeChange(option)}
              className={`rounded-full px-3 py-1 text-xs uppercase transition-all ${
                range === option
                  ? "bg-accent text-content-inverse shadow-glow"
                  : "text-content-secondary hover:text-content"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-[0.16em] text-content-tertiary">Source</span>
        <select
          value={source}
          onChange={(event) => onSourceChange(event.target.value as LeadSourceFilter)}
          className="glass-input w-40 px-3 py-1.5"
        >
          {SOURCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value} className="bg-surface-tertiary">
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-[0.16em] text-content-tertiary">Stage</span>
        <select
          value={stage}
          onChange={(event) => onStageChange(event.target.value as StageFilter)}
          className="glass-input w-48 px-3 py-1.5"
        >
          {STAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value} className="bg-surface-tertiary">
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
};
