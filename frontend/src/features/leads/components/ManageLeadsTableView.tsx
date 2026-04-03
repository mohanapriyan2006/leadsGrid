import { formatMoney } from "../constants/manageLeads";
import type { ManageLead } from "../types/manageLead";

type ManageLeadsTableViewProps = {
  leads: ManageLead[];
  onOpenDetails: (leadId: string) => void;
  onOpenEdit: (leadId: string) => void;
  onDelete: (leadId: string) => void;
};

export const ManageLeadsTableView = ({
  leads,
  onOpenDetails,
  onOpenEdit,
  onDelete,
}: ManageLeadsTableViewProps) => {
  return (
    <div className="glass-card overflow-hidden">
      <div className="grid grid-cols-[1.2fr_1.2fr_1.4fr_130px_80px_110px_220px] border-b border-accent/10 bg-gradient-to-r from-accent/5 via-transparent to-transparent px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-content-tertiary">
        <span>Name</span>
        <span>Company</span>
        <span>Contact</span>
        <span>Stage</span>
        <span>Score</span>
        <span>Budget</span>
        <span>Actions</span>
      </div>

      {leads.map((lead) => (
        <div
          key={lead.id}
          className="grid grid-cols-[1.2fr_1.2fr_1.4fr_130px_80px_110px_220px] items-center border-b border-accent/5 px-4 py-2 text-xs transition-colors hover:bg-accent/5"
        >
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
