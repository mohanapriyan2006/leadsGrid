import type { AIMode, SmartSuggestion } from "../types/agent";
import { SmartChipGroup } from "./SmartChip";

type EmptyStateProps = {
  mode: AIMode;
  suggestions: SmartSuggestion[];
  onSuggestionClick: (prompt: string) => void;
};

export const EmptyState = ({ mode, suggestions, onSuggestionClick }: EmptyStateProps) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 animate-fadeIn">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-xl ${mode === "ask" ? "bg-accent/[0.08]" : "bg-info/[0.08]"}`}>
        {mode === "ask" ? "✦" : "⚡"}
      </div>

      <h3 className="text-xl font-semibold tracking-tight text-content">
        {mode === "ask" ? "AI Sales Engine" : "Agent Mode"}
      </h3>

      <p className="mt-1 max-w-md text-center text-sm text-content-secondary">
        {mode === "ask"
          ? "Ask anything about leads, pipeline, or outreach."
          : "Describe the task. The agent will plan, ask approval, and execute."}
      </p>

      <div className="mt-5 w-full max-w-md">
        <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest  /70">
          Suggested Prompts
        </p>
        <SmartChipGroup suggestions={suggestions.slice(0, 3)} onChipClick={onSuggestionClick} />
      </div>
    </div>
  );
};
