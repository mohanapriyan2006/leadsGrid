import { useState } from "react";
import { Trash2, RotateCcw, AlertTriangle, X, Check } from "lucide-react";

import type { AgentCardData } from "../../types/agent";

type RecycleBinActionCardProps = {
  card: AgentCardData;
  onAction: (action: string, payload?: Record<string, unknown>) => void;
};

export const RecycleBinActionCard = ({ card, onAction }: RecycleBinActionCardProps) => {
  const leads = (card.data.leads as Array<Record<string, unknown>>) || [];
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"restore" | "permanent_delete" | null>(null);

  const startConfirm = (leadId: string, action: "restore" | "permanent_delete") => {
    setConfirmingId(leadId);
    setConfirmAction(action);
  };

  const cancelConfirm = () => {
    setConfirmingId(null);
    setConfirmAction(null);
  };

  return (
    <div className="mt-2 w-full overflow-hidden rounded-xl border border-warning/[0.15] bg-surface-secondary/50">
      <div className="flex items-center gap-2 border-b border-warning/[0.1] px-3 py-2">
        <Trash2 className="h-4 w-4 text-warning" />
        <span className="text-sm font-semibold text-content">{card.title}</span>
        <span className="ml-auto text-[10px] text-content-secondary">{leads.length} items</span>
      </div>

      {leads.length > 0 ? (
        <div className="max-h-64 overflow-y-auto px-1 py-1">
          {leads.map((lead) => {
            const leadId = String(lead.id || "");
            const isConfirming = confirmingId === leadId;

            return (
              <div key={leadId} className="rounded-lg px-2.5 py-2 transition hover:bg-surface-tertiary/40">
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-content">
                      {String(lead.name || lead.title || "Unnamed Lead")}
                    </p>
                    <p className="truncate text-[11px] text-content-secondary">
                      {String(lead.company || "")} · Deleted {String(lead.deletedAt || "")}
                    </p>
                  </div>

                  {!isConfirming ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startConfirm(leadId, "restore")}
                        className="flex h-7 items-center gap-1 rounded-lg border border-accent/[0.1] bg-surface/40 px-2 text-[11px] text-content-secondary transition hover:bg-accent/10 hover:text-accent"
                        title="Restore"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => startConfirm(leadId, "permanent_delete")}
                        className="flex h-7 items-center gap-1 rounded-lg border border-danger/[0.1] bg-danger/[0.05] px-2 text-[11px] text-danger/70 transition hover:bg-danger/[0.1] hover:text-danger"
                        title="Delete Forever"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-content-secondary">
                        {confirmAction === "restore" ? "Restore?" : "Delete forever?"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirmAction === "restore") {
                            onAction("confirm_restore_lead", { lead_id: leadId });
                          } else {
                            onAction("confirm_permanent_delete", { lead_id: leadId });
                          }
                          cancelConfirm();
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-success/15 text-success"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={cancelConfirm}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-danger/15 text-danger"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-3 py-6">
          <AlertTriangle className="mb-2 h-5 w-5 text-content-tertiary/40" />
          <p className="text-sm text-content-secondary">Recycle Bin is empty.</p>
        </div>
      )}

      {leads.length > 0 && (
        <div className="flex gap-2 border-t border-warning/[0.1] px-3 py-2">
          <button
            type="button"
            onClick={() => onAction("restore_all")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-accent/[0.1] bg-surface/40 py-2 text-[12px] font-medium text-content-secondary transition hover:bg-accent/10 hover:text-accent"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restore All
          </button>
          <button
            type="button"
            onClick={() => onAction("empty_bin")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-danger/[0.2] bg-danger/[0.05] py-2 text-[12px] font-medium text-danger/70 transition hover:bg-danger/[0.1] hover:text-danger"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Empty Bin
          </button>
        </div>
      )}
    </div>
  );
};
