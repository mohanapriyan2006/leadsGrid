import { AnimatePresence, motion } from "framer-motion";
import { Mail, Smartphone, Tag, Star, MapPin, Globe, Map, Calendar, Trash2, RotateCcw } from "lucide-react";

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
  if (!open || !selectedLead) return null;

  const formatMoney = (amount: number) => `$${amount.toLocaleString()}`;

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
          <motion.section
            className="glass-card-lg max-h-[80vh] overflow-y-auto w-full max-w-2xl p-4 sm:p-5"
            drag
            dragMomentum={false}
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.985 }}
            transition={{ duration: 0.16 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 cursor-grab active:cursor-grabbing">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-content">{selectedLead.name}</h3>
                <p className="text-sm text-content-secondary">{selectedLead.company}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px]  ">⋮⋮ Drag</span>
                <button type="button" onClick={onClose} className="glass-btn px-2 py-1 text-xs">
                  Close
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="badge-info">Score {detailedLead?.score ?? "N/A"}</span>
              <span className="badge-success">Stage {detailedLead?.stage ?? "N/A"}</span>
              <span className="badge-accent">Source {detailedLead?.source ?? "N/A"}</span>
              {detailedLead ? (
                <span className="badge-warning">Budget {formatMoney(detailedLead.budget_estimate)}</span>
              ) : null}
            </div>

            <div className="glass-card-sm mt-4 p-3 text-xs">
              <p className="text-content-tertiary uppercase tracking-[0.08em] mb-2">Contact Info</p>
              <div className="grid gap-1 text-content-secondary md:grid-cols-2">
                <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {detailedLead?.email || selectedLead.email || "N/A"}</p>
                <p className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5" /> {detailedLead?.phone || "N/A"}</p>
                {detailedLead?.category && <p className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> {detailedLead.category}</p>}
                {detailedLead?.rating && <p className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> {detailedLead.rating} ({detailedLead.review_count ?? 0} reviews)</p>}
                {detailedLead?.address && <p className="md:col-span-2 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {detailedLead.address}</p>}
                {detailedLead?.website_url && (
                  <p className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <a href={detailedLead.website_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Website</a>
                  </p>
                )}
                {detailedLead?.google_maps_url && (
                  <p className="flex items-center gap-1.5">
                    <Map className="w-3.5 h-3.5" />
                    <a href={detailedLead.google_maps_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Google Maps</a>
                  </p>
                )}
                <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Created: {detailedLead?.created_at ? new Date(detailedLead.created_at).toLocaleString() : "N/A"}</p>
                <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Deleted: {new Date(selectedLead.deleted_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
              <div className="glass-card-sm p-2 text-center">
                <p className="text-[10px]   uppercase tracking-[0.08em]">Score</p>
                <p className="text-sm font-semibold text-accent">{detailedLead?.score ?? "N/A"}/100</p>
              </div>
              <div className="glass-card-sm p-2 text-center">
                <p className="text-[10px]   uppercase tracking-[0.08em]">Budget</p>
                <p className="text-sm font-semibold text-success">{detailedLead ? formatMoney(detailedLead.budget_estimate) : "N/A"}</p>
              </div>
              <div className="glass-card-sm p-2 text-center">
                <p className="text-[10px]   uppercase tracking-[0.08em]">Stage</p>
                <p className="text-sm font-semibold text-info">{detailedLead?.stage ?? "N/A"}</p>
              </div>
              <div className="glass-card-sm p-2 text-center">
                <p className="text-[10px]   uppercase tracking-[0.08em]">Source</p>
                <p className="text-sm font-semibold text-warning">{detailedLead?.source ?? "N/A"}</p>
              </div>
            </div>

            {detailedLead?.notes ? (
              <div className="glass-card-sm mt-4 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-content-tertiary uppercase tracking-[0.08em] text-xs">Notes</p>
                </div>
                <p className="max-h-36 overflow-y-auto whitespace-pre-wrap text-xs text-content-secondary">
                  {detailedLead.notes}
                </p>
              </div>
            ) : null}

          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
