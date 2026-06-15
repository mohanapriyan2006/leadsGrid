import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Trash2, Check, X, UserPlus } from "lucide-react";

import type { AgentCardData } from "../../types/agent";

type CRMOperationCardProps = {
  card: AgentCardData;
  onAction: (action: string, payload?: Record<string, unknown>) => void;
};

export const CRMOperationCard = ({ card, onAction }: CRMOperationCardProps) => {
  const navigate = useNavigate();
  const mode = (card.data.mode as string) || "read";
  const operation = (card.data.operation as string) || "read";
  const lead = (card.data.lead as Record<string, unknown>) || {};
  const leadId = (card.data.lead_id as string) || String(lead.id || "");

  const [editFields, setEditFields] = useState<Record<string, string>>({
    name: String(lead.name || ""),
    company: String(lead.company || ""),
    email: String(lead.email || ""),
    phone: String(lead.phone || ""),
    stage: String(lead.stage || "new"),
  });

  if (mode === "create_preview" || mode === "create_form") {
    const formFields = (card.data.fields as Array<{ key: string; label: string; type: string; value?: string }>) || [];
    const fieldsToRender = formFields.length ? formFields : [
      { key: "name", label: "Contact Name", value: editFields.name },
      { key: "company", label: "Company", value: editFields.company },
      { key: "email", label: "Email", value: editFields.email },
      { key: "phone", label: "Phone", value: editFields.phone },
    ];

    return (
      <div className="mt-2 w-full overflow-hidden rounded-xl border border-accent/[0.1] bg-surface-secondary/50">
        <div className="border-b border-accent/[0.08] px-3 py-2">
          <span className="text-sm font-semibold text-content">{card.title}</span>
          <p className="text-[11px] text-content-secondary">{card.description}</p>
        </div>
        <div className="space-y-2 px-3 py-2">
          {fieldsToRender.map((field) => (
            <div key={field.key}>
              <label className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wider text-content-secondary">
                {field.label}
              </label>
              <input
                type="text"
                value={editFields[field.key] ?? field.value ?? ""}
                onChange={(e) => setEditFields((prev) => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full rounded-lg border border-accent/[0.1] bg-surface/50 px-2.5 py-1.5 text-sm text-content outline-none focus:border-accent/40"
              />
            </div>
          ))}
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
          <button
            type="button"
            onClick={() => onAction("confirm_create_lead", { fields: editFields })}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent/90 py-2 text-[12px] font-semibold text-surface transition hover:bg-accent"
          >
            <Check className="h-3.5 w-3.5" />
            Create
          </button>
        </div>
      </div>
    );
  }

  if (mode === "update_preview") {
    const diff = (card.data.diff as Record<string, unknown>) || {};
    return (
      <div className="mt-2 w-full overflow-hidden rounded-xl border border-accent/[0.1] bg-surface-secondary/50">
        <div className="border-b border-accent/[0.08] px-3 py-2">
          <span className="text-sm font-semibold text-content">{card.title}</span>
          <p className="text-[11px] text-content-secondary">{card.description}</p>
        </div>
        <div className="px-3 py-2">
          {Object.entries(diff).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2 py-1">
              <span className="text-[11px] font-medium text-content-secondary capitalize">{key}:</span>
              <span className="text-sm text-content">{String(value)}</span>
            </div>
          ))}
          {Object.keys(diff).length === 0 && (
            <p className="text-sm text-content-secondary">No changes detected.</p>
          )}
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
          <button
            type="button"
            onClick={() => onAction("confirm_update_lead", { lead_id: leadId, fields: diff })}
            disabled={Object.keys(diff).length === 0}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent/90 py-2 text-[12px] font-semibold text-surface transition hover:bg-accent disabled:opacity-40"
          >
            <Check className="h-3.5 w-3.5" />
            Confirm
          </button>
        </div>
      </div>
    );
  }

  // Default read mode
  return (
    <div className="mt-2 w-full overflow-hidden rounded-xl border border-accent/[0.1] bg-surface-secondary/50">
      <div className="border-b border-accent/[0.08] px-3 py-2">
        <span className="text-sm font-semibold text-content">{card.title || "Lead Details"}</span>
        {card.description && <p className="text-[11px] text-content-secondary">{card.description}</p>}
      </div>
      {leadId ? (
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 rounded-lg bg-surface-tertiary/30 px-2.5 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/[0.08]">
              <UserPlus className="h-4 w-4 text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-content">{String(lead.name || "Lead")}</p>
              <p className="text-[11px] text-content-secondary">{String(lead.company || "")}</p>
            </div>
          </div>
        </div>
      ) : null}
      <div className="flex gap-2 border-t border-accent/[0.08] px-3 py-2">
        <button
          type="button"
          onClick={() => navigate(`/leads/manage`)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-accent/[0.1] bg-surface/40 py-2 text-[12px] font-medium text-content-secondary transition hover:text-content"
        >
          <Eye className="h-3.5 w-3.5" />
          Go to Page
        </button>
        <button
          type="button"
          onClick={() => onAction("edit_lead", { lead_id: leadId })}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent/90 py-2 text-[12px] font-semibold text-surface transition hover:bg-accent"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onAction("delete_lead", { lead_id: leadId })}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-danger/20 bg-danger/[0.05] py-2 text-[12px] font-medium text-danger/70 transition hover:bg-danger/[0.1] hover:text-danger"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
};
