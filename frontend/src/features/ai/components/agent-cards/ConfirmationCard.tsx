import { AlertTriangle, Check, X } from "lucide-react";

import type { AgentCardData } from "../../types/agent";

type ConfirmationCardProps = {
  card: AgentCardData;
  onAction: (action: string, payload?: Record<string, unknown>) => void;
};

export const ConfirmationCard = ({ card, onAction }: ConfirmationCardProps) => {
  const operation = (card.data.operation as string) || "";
  const isDanger = ["delete", "permanent_delete", "send"].includes(operation);

  return (
    <div className="mt-2 w-full overflow-hidden rounded-xl border border-accent/[0.1] bg-surface-secondary/50">
      <div className="flex items-center gap-2 border-b border-accent/[0.08] px-3 py-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${isDanger ? "bg-danger/[0.08]" : "bg-accent/[0.08]"}`}>
          <AlertTriangle className={`h-4 w-4 ${isDanger ? "text-danger" : "text-accent"}`} />
        </div>
        <div>
          <span className="text-sm font-semibold text-content">{card.title}</span>
          {card.description && <p className="text-[11px] text-content-secondary">{card.description}</p>}
        </div>
      </div>

      <div className="flex gap-2 border-t border-accent/[0.08] px-3 py-2">
        <button
          type="button"
          onClick={() => onAction("cancel")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-accent/[0.1] bg-surface/40 py-2 text-[12px] font-medium text-content-secondary transition hover:text-content"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
        {card.actions
          .filter((a) => a.action !== "cancel")
          .map((action) => (
            <button
              key={action.action}
              type="button"
              onClick={() => onAction(action.action, action.payload)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-semibold transition ${
                action.style === "danger"
                  ? "border border-danger/20 bg-danger/[0.1] text-danger hover:bg-danger/[0.15]"
                  : action.style === "secondary"
                    ? "border border-accent/[0.1] bg-surface/40 text-content-secondary hover:text-content"
                    : "bg-accent/90 text-surface hover:bg-accent"
              }`}
            >
              <Check className="h-3.5 w-3.5" />
              {action.label}
            </button>
          ))}
      </div>
    </div>
  );
};
