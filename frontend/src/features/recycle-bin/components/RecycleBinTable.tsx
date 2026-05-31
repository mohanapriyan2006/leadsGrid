import type { BinLead } from "../../leads/types/manageLead";

type RecycleBinTableProps = {
  leads: BinLead[];
  selectedLeadIds: string[];
  onToggleLeadSelection: (leadId: string) => void;
  onToggleSelectAll: () => void;
  onOpenDetails: (lead: BinLead) => void;
  onRestore: (leadId: string) => void;
  onDeleteForever: (leadId: string) => void;
};

export const RecycleBinTable = ({
  leads,
  selectedLeadIds,
  onToggleLeadSelection,
  onToggleSelectAll,
  onOpenDetails,
  onRestore,
  onDeleteForever,
}: RecycleBinTableProps) => {
  const allSelected = leads.length > 0 && leads.every((lead) => selectedLeadIds.includes(lead.id));

  return (
    <div className="glass-card overflow-hidden">
      <div className="grid grid-cols-[44px_1.5fr_1.5fr_1fr_220px] border-b border-accent/10 bg-gradient-to-r from-accent/5 via-transparent to-transparent px-4 py-2 text-[10px] uppercase tracking-[0.18em]  ">
        <span className="flex items-center">
          <input
            type="checkbox"
            aria-label="Select all leads"
            checked={allSelected}
            onChange={onToggleSelectAll}
            className="h-4 w-4 accent-accent"
          />
        </span>
        <span>Name</span>
        <span>Company</span>
        <span>Deleted time</span>
        <span>Actions</span>
      </div>

      {leads.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-content-secondary">Bin is empty.</div>
      ) : (
        leads.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-[44px_1.5fr_1.5fr_1fr_220px] items-center border-b border-accent/5 px-4 py-3 text-sm transition-colors hover:bg-accent/5"
          >
            <span className="flex items-center">
              <input
                type="checkbox"
                aria-label={`Select ${row.name}`}
                checked={selectedLeadIds.includes(row.id)}
                onChange={() => onToggleLeadSelection(row.id)}
                className="h-4 w-4 accent-accent"
              />
            </span>
            <span className="text-content">{row.name}</span>
            <span className="text-content-secondary">{row.company}</span>
            <span className="text-content-secondary">{new Date(row.deleted_at).toLocaleString()}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenDetails(row)}
                className="glass-btn px-2 py-1 text-xs"
              >
                Details
              </button>
              <button
                type="button"
                onClick={() => onRestore(row.id)}
                className="badge-success cursor-pointer transition hover:shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              >
                Restore
              </button>
              <button
                type="button"
                onClick={() => onDeleteForever(row.id)}
                className="badge-danger cursor-pointer transition hover:shadow-[0_0_12px_rgba(239,68,68,0.3)]"
              >
                Delete forever
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
