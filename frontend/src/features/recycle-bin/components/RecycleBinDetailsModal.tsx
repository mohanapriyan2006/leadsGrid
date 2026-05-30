import { AnimatePresence, motion } from "framer-motion";

import type { BinLead, ManageLead } from "../../leads/types/manageLead";

type RecycleBinDetailsModalProps = {
  open: boolean;
  selectedLead: BinLead | null;
  detailedLead: ManageLead | null;
  onClose: () => void;
  onRestore: (leadId: string) => void;
  onDeleteForever: (leadId: string) => void;
};

export const RecycleBinDetailsModal = ({
  open,
  selectedLead,
  detailedLead,
  onClose,
  onRestore,
  onDeleteForever,
}: RecycleBinDetailsModalProps) => {
  return (
    <AnimatePresence>
      {open && selectedLead ? (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-surface/80 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass-card-lg w-full max-w-md p-5"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-content">{selectedLead.name}</h3>
                <p className="text-sm text-content-secondary">{selectedLead.company}</p>
              </div>
              <button type="button" onClick={onClose} className="glass-btn px-2 py-1 text-xs">
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-2 text-sm text-content-secondary md:grid-cols-2">
              <p><span className="text-content">Email:</span> {detailedLead?.email || selectedLead.email || "N/A"}</p>
              <p><span className="text-content">Phone:</span> {detailedLead?.phone || "N/A"}</p>
              <p><span className="text-content">Stage:</span> {detailedLead?.stage || "N/A"}</p>
              <p><span className="text-content">Score:</span> {detailedLead?.score ?? "N/A"}</p>
              <p><span className="text-content">Budget:</span> {detailedLead ? `$${detailedLead.budget_estimate.toLocaleString()}` : "N/A"}</p>
              <p><span className="text-content">Source:</span> {detailedLead?.source || "N/A"}</p>
              <p className="md:col-span-2"><span className="text-content">Address:</span> {detailedLead?.address || "N/A"}</p>
              <p><span className="text-content">Created:</span> {detailedLead?.created_at ? new Date(detailedLead.created_at).toLocaleString() : "N/A"}</p>
              <p><span className="text-content">Deleted:</span> {new Date(selectedLead.deleted_at).toLocaleString()}</p>
              <p className="md:col-span-2"><span className="text-content">ID:</span> {selectedLead.id}</p>
              {detailedLead?.notes ? (
                <p className="md:col-span-2 whitespace-pre-wrap"><span className="text-content">Notes:</span> {detailedLead.notes}</p>
              ) : null}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-glass-sm border border-success/30 bg-success-soft px-3 py-1.5 text-xs  transition hover:shadow-[0_0_16px_rgba(16,185,129,0.3)]"
                onClick={() => onRestore(selectedLead.id)}
              >
                Restore Lead
              </button>
              <button
                type="button"
                className="rounded-glass-sm border border-danger/30 bg-danger-soft px-3 py-1.5 text-xs  transition hover:shadow-[0_0_16px_rgba(239,68,68,0.3)]"
                onClick={() => onDeleteForever(selectedLead.id)}
              >
                Delete Forever
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
