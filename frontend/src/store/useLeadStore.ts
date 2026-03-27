import { create } from "zustand";

import type { Lead } from "../features/leads/types/lead";
import type { ManageLead, ManageLeadView } from "../features/leads/types/manageLead";

type LeadState = {
  leads: Lead[];
  manageLeads: ManageLead[];
  selectedManageLeadId: string | null;
  manageLeadView: ManageLeadView;
  setLeads: (leadList: Lead[]) => void;
  setManageLeads: (leadList: ManageLead[]) => void;
  setSelectedManageLeadId: (leadId: string | null) => void;
  setManageLeadView: (view: ManageLeadView) => void;
};

export const useLeadStore = create<LeadState>((set) => ({
  leads: [],
  manageLeads: [],
  selectedManageLeadId: null,
  manageLeadView: "kanban",
  setLeads: (leadList) => set({ leads: leadList }),
  setManageLeads: (leadList) => set({ manageLeads: leadList }),
  setSelectedManageLeadId: (leadId) => set({ selectedManageLeadId: leadId }),
  setManageLeadView: (view) => set({ manageLeadView: view }),
}));
