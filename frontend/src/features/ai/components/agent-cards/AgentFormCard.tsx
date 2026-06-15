import { useState } from "react";
import type { AgentCardData, AgentActionButton } from "../../types/agent";

interface AgentFormCardProps {
  card: AgentCardData;
  onAction: (action: string, payload?: Record<string, unknown>) => void;
}

type FormField = {
  key: string;
  label: string;
  type: "text" | "select";
  placeholder?: string;
  options?: string[];
  value?: string;
};

export const AgentFormCard = ({ card, onAction }: AgentFormCardProps) => {
  const fields = (card.data?.fields as FormField[]) ?? [];
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of fields) {
      initial[field.key] = field.value ?? "";
    }
    return initial;
  });

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleAction = (btn: AgentActionButton) => {
    if (btn.action === "cancel") {
      onAction("cancel");
      return;
    }
    onAction(btn.action, { ...btn.payload, values });
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-info/[0.15] bg-info/[0.04] p-4">
      <h4 className="mb-1 text-sm font-semibold text-content">{card.title}</h4>
      {card.description && (
        <p className="mb-3 text-xs text-content-secondary">{card.description}</p>
      )}
      <div className="flex flex-col gap-2.5">
        {fields.map((field) => (
          <div key={field.key} className="flex flex-col gap-1">
            <label className="text-[11px] font-medium uppercase tracking-wide text-content-secondary">
              {field.label}
            </label>
            {field.type === "select" ? (
              <select
                value={values[field.key] ?? ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="rounded-lg border border-accent/[0.12] bg-surface/50 px-2.5 py-1.5 text-[13px] text-content outline-none focus:border-info/40"
              >
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={values[field.key] ?? ""}
                placeholder={field.placeholder}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="rounded-lg border border-accent/[0.12] bg-surface/50 px-2.5 py-1.5 text-[13px] text-content outline-none placeholder:text-content-tertiary/50 focus:border-info/40"
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {card.actions.map((btn) => {
          const styleClasses =
            btn.style === "danger"
              ? "bg-danger/90 text-surface hover:bg-danger"
              : btn.style === "secondary"
                ? "border border-accent/[0.15] bg-surface/50 text-content hover:bg-surface/70"
                : "bg-info/90 text-surface hover:bg-info";
          return (
            <button
              key={btn.label}
              type="button"
              onClick={() => handleAction(btn)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition ${styleClasses}`}
            >
              {btn.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
