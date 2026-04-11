import { create } from "zustand";

import type { Lead } from "../features/leads/types/lead";
import type { ManageLeadView } from "../features/leads/types/manageLead";

type LeadState = {
  // Discovery leads (from LeadsPage scraping)
  leads: Lead[];
  setLeads: (leadList: Lead[]) => void;
  
  // UI state for Manage Leads
  selectedManageLeadId: string | null;
  manageLeadView: ManageLeadView;
  setSelectedManageLeadId: (leadId: string | null) => void;
  setManageLeadView: (view: ManageLeadView) => void;
};

export const useLeadStore = create<LeadState>((set) => ({
  // Discovery leads (separate from managed leads)
  leads: [],
  setLeads: (leadList) => set({ leads: leadList }),
  
  // UI state
  selectedManageLeadId: null,
  manageLeadView: "kanban",
  setSelectedManageLeadId: (leadId) => set({ selectedManageLeadId: leadId }),
  setManageLeadView: (view) => set({ manageLeadView: view }),
}));
