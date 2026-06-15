import { useState } from "react";
import { Check } from "lucide-react";
import type { AgentCardData, AgentActionButton } from "../../types/agent";

interface LeadPickerCardProps {
  card: AgentCardData;
  onAction: (action: string, payload?: Record<string, unknown>) => void;
}

type LeadOption = {
  id: string;
  name: string;
  company?: string;
};

export const LeadPickerCard = ({ card, onAction }: LeadPickerCardProps) => {
  const leads = (card.data?.leads as LeadOption[]) ?? [];
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAction = (btn: AgentActionButton) => {
    if (btn.action === "cancel") {
      onAction("cancel");
      return;
    }
    onAction(btn.action, { ...btn.payload, lead_ids: Array.from(selected) });
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-info/[0.15] bg-info/[0.04] p-4">
      <h4 className="mb-1 text-sm font-semibold text-content">{card.title}</h4>
      {card.description && (
        <p className="mb-3 text-xs text-content-secondary">{card.description}</p>
      )}
      <div className="flex max-h-48 flex-col gap-1.5 overflow-y-auto">
        {leads.map((lead) => {
          const isSelected = selected.has(lead.id);
          return (
            <button
              key={lead.id}
              type="button"
              onClick={() => toggle(lead.id)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition ${
                isSelected
                  ? "border-info/40 bg-info/[0.08]"
                  : "border-accent/[0.08] bg-surface/30 hover:bg-surface/50"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded border ${
                  isSelected
                    ? "border-info bg-info text-surface"
                    : "border-accent/30"
                }`}
              >
                {isSelected && <Check className="h-3 w-3" />}
              </span>
              <div className="flex flex-col">
                <span className="text-[13px] font-medium text-content">
                  {lead.name}
                </span>
                {lead.company && (
                  <span className="text-[11px] text-content-secondary">
                    {lead.company}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {card.actions.map((btn) => {
          const styleClasses =
            btn.style === "danger"
              ? "bg-danger/90 text-surface hover:bg-danger"
              : btn.style === "secondary"
                ? "border border-accent/[0.15] bg-surface/50 text-content hover:bg-surface/70"
                : "bg-info/90 text-surface hover:bg-info";
          const disabled =
            btn.action !== "cancel" && selected.size === 0;
          return (
            <button
              key={btn.label}
              type="button"
              disabled={disabled}
              onClick={() => handleAction(btn)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${styleClasses}`}
            >
              {btn.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
