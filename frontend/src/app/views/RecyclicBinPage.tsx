import { useMemo, useState } from "react";
import { leadService } from "../../features/leads/services/leadService";
import { useCentralizedLeads } from "../../features/leads/hooks/useCentralizedLeads";
import type { BinLead } from "../../features/leads/types/manageLead";
import { RecycleBinDetailsModal } from "../../features/recycle-bin/components/RecycleBinDetailsModal";
import { RecycleBinTable } from "../../features/recycle-bin/components/RecycleBinTable";
import { ResponsivePageLayout } from "../../components/ui/ResponsivePageLayout";
import bgBusinessPlan from "../../assets/bg-images/business-plan.svg";

export const RecyclicBinPage = () => {
  // Use centralized leads hook for real-time bin data
  const { binLeads, getLeadById, loading } = useCentralizedLeads();
  
  const [selectedLead, setSelectedLead] = useState<BinLead | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);

  const promptDeleteForever = (leadId: string) => {
    setLeadToDelete(leadId);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (leadToDelete) {
      await leadService.deleteManageLeadForever(leadToDelete);
    }
    setConfirmDeleteOpen(false);
    setLeadToDelete(null);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
    setLeadToDelete(null);
  };

  const handleRestore = async (leadId: string) => {
    await leadService.restoreManageLead(leadId);
  };

  const openDetails = (lead: BinLead) => {
    setSelectedLead(lead);
    setDetailsOpen(true);
  };

  const detailedLead = useMemo(() => {
    if (!selectedLead) return null;
    return getLeadById(selectedLead.id) ?? null;
  }, [selectedLead, getLeadById]);

  if (loading) {
    return (
      <div className="glass-card p-8 text-sm text-content-secondary">
        Loading bin...
      </div>
    );
  }

  return (
    <ResponsivePageLayout
      backgroundImage={bgBusinessPlan}
      tint="rgba(255, 102, 102, 0.47)"
      contentClassName="space-y-4"
    >
        <header className="glass-card p-5">
          <h2 className="bg-gradient-to-r from-content via-accent to-accent-secondary bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl">Manage Leads Bin</h2>
          <p className="mt-1 text-sm text-content-secondary">Restore soft deleted leads or delete permanently.</p>
        </header>

        <RecycleBinTable
          leads={binLeads}
          onOpenDetails={openDetails}
          onRestore={(leadId) => {
            void handleRestore(leadId);
          }}
          onDeleteForever={(leadId) => {
            promptDeleteForever(leadId);
          }}
        />

        <RecycleBinDetailsModal
          open={detailsOpen}
          selectedLead={selectedLead}
          detailedLead={detailedLead}
          onClose={() => setDetailsOpen(false)}
          onRestore={(leadId) => {
            void handleRestore(leadId);
            setDetailsOpen(false);
          }}
          onDeleteForever={(leadId) => {
            promptDeleteForever(leadId);
            setDetailsOpen(false);
          }}
        />

        {/* Double Confirmation Modal for Delete Forever */}
        {confirmDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-danger/30 bg-surface-secondary p-6 shadow-[0_18px_60px_rgba(239,68,68,0.3)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/20">
                  <svg className="h-5 w-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-content">Delete Forever?</h3>
              </div>
              <p className="mb-6 text-sm text-content-secondary">
                This action cannot be undone. The lead will be permanently removed from your account.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  className="flex-1 rounded-lg border border-accent/20 px-4 py-2 text-sm text-content-secondary transition hover:border-accent/40 hover:text-content"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:bg-danger/80"
                >
                  Yes, Delete Forever
                </button>
              </div>
            </div>
          </div>
        )}
    </ResponsivePageLayout>
  );
};

export default RecyclicBinPage;
