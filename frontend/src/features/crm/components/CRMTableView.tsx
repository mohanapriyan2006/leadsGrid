import { ScoreBadge } from "../../../components/ui/ScoreBadge";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import type { DealStatus } from "../../common/types/ui";
import { STATUS_COLUMNS } from "../constants/crm";
import type { Deal } from "../types/crm";

type CRMTableViewProps = {
  deals: Deal[];
  selectedDealIds: string[];
  statusLabels?: Partial<Record<DealStatus, string>>;
  onToggleSelectDeal: (dealId: string) => void;
  onToggleSelectAllDeals: () => void;
  onUpdateStatus: (dealId: string, status: DealStatus) => void;
  onOpenDetails: (dealId: string) => void;
  onOpenEdit: (dealId: string) => void;
  onDeleteRequest: (dealId: string) => void;
};

export const CRMTableView = ({
  deals,
  selectedDealIds,
  statusLabels,
  onToggleSelectDeal,
  onToggleSelectAllDeals,
  onUpdateStatus,
  onOpenDetails,
  onOpenEdit,
  onDeleteRequest,
}: CRMTableViewProps) => {
  const allDealsSelected = deals.length > 0 && deals.every((deal) => selectedDealIds.includes(deal.id));

  return (
    <div className="glass-card overflow-hidden">
      <div className="hidden grid-cols-[44px_2fr_1.5fr_1fr_90px_1fr_220px] border-b border-accent/10 bg-gradient-to-r from-accent/5 via-transparent to-transparent px-4 py-3 text-[10px] uppercase tracking-[0.18em]   md:grid">
        <label className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={allDealsSelected}
            onChange={onToggleSelectAllDeals}
            className="h-4 w-4 accent-accent"
            aria-label="Select all deals"
          />
        </label>
        <span>Client</span>
        <span>Company</span>
        <span>Status</span>
        <span>Score</span>
        <span>Last action</span>
        <span>Actions</span>
      </div>

      <div className="space-y-2 p-3 md:hidden">
        {deals.map((deal) => (
          <article key={`mobile-${deal.id}`} className="glass-card-sm space-y-2 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-start gap-2">
                <input
                  type="checkbox"
                  checked={selectedDealIds.includes(deal.id)}
                  onChange={() => onToggleSelectDeal(deal.id)}
                  className="mt-0.5 h-4 w-4 accent-accent"
                  aria-label={`Select ${deal.name}`}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-content">{deal.name}</p>
                  <p className="truncate text-xs text-content-secondary">{deal.company}</p>
                </div>
              </div>
              <ScoreBadge score={deal.score} />
            </div>

            <div className="flex items-center justify-between gap-2">
              <StatusBadge status={deal.status} />
              <select
                value={deal.status}
                onChange={(event) => onUpdateStatus(deal.id, event.target.value as DealStatus)}
                className="glass-input h-8 px-2 py-1 text-xs"
              >
                {STATUS_COLUMNS.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels?.[status] ?? status}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs  ">Last action: {deal.lastAction}</p>

            <div className="flex flex-wrap gap-1">
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
          </article>
        ))}
      </div>

      <div className="hidden divide-y divide-accent/5 md:block">
        {deals.map((deal, index) => (
          <div
            key={deal.id}
            className="grid grid-cols-[44px_2fr_1.5fr_1fr_90px_1fr_220px] items-center px-4 py-3 transition-colors hover:bg-accent/5"
            style={{
              animation: `fadeInUp 0.35s ease-out ${index * 0.03}s both`,
            }}
          >
            <div className="flex justify-center">
              <input
                type="checkbox"
                checked={selectedDealIds.includes(deal.id)}
                onChange={() => onToggleSelectDeal(deal.id)}
                className="h-4 w-4 accent-accent"
                aria-label={`Select ${deal.name}`}
              />
            </div>
            <span className="text-sm text-content">{deal.name}</span>
            <span className="text-sm text-content-secondary">{deal.company}</span>
            <div className="flex items-center gap-2">
              <select
                value={deal.status}
                onChange={(event) => onUpdateStatus(deal.id, event.target.value as DealStatus)}
                className="glass-input px-2 py-1 text-xs"
              >
                {STATUS_COLUMNS.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels?.[status] ?? status}
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
