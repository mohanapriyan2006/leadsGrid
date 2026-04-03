import type { QuickAction } from "../constants/aiPage";

type AIQuickActionsProps = {
  actions: readonly QuickAction[];
  onAction: (action: QuickAction) => void;
};

const ACTION_ICONS: Record<string, string> = {
  "Find leads": "🔍",
  "Best lead": "⭐",
  "Next action": "▶",
  "Draft message": "✉️",
  "Analyze pipeline": "📊",
};

export const AIQuickActions = ({ actions, onAction }: AIQuickActionsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-accent/[0.06] bg-surface-secondary/40 px-4 py-2.5 backdrop-blur-sm">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-content-tertiary">
        Quick
      </span>
      <div className="h-3 w-px bg-accent/10" />
      {actions.map((action) => (
        <button
          key={action}
          type="button"
          onClick={() => onAction(action)}
          className="group flex items-center gap-1.5 rounded-lg border border-accent/[0.06] bg-surface/40 px-3 py-1.5 text-[12px] font-medium text-content-secondary transition-all duration-200 hover:border-accent/15 hover:bg-accent/[0.06] hover:text-content"
        >
          <span className="text-[11px] opacity-60 transition-opacity group-hover:opacity-100">
            {ACTION_ICONS[action] ?? "•"}
          </span>
          {action}
        </button>
      ))}
    </div>
  );
};
