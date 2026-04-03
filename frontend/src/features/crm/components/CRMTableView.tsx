import { ScoreBadge } from "../../../components/ui/ScoreBadge";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { STATUS_COLUMNS } from "../constants/crm";
import type { Deal } from "../types/crm";
import type { DealStatus } from "../../common/types/ui";

type CRMTableViewProps = {
  deals: Deal[];
  onUpdateStatus: (dealId: string, status: DealStatus) => void;
  onOpenDetails: (dealId: string) => void;
  onOpenEdit: (dealId: string) => void;
  onDeleteRequest: (dealId: string) => void;
};

export const CRMTableView = ({
  deals,
  onUpdateStatus,
  onOpenDetails,
  onOpenEdit,
  onDeleteRequest,
}: CRMTableViewProps) => {
  return (
    <div className="glass-card overflow-hidden">
      <div className="grid grid-cols-[2fr_1.5fr_1fr_90px_1fr_220px] border-b border-accent/10 bg-gradient-to-r from-accent/5 via-transparent to-transparent px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-content-tertiary">
        <span>Client</span>
        <span>Company</span>
        <span>Status</span>
        <span>Score</span>
        <span>Last action</span>
        <span>Actions</span>
      </div>
      <div className="divide-y divide-accent/5">
        {deals.map((deal, index) => (
          <div
            key={deal.id}
            className="grid grid-cols-[2fr_1.5fr_1fr_90px_1fr_220px] items-center px-4 py-3 transition-colors hover:bg-accent/5"
            style={{
              animation: `fadeInUp 0.35s ease-out ${index * 0.03}s both`,
            }}
          >
            <span className="text-sm text-content">{deal.name}</span>
            <span className="text-sm text-content-secondary">{deal.company}</span>
            <div className="flex items-center gap-2">
              <select
                value={deal.status}
                onChange={(event) =>
                  onUpdateStatus(deal.id, event.target.value as DealStatus)
                }
                className="glass-input px-2 py-1 text-xs"
              >
                {STATUS_COLUMNS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <StatusBadge status={deal.status} />
            </div>
            <ScoreBadge score={deal.score} />
            <span className="text-sm text-content-secondary">{deal.lastAction}</span>
            <div className="flex gap-1">
              <button
                type="button"
                className="glass-btn px-2 py-1 text-[11px]"
                onClick={() => onOpenDetails(deal.id)}
              >
                Details
              </button>
              <button
                type="button"
                className="glass-btn px-2 py-1 text-[11px]"
                onClick={() => onOpenEdit(deal.id)}
              >
                Edit
              </button>
              <button
                type="button"
                className="rounded-glass-sm border border-danger/30 bg-danger-soft px-2 py-1 text-[11px] text-danger"
                onClick={() => onDeleteRequest(deal.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
