import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { leadService } from "../../features/leads/services/leadService";
import type { BinLead } from "../../features/leads/types/manageLead";

export const RecyclicBinPage = () => {
  const [binLeads, setBinLeads] = useState<BinLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<BinLead | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const loadBin = async () => {
    const rows = await leadService.listManageLeadBin();
    setBinLeads(rows);
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await loadBin();
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  const handleDeleteForever = async (leadId: string) => {
    await leadService.deleteManageLeadForever(leadId);
    await loadBin();
  };

  const handleRestore = async (leadId: string) => {
    await leadService.restoreManageLead(leadId);
    await loadBin();
  };

  const openDetails = (lead: BinLead) => {
    setSelectedLead(lead);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/30 p-8 text-sm text-text-dim">
        Loading bin...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-white/10 bg-black/35 p-4">
        <h2 className="text-3xl font-semibold text-white">Manage Leads Bin</h2>
        <p className="text-sm text-text-dim">Restore soft deleted leads or delete permanently.</p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
        <div className="grid grid-cols-[1.5fr_1.5fr_1fr_220px] border-b border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-text-dim">
          <span>Name</span>
          <span>Company</span>
          <span>Deleted time</span>
          <span>Actions</span>
        </div>

        {binLeads.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-text-dim">Bin is empty.</div>
        ) : (
          binLeads.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[1.5fr_1.5fr_1fr_220px] items-center border-b border-white/5 px-4 py-3 text-sm"
            >
              <span className="text-white">{row.name}</span>
              <span className="text-text-dim">{row.company}</span>
              <span className="text-text-dim">{new Date(row.deleted_at).toLocaleString()}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openDetails(row)}
                  className="rounded-lg border border-white/15 bg-black/35 px-2 py-1 text-xs text-text-dim hover:text-white"
                >
                  Details
                </button>
                <button
                  onClick={() => void handleRestore(row.id)}
                  className="rounded-lg border border-emerald-300/30 bg-emerald-500/15 px-2 py-1 text-xs text-emerald-100"
                >
                  Restore
                </button>
                <button
                  onClick={() => void handleDeleteForever(row.id)}
                  className="rounded-lg border border-rose-300/30 bg-rose-500/15 px-2 py-1 text-xs text-rose-100"
                >
                  Delete forever
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Details Modal */}
      <AnimatePresence>
        {detailsOpen && selectedLead && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/65 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailsOpen(false)}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/95 p-5 shadow-[0_20px_50px_rgba(2,6,23,0.85)]"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedLead.name}</h3>
                  <p className="text-sm text-text-dim">{selectedLead.company}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailsOpen(false)}
                  className="rounded-md border border-white/15 bg-black/30 px-2 py-1 text-xs text-text-dim"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 space-y-2 text-sm text-text-dim">
                <p><span className="text-white">Email:</span> {selectedLead.email || "N/A"}</p>
                <p><span className="text-white">Deleted:</span> {new Date(selectedLead.deleted_at).toLocaleString()}</p>
                <p><span className="text-white">ID:</span> {selectedLead.id}</p>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-emerald-300/30 bg-emerald-500/15 px-3 py-1.5 text-xs text-emerald-100"
                  onClick={() => {
                    void handleRestore(selectedLead.id);
                    setDetailsOpen(false);
                  }}
                >
                  Restore Lead
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-rose-300/35 bg-rose-500/20 px-3 py-1.5 text-xs text-rose-100"
                  onClick={() => {
                    void handleDeleteForever(selectedLead.id);
                    setDetailsOpen(false);
                  }}
                >
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecyclicBinPage;
