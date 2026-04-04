import type { SmartSuggestion } from "../types/agent";

type SmartChipProps = {
  suggestion: SmartSuggestion;
  onClick: (prompt: string) => void;
};

export const SmartChip = ({ suggestion, onClick }: SmartChipProps) => {
  return (
    <button
      type="button"
      onClick={() => onClick(suggestion.prompt)}
      className="rounded-lg border border-accent/[0.12] bg-surface/30 px-3 py-1.5 text-[12px] font-medium text-content-secondary transition-all duration-200 hover:border-accent/30 hover:bg-surface-secondary/80 hover:text-content"
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
