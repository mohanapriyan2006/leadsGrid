import type { SmartSuggestion } from "../types/agent";

type SmartChipProps = {
  suggestion: SmartSuggestion;
  onClick: (prompt: string) => void;
};

const CATEGORY_STYLES: Record<SmartSuggestion["category"], string> = {
  discovery: "border-info/[0.1] text-info/80 hover:border-info/20 hover:bg-info/[0.06]",
  outreach: "border-accent/[0.1] text-accent/80 hover:border-accent/20 hover:bg-accent/[0.06]",
  pipeline: "border-warning/[0.1] text-warning/80 hover:border-warning/20 hover:bg-warning/[0.06]",
  analysis: "border-success/[0.1] text-success/80 hover:border-success/20 hover:bg-success/[0.06]",
};

export const SmartChip = ({ suggestion, onClick }: SmartChipProps) => {
  return (
    <button
      type="button"
      onClick={() => onClick(suggestion.prompt)}
      className={`rounded-lg border bg-surface/30 px-3 py-1.5 text-[12px] font-medium transition-all duration-200 ${CATEGORY_STYLES[suggestion.category]}`}
    >
      {suggestion.label}
    </button>
  );
};

type SmartChipGroupProps = {
  suggestions: SmartSuggestion[];
  onChipClick: (prompt: string) => void;
};

export const SmartChipGroup = ({ suggestions, onChipClick }: SmartChipGroupProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {suggestions.map((suggestion) => (
        <SmartChip key={suggestion.id} suggestion={suggestion} onClick={onChipClick} />
      ))}
    </div>
  );
};
