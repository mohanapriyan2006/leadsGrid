import { ScoreBadge } from "../../../components/ui/ScoreBadge";
import { STATUS_COLUMNS } from "../constants/crm";
import type { NewDealDraft } from "../types/crm";

type AddDealFormProps = {
  draft: NewDealDraft;
  onChange: (field: keyof NewDealDraft, value: string | number) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export const AddDealForm = ({
  draft,
  onChange,
  onSubmit,
  onCancel,
}: AddDealFormProps) => {
  return (
    <div className="glass-card border-accent/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap gap-3">
          <input
            value={draft.name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="Client name"
            className="glass-input min-w-[140px] flex-1 px-3 py-2 text-xs"
          />
          <input
            value={draft.company}
            onChange={(event) => onChange("company", event.target.value)}
            placeholder="Company"
            className="glass-input min-w-[140px] flex-1 px-3 py-2 text-xs"
          />
          <select
            value={draft.status}
            onChange={(event) => onChange("status", event.target.value)}
            className="glass-input px-3 py-2 text-xs"
          >
            {STATUS_COLUMNS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={draft.score}
              onChange={(event) => onChange("score", event.target.value)}
              placeholder="Score"
              className="glass-input w-20 px-2 py-2 text-xs"
            />
            <ScoreBadge score={draft.score} />
          </div>
          <input
            value={draft.value}
            onChange={(event) => onChange("value", event.target.value)}
            placeholder="$10,000"
            className="glass-input w-28 px-3 py-2 text-xs text-success"
          />
          <input
            value={draft.lastAction}
            onChange={(event) => onChange("lastAction", event.target.value)}
            placeholder="Last touchpoint"
            className="glass-input min-w-[160px] flex-1 px-3 py-2 text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSubmit}
            className="accent-btn px-3 py-2 text-xs font-semibold"
          >
            Add to pipeline
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-content-tertiary hover:text-content-secondary transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
