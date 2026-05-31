import type { ManageLeadStage } from "../types/manageLead";

type NewManageLeadDraft = {
  name: string;
  company: string;
  email: string;
  phone: string;
  stage: ManageLeadStage;
  budget_estimate: number;
};

type ManageLeadsAddRowFormProps = {
  draft: NewManageLeadDraft;
  onDraftChange: (nextDraft: NewManageLeadDraft) => void;
  onSave: () => void;
  onCancel: () => void;
};

export const ManageLeadsAddRowForm = ({
  draft,
  onDraftChange,
  onSave,
  onCancel,
}: ManageLeadsAddRowFormProps) => {
  return (
    <div className="glass-card grid gap-2 p-3 md:grid-cols-6">
      <input
        className="glass-input px-2 py-1 text-sm"
        placeholder="Name"
        value={draft.name}
        onChange={(event) => onDraftChange({ ...draft, name: event.target.value })}
      />
      <input
        className="glass-input px-2 py-1 text-sm"
        placeholder="Company"
        value={draft.company}
        onChange={(event) => onDraftChange({ ...draft, company: event.target.value })}
      />
      <input
        className="glass-input px-2 py-1 text-sm"
        placeholder="Email"
        value={draft.email}
        onChange={(event) => onDraftChange({ ...draft, email: event.target.value })}
      />
      <input
        className="glass-input px-2 py-1 text-sm"
        placeholder="Phone"
        value={draft.phone}
        onChange={(event) => onDraftChange({ ...draft, phone: event.target.value })}
      />
      <input
        type="number"
        className="glass-input px-2 py-1 text-sm"
        placeholder="Budget"
        value={draft.budget_estimate}
        onChange={(event) =>
          onDraftChange({
            ...draft,
            budget_estimate: Number(event.target.value) || 0,
          })
        }
      />
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-glass-sm border border-success/30 bg-success-soft px-3 py-1 text-xs text-success"
          onClick={onSave}
        >
          Save
        </button>
        <button type="button" className="glass-btn px-3 py-1 text-xs" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};