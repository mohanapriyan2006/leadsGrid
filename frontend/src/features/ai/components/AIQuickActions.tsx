import type { QuickAction } from "../constants/aiPage";

type AIQuickActionsProps = {
  actions: readonly QuickAction[];
  onAction: (action: QuickAction) => void;
};

export const AIQuickActions = ({ actions, onAction }: AIQuickActionsProps) => {
  return (
    <div className="glass-card grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-5">
      {actions.map((action) => (
        <button
          key={action}
          type="button"
          onClick={() => onAction(action)}
          className="glass-btn rounded-full px-3 py-1.5 text-xs text-content-secondary hover:text-content"
        >
          {action}
        </button>
      ))}
    </div>
  );
};
