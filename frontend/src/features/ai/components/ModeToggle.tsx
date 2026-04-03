import type { AIMode } from "../types/agent";

type ModeToggleProps = {
  mode: AIMode;
  onToggle: () => void;
};

export const ModeToggle = ({ mode, onToggle }: ModeToggleProps) => {
  return (
    <div className="relative flex items-center rounded-lg border border-accent/[0.08] bg-surface/60 p-[3px]">
      <div
        className={`absolute top-[3px] h-[calc(100%-6px)] w-[calc(50%-3px)] rounded-md transition-all duration-300 ease-out ${
          mode === "ask"
            ? "left-[3px] bg-accent/15 shadow-[0_0_12px_rgba(167,139,250,0.15)]"
            : "left-[50%] bg-info/15 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
        }`}
      />
      <button
        type="button"
        onClick={mode === "agent" ? onToggle : undefined}
        className={`relative z-10 rounded-md px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors duration-200 ${
          mode === "ask" ? "text-accent" : "text-content-tertiary hover:text-content-secondary"
        }`}
        aria-label="Switch to Ask Mode"
        aria-pressed={mode === "ask"}
      >
        Ask
      </button>
      <button
        type="button"
        onClick={mode === "ask" ? onToggle : undefined}
        className={`relative z-10 rounded-md px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors duration-200 ${
          mode === "agent" ? "text-info" : "text-content-tertiary hover:text-content-secondary"
        }`}
        aria-label="Switch to Agent Mode"
        aria-pressed={mode === "agent"}
      >
        Agent
      </button>
    </div>
  );
};
