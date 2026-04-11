type SuggestionDropdownProps = {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  visible: boolean;
};

export const SuggestionDropdown = ({
  suggestions,
  onSelect,
  visible,
}: SuggestionDropdownProps) => {
  if (!visible || suggestions.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 z-30 mb-1 overflow-hidden rounded-xl border border-accent/[0.08] bg-surface-secondary/95 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl animate-fadeIn">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSelect(suggestion)}
          className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[13px] text-content-secondary transition-all hover:bg-accent/[0.06] hover:text-content"
        >
          <span className="text-[10px] text-accent/40">→</span>
          {suggestion}
        </button>
      ))}
    </div>
  );
};
