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
      <div
        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${
          mode === "ask"
            ? "bg-accent/[0.08] shadow-[0_0_24px_rgba(167,139,250,0.1)]"
            : "bg-info/[0.08] shadow-[0_0_24px_rgba(6,182,212,0.1)]"
        }`}
      >
        {mode === "ask" ? "✦" : "⚡"}
      </div>

      <h3 className="bg-gradient-to-r from-content to-content-secondary bg-clip-text text-lg font-bold tracking-tight text-transparent">
        {mode === "ask" ? "AI Sales Engine" : "Agent Mode"}
      </h3>

      <p className="mt-1.5 max-w-sm text-center text-[13px] leading-relaxed text-content-tertiary">
        {mode === "ask"
          ? "Ask questions, get insights, and draft messages powered by your CRM data."
          : "Describe a task. The agent builds a plan, asks for your permission, then executes."}
      </p>

      <div className="mt-6 w-full max-w-md">
        <p className="mb-2.5 text-center text-[10px] font-semibold uppercase tracking-widest text-content-tertiary/50">
          Try asking
        </p>
        <SmartChipGroup suggestions={suggestions} onChipClick={onSuggestionClick} />
      </div>

      <div
        className={`mt-5 rounded-lg px-4 py-2.5 text-center ${
          mode === "agent"
            ? "border border-info/[0.08] bg-info/[0.04]"
            : "border border-accent/[0.08] bg-accent/[0.04]"
        }`}
      >
        <p className={`text-[12px] ${mode === "agent" ? "text-info/70" : "text-accent/70"}`}>
          {mode === "agent"
            ? "💡 \"Find 20 high-quality leads and send outreach\""
            : "💡 \"Who is the best lead to contact today?\""}
        </p>
      </div>
    </div>
  );
};
