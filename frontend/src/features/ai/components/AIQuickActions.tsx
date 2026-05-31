import { Search, Star, Play, Mail, BarChart3 } from "lucide-react";
import type { QuickAction } from "../constants/aiPage";

type AIQuickActionsProps = {
  actions: readonly QuickAction[];
  onAction: (action: QuickAction) => void;
};

const ACTION_ICONS: Record<string, React.ElementType> = {
  "Find leads": Search,
  "Best lead": Star,
  "Next action": Play,
  "Draft message": Mail,
  "Analyze pipeline": BarChart3,
};

export const AIQuickActions = ({ actions, onAction }: AIQuickActionsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-accent/[0.06] bg-surface-secondary/40 px-4 py-2.5 backdrop-blur-sm">
      <span className="text-[10px] font-semibold uppercase tracking-widest  text-content-tertiaryy">
        Quick
      </span>
      <div className="h-3 w-px bg-accent/10" />
      {actions.map((action) => {
        const Icon = ACTION_ICONS[action];
        return (
        <button
          key={action}
          type="button"
          onClick={() => onAction(action)}
          className="group flex items-center gap-1.5 rounded-lg border border-accent/[0.06] bg-surface/40 px-3 py-1.5 text-[12px] font-medium text-content-secondary transition-all duration-200 hover:border-accent/15 hover:bg-accent/[0.06] hover:text-content"
        >
          <span className="text-[11px] opacity-60 transition-opacity group-hover:opacity-100">
            {Icon ? <Icon className="w-3.5 h-3.5" /> : <span className="w-1 h-1 rounded-full bg-current inline-block" />}
          </span>
          {action}
        </button>
      )})}
    </div>
  );
};
