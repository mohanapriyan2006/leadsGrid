import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { leadService } from "../../features/leads/services/leadService";
import { useCentralizedLeads } from "../../features/leads/hooks/useCentralizedLeads";
import type { BinLead } from "../../features/leads/types/manageLead";
import { PageBackground } from "../../components/ui/PageBackground";
import bgBusinessPlan from "../../assets/bg-images/business-plan.svg";

export const RecyclicBinPage = () => {
  // Use centralized leads hook for real-time bin data
  const { binLeads, loading } = useCentralizedLeads();
  
  const [selectedLead, setSelectedLead] = useState<BinLead | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleDeleteForever = async (leadId: string) => {
    await leadService.deleteManageLeadForever(leadId);
  };

  const handleRestore = async (leadId: string) => {
    await leadService.restoreManageLead(leadId);
  };

  const openDetails = (lead: BinLead) => {
    setSelectedLead(lead);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="glass-card p-8 text-sm text-content-secondary">
        Loading bin...
      </div>
    );
  }

  return (
    <div className="page-with-bg space-y-4">
      <PageBackground image={bgBusinessPlan} tint="rgba(255, 55, 55, 0.3)" />
      <header className="glass-card p-5">
        <h2 className="bg-gradient-to-r from-content via-accent to-accent-secondary bg-clip-text text-3xl font-semibold text-transparent">Manage Leads Bin</h2>
        <p className="mt-1 text-sm text-content-secondary">Restore soft deleted leads or delete permanently.</p>
      </header>

      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-[1.5fr_1.5fr_1fr_220px] border-b border-accent/10 bg-gradient-to-r from-accent/5 via-transparent to-transparent px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-content-tertiary">
          <span>Name</span>
          <span>Company</span>
          <span>Deleted time</span>
          <span>Actions</span>
        </div>

        {binLeads.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-content-secondary">Bin is empty.</div>
        ) : (
          binLeads.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[1.5fr_1.5fr_1fr_220px] items-center border-b border-accent/5 px-4 py-3 text-sm transition-colors hover:bg-accent/5"
            >
              <span className="text-content">{row.name}</span>
              <span className="text-content-secondary">{row.company}</span>
              <span className="text-content-secondary">{new Date(row.deleted_at).toLocaleString()}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openDetails(row)}
                  className="glass-btn px-2 py-1 text-xs"
                >
                  Details
                </button>
                <button
                  onClick={() => void handleRestore(row.id)}
                  className="badge-success cursor-pointer transition hover:shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                >
                  Restore
                </button>
                <button
                  onClick={() => void handleDeleteForever(row.id)}
                  className="badge-danger cursor-pointer transition hover:shadow-[0_0_12px_rgba(239,68,68,0.3)]"
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
            className="fixed inset-0 z-[110] flex items-center justify-center bg-surface/80 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailsOpen(false)}
          >
            <motion.div
              className="glass-card-lg w-full max-w-md p-5"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-content">{selectedLead.name}</h3>
                  <p className="text-sm text-content-secondary">{selectedLead.company}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailsOpen(false)}
                  className="glass-btn px-2 py-1 text-xs"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 space-y-2 text-sm text-content-secondary">
                <p><span className="text-content">Email:</span> {selectedLead.email || "N/A"}</p>
                <p><span className="text-content">Deleted:</span> {new Date(selectedLead.deleted_at).toLocaleString()}</p>
                <p><span className="text-content">ID:</span> {selectedLead.id}</p>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-glass-sm border border-success/30 bg-success-soft px-3 py-1.5 text-xs text-success transition hover:shadow-[0_0_16px_rgba(16,185,129,0.3)]"
                  onClick={() => {
                    void handleRestore(selectedLead.id);
                    setDetailsOpen(false);
                  }}
                >
                  Restore Lead
                </button>
                <button
                  type="button"
                  className="rounded-glass-sm border border-danger/30 bg-danger-soft px-3 py-1.5 text-xs text-danger transition hover:shadow-[0_0_16px_rgba(239,68,68,0.3)]"
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
