import { SourceIcon } from "../../../components/ui/SourceIcon";
import type { ManageLead } from "../../leads/types/manageLead";

import { toUiSource } from "../constants/messages";

type MessageLeadDetailsModalProps = {
  open: boolean;
  lead: ManageLead | null;
  onClose: () => void;
};

export const MessageLeadDetailsModal = ({
  open,
  lead,
  onClose,
}: MessageLeadDetailsModalProps) => {
  if (!open || !lead) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[110]  flex items-center justify-center bg-surface/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="glass-card-lg max-h-[80vh] w-full max-w-lg overflow-y-auto p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-content">{lead.name}</h3>
            <p className="text-sm text-content-secondary">{lead.company}</p>
          </div>
          <button type="button" onClick={onClose} className="glass-btn px-2 py-1 text-xs">
            Close
          </button>
        </div>

        <div className="space-y-2 text-sm text-content-secondary">
          <p>
            <span className="text-content">Email:</span> {lead.email ?? "N/A"}
          </p>
          <p>
            <span className="text-content">Phone:</span> {lead.phone ?? "N/A"}
          </p>
          <p className="flex items-center gap-2">
            <span className="text-content">Source:</span>
            <SourceIcon source={toUiSource(lead.source)} />
            <span>{lead.source}</span>
          </p>
          <p>
            <span className="text-content">Stage:</span> {lead.stage}
          </p>
          <p>
            <span className="text-content">Score:</span> {lead.score}/100
          </p>
          <p>
            <span className="text-content">Budget:</span> ${lead.budget_estimate.toLocaleString()}
          </p>
        </div>

        {lead.notes ? (
          <div className="glass-card-sm mt-4 p-3 max-h-40 overflow-y-auto">
            <p className="text-xs uppercase tracking-[0.08em] text-content-tertiary">Notes</p>
            <p className="mt-2 text-sm leading-6 text-content">{lead.notes}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
