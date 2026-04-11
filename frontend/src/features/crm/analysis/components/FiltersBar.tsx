import type { AnalyticsDateRange, PipelineFilter } from "../types/analytics";

type FiltersBarProps = {
  dateRange: AnalyticsDateRange;
  pipelineFilter: PipelineFilter;
  onDateRangeChange: (value: AnalyticsDateRange) => void;
  onPipelineFilterChange: (value: PipelineFilter) => void;
};

const DATE_OPTIONS: AnalyticsDateRange[] = ["7d", "30d", "90d"];
const PIPELINE_OPTIONS: PipelineFilter[] = ["all", "active", "won", "lost"];

export const FiltersBar = ({
  dateRange,
  pipelineFilter,
  onDateRangeChange,
  onPipelineFilterChange,
}: FiltersBarProps) => {
  return (
    <div className="glass-card-sm flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-[0.18em] text-content-tertiary">Window</span>
        <div className="inline-flex rounded-full border border-accent/15 bg-surface-secondary/70 p-1">
          {DATE_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => onDateRangeChange(option)}
              className={`rounded-full px-3 py-1 text-xs uppercase transition-all ${
                dateRange === option
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
        <span className="text-xs uppercase tracking-[0.18em] text-content-tertiary">Pipeline</span>
        <div className="inline-flex rounded-full border border-accent/15 bg-surface-secondary/70 p-1">
          {PIPELINE_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => onPipelineFilterChange(option)}
              className={`rounded-full px-3 py-1 text-xs capitalize transition-all ${
                pipelineFilter === option
                  ? "bg-gradient-to-r from-accent to-accent-secondary text-content-inverse shadow-glow"
                  : "text-content-secondary hover:text-content"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
