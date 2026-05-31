import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { leadService } from "../../features/leads/services/leadService";
import { useCentralizedLeads } from "../../features/leads/hooks/useCentralizedLeads";
import type { BinLead } from "../../features/leads/types/manageLead";
import { RecycleBinDetailsModal } from "../../features/recycle-bin/components/RecycleBinDetailsModal";
import { RecycleBinTable } from "../../features/recycle-bin/components/RecycleBinTable";
import { PageBackground } from "../../components/ui/PageBackground";
import { ResponsivePageLayout } from "../../components/ui/ResponsivePageLayout";
import bgBusinessPlan from "../../assets/bg-images/business-plan.svg";

export const RecyclicBinPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Use centralized leads hook for real-time bin data
  const {
    binLeads,
    getLeadById,
    loading,
    refresh,
    hasMoreBinLeads,
    loadingMoreBinLeads,
    loadMoreBinLeads,
  } = useCentralizedLeads({ mode: "bin", binPageSize: 80 });

  const [selectedLead, setSelectedLead] = useState<BinLead | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmActionOpen, setConfirmActionOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"restore" | "delete" | null>(null);
  const [pendingLeadIds, setPendingLeadIds] = useState<string[]>([]);

  const selectedCount = selectedLeadIds.length;

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeadIds((current) =>
      current.includes(leadId)
        ? current.filter((id) => id !== leadId)
        : [...current, leadId],
    );
  };

  const toggleSelectAll = () => {
    setSelectedLeadIds((current) => {
      const allSelected =
        binLeads.length > 0 && binLeads.every((lead) => current.includes(lead.id));

      if (allSelected) {
        return [];
      }

      return binLeads.map((lead) => lead.id);
    });
  };

  const promptAction = (action: "restore" | "delete", leadIds: string[]) => {
    if (leadIds.length === 0) {
      return;
    }

    setPendingAction(action);
    setPendingLeadIds(leadIds);
    setConfirmActionOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!pendingAction || pendingLeadIds.length === 0) {
      return;
    }

    if (pendingAction === "restore") {
      await leadService.bulkRestoreManageLeads(pendingLeadIds);
    } else {
      await leadService.bulkDeleteManageLeadsForever(pendingLeadIds);
    }

    await refresh();

    setSelectedLeadIds((current) => current.filter((id) => !pendingLeadIds.includes(id)));

    if (selectedLead && pendingLeadIds.includes(selectedLead.id)) {
      setDetailsOpen(false);
      setSelectedLead(null);
    }

    setConfirmActionOpen(false);
    setPendingAction(null);
    setPendingLeadIds([]);
  };

  const handleCancelAction = () => {
    setConfirmActionOpen(false);
    setPendingAction(null);
    setPendingLeadIds([]);
  };

  const handleRestore = (leadId: string) => {
    promptAction("restore", [leadId]);
  };

  const handleBulkRestore = () => {
    if (selectedLeadIds.length === 0) {
      return;
    }

    promptAction("restore", selectedLeadIds);
  };

  const handleBulkDelete = () => {
    if (selectedLeadIds.length === 0) {
      return;
    }

    promptAction("delete", selectedLeadIds);
  };

  const openDetails = (lead: BinLead) => {
    setSelectedLead(lead);
    setDetailsOpen(true);
  };

  const detailedLead = useMemo(() => {
    if (!selectedLead) return null;
    return getLeadById(selectedLead.id) ?? null;
  }, [selectedLead, getLeadById]);

  const isRestoreAction = pendingAction === "restore";

  // Open lead from global search
  useEffect(() => {
    const leadId = location.state?.selectedLeadId;
    if (leadId && typeof leadId === "string") {
      const lead = binLeads.find((b) => b.id === leadId);
      if (lead) {
        setSelectedLead(lead);
        setDetailsOpen(true);
        navigate(".", { replace: true, state: {} });
      }
    }
  }, [binLeads, location.state, navigate]);

  if (loading) {
    return (
      <div className="glass-card p-8 text-sm text-content-secondary">
        Loading bin...
      </div>
    );
  }

  return (
    <>
      <PageBackground image={bgBusinessPlan} tint="rgba(255, 88, 88, 0.45)"  />
      <ResponsivePageLayout
        backgroundImage={bgBusinessPlan}
        tint="rgba(255, 102, 102, 0.47)"
        contentClassName="space-y-4"
      >
        <header className="glass-card p-5">
          <h2 className="bg-gradient-to-r from-content via-accent to-accent-secondary bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl">Manage Leads Bin</h2>
          <p className="mt-1 text-sm text-content-secondary">Restore soft deleted leads or delete permanently.</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <p className="text-xs  ">
              {selectedCount > 0 ? `${selectedCount} selected` : "Select leads to run bulk actions"}
            </p>
            <button
              type="button"
              onClick={() => {
                handleBulkRestore();
              }}
              disabled={selectedCount === 0}
              className="badge-success cursor-pointer transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Restore Selected
            </button>
            <button
              type="button"
              onClick={() => {
                handleBulkDelete();
              }}
              disabled={selectedCount === 0}
              className="badge-danger cursor-pointer transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete Selected
            </button>
          </div>
        </header>

        <RecycleBinTable
          leads={binLeads}
          selectedLeadIds={selectedLeadIds}
          onToggleLeadSelection={toggleLeadSelection}
          onToggleSelectAll={toggleSelectAll}
          onOpenDetails={openDetails}
          onRestore={(leadId) => {
            handleRestore(leadId);
          }}
          onDeleteForever={(leadId) => {
            promptAction("delete", [leadId]);
          }}
        />

        {hasMoreBinLeads ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                void loadMoreBinLeads();
              }}
              disabled={loadingMoreBinLeads}
              className="glass-btn px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingMoreBinLeads ? "Loading more bin leads..." : "Load More Bin Leads"}
            </button>
          </div>
        ) : null}

        <RecycleBinDetailsModal
          open={detailsOpen}
          selectedLead={selectedLead}
          detailedLead={detailedLead}
          onClose={() => setDetailsOpen(false)}
          onRestore={(leadId) => {
            handleRestore(leadId);
            setDetailsOpen(false);
          }}
          onDeleteForever={(leadId) => {
            promptAction("delete", [leadId]);
            setDetailsOpen(false);
          }}
        />

        {/* Confirmation Modal for Restore/Delete */}
        {confirmActionOpen && pendingAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 p-4 backdrop-blur-sm">
            <div
              className={`w-full max-w-md rounded-2xl bg-surface-secondary p-6 ${
                isRestoreAction
                  ? "border border-accent/30 shadow-[0_18px_60px_rgba(167,139,250,0.25)]"
                  : "border border-danger/30 shadow-[0_18px_60px_rgba(239,68,68,0.3)]"
              }`}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    isRestoreAction ? "bg-accent-soft" : "bg-danger/20"
                  }`}
                >
                  <svg
                    className={`h-5 w-5 ${isRestoreAction ? "text-accent" : "text-danger"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-content">
                  {pendingAction === "restore" ? "Restore Leads?" : "Delete Forever?"}
                </h3>
              </div>
              <p className="mb-6 text-sm text-content-secondary">
                {pendingAction === "restore"
                  ? `Are you sure you want to restore ${pendingLeadIds.length} selected lead${pendingLeadIds.length > 1 ? "s" : ""}?`
                  : `This action cannot be undone. ${pendingLeadIds.length} selected lead${pendingLeadIds.length > 1 ? "s will" : " will"} be permanently removed from your account.`}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancelAction}
                  className="flex-1 rounded-lg border border-accent/20 px-4 py-2 text-sm text-content-secondary transition hover:border-accent/40 hover:text-content"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleConfirmAction();
                  }}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-content-inverse transition ${
                    pendingAction === "restore" ? "bg-accent hover:bg-accent-secondary" : "bg-danger hover:bg-danger/80"
                  }`}
                >
                  {pendingAction === "restore" ? "Yes, Restore" : "Yes, Delete Forever"}
                </button>
              </div>
            </div>
          </div>
        )}
      </ResponsivePageLayout>
    </>
  );
};

export default RecyclicBinPage;
