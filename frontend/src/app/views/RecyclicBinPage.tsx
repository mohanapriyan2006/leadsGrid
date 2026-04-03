import { useMemo, useState } from "react";
import { leadService } from "../../features/leads/services/leadService";
import { useCentralizedLeads } from "../../features/leads/hooks/useCentralizedLeads";
import type { BinLead } from "../../features/leads/types/manageLead";
import { RecycleBinDetailsModal } from "../../features/recycle-bin/components/RecycleBinDetailsModal";
import { RecycleBinTable } from "../../features/recycle-bin/components/RecycleBinTable";
import { PageBackground } from "../../components/ui/PageBackground";
import bgBusinessPlan from "../../assets/bg-images/business-plan.svg";

export const RecyclicBinPage = () => {
  // Use centralized leads hook for real-time bin data
  const { binLeads, getLeadById, loading } = useCentralizedLeads();
  
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
    <div className="page-with-bg">
      <PageBackground image={bgBusinessPlan} tint="rgba(255, 55, 55, 0.3)" />
      <div className="h-[calc(100vh-100px)] overflow-auto space-y-4 p-6">
        <header className="glass-card p-5">
          <h2 className="bg-gradient-to-r from-content via-accent to-accent-secondary bg-clip-text text-3xl font-semibold text-transparent">Manage Leads Bin</h2>
          <p className="mt-1 text-sm text-content-secondary">Restore soft deleted leads or delete permanently.</p>
        </header>

        <RecycleBinTable
          leads={binLeads}
          onOpenDetails={openDetails}
          onRestore={(leadId) => {
            void handleRestore(leadId);
          }}
          onDeleteForever={(leadId) => {
            void handleDeleteForever(leadId);
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
            void handleDeleteForever(leadId);
            setDetailsOpen(false);
          }}
        />
      </div>
    </div>
  );
};

export default RecyclicBinPage;
