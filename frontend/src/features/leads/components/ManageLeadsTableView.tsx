import { formatMoney } from "../constants/manageLeads";
import type { ManageLead } from "../types/manageLead";

type ManageLeadsTableViewProps = {
  leads: ManageLead[];
  selectedLeadIds: string[];
  onToggleSelectLead: (leadId: string) => void;
  onToggleSelectAllLeads: () => void;
  onOpenDetails: (leadId: string) => void;
  onOpenEdit: (leadId: string) => void;
  onDelete: (leadId: string) => void;
};

export const ManageLeadsTableView = ({
  leads,
  selectedLeadIds,
  onToggleSelectLead,
  onToggleSelectAllLeads,
  onOpenDetails,
  onOpenEdit,
  onDelete,
}: ManageLeadsTableViewProps) => {
  const allLeadsSelected = leads.length > 0 && leads.every((lead) => selectedLeadIds.includes(lead.id));

  return (
    <div className="glass-card overflow-hidden">
      <div className="hidden grid-cols-[44px_1.2fr_1.2fr_1.4fr_130px_80px_110px_220px] border-b border-accent/10 bg-gradient-to-r from-accent/5 via-transparent to-transparent px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-content-tertiary md:grid">
        <label className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={allLeadsSelected}
            onChange={onToggleSelectAllLeads}
            className="h-4 w-4 accent-accent"
            aria-label="Select all leads"
          />
        </label>
        <span>Name</span>
        <span>Company</span>
        <span>Contact</span>
        <span>Stage</span>
        <span>Score</span>
        <span>Budget</span>
        <span>Actions</span>
      </div>

      <div className="space-y-2 p-3 md:hidden">
        {leads.map((lead) => (
          <article key={`mobile-${lead.id}`} className="glass-card-sm space-y-2 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-start gap-2">
                <input
                  type="checkbox"
                  checked={selectedLeadIds.includes(lead.id)}
                  onChange={() => onToggleSelectLead(lead.id)}
                  className="mt-0.5 h-4 w-4 accent-accent"
                  aria-label={`Select ${lead.name}`}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-content">{lead.name}</p>
                  <p className="truncate text-xs text-content-secondary">{lead.company}</p>
                </div>
              </div>
              <span className="badge-accent">{lead.score}</span>
            </div>

            <p className="text-xs text-content-secondary">{lead.email || lead.phone || "N/A"}</p>

            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="rounded-glass-sm border border-accent/20 bg-accent-soft px-2 py-1 text-content-secondary">
                {lead.stage}
              </span>
              <span className="text-content-secondary">{formatMoney(lead.budget_estimate)}</span>
            </div>

            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                className="glass-btn px-2 py-1 text-[11px]"
                onClick={() => onOpenDetails(lead.id)}
              >
                Details
              </button>
              <button
                type="button"
                className="glass-btn px-2 py-1 text-[11px]"
                onClick={() => onOpenEdit(lead.id)}
              >
                Edit
              </button>
              <button
                type="button"
                className="rounded-glass-sm border border-danger/30 bg-danger-soft px-2 py-1 text-[11px] text-danger"
                onClick={() => onDelete(lead.id)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {leads.map((lead) => (
        <div
          key={lead.id}
          className="hidden grid-cols-[44px_1.2fr_1.2fr_1.4fr_130px_80px_110px_220px] items-center border-b border-accent/5 px-4 py-2 text-xs transition-colors hover:bg-accent/5 md:grid"
        >
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={selectedLeadIds.includes(lead.id)}
              onChange={() => onToggleSelectLead(lead.id)}
              className="h-4 w-4 accent-accent"
              aria-label={`Select ${lead.name}`}
            />
          </div>
          <span className="text-content">{lead.name}</span>
          <span className="text-content-secondary">{lead.company}</span>
          <span className="text-content-secondary">{lead.email || lead.phone || "N/A"}</span>
          <span className="text-content-secondary">{lead.stage}</span>
          <span className="text-accent">{lead.score}</span>
          <span className="text-content-secondary">{formatMoney(lead.budget_estimate)}</span>
          <div className="flex gap-1">
            <button
              type="button"
              className="glass-btn px-2 py-1 text-[11px]"
              onClick={() => onOpenDetails(lead.id)}
            >
              Details
            </button>
            <button
              type="button"
              className="glass-btn px-2 py-1 text-[11px]"
              onClick={() => onOpenEdit(lead.id)}
            >
              Edit
            </button>
            <button
              type="button"
              className="rounded-glass-sm border border-danger/30 bg-danger-soft px-2 py-1 text-[11px] text-danger"
              onClick={() => onDelete(lead.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
