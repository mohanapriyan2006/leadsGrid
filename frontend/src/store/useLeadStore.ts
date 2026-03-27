import { create } from "zustand";

import type { Lead } from "../features/leads/types/lead";
import type { BinLead, ManageLead, ManageLeadView } from "../features/leads/types/manageLead";

type LeadState = {
  leads: Lead[];
  manageLeads: ManageLead[];
  binLeads: BinLead[];
  selectedManageLeadId: string | null;
  selectedManageLeadIds: string[];
  manageLeadView: ManageLeadView;
  setLeads: (leadList: Lead[]) => void;
  setManageLeads: (leadList: ManageLead[]) => void;
  setBinLeads: (leadList: BinLead[]) => void;
  setSelectedManageLeadId: (leadId: string | null) => void;
  setSelectedManageLeadIds: (leadIds: string[]) => void;
  setManageLeadView: (view: ManageLeadView) => void;
};

export const useLeadStore = create<LeadState>((set) => ({
  leads: [],
  manageLeads: [],
  binLeads: [],
  selectedManageLeadId: null,
  selectedManageLeadIds: [],
  manageLeadView: "kanban",
  setLeads: (leadList) => set({ leads: leadList }),
  setManageLeads: (leadList) => set({ manageLeads: leadList }),
  setBinLeads: (leadList) => set({ binLeads: leadList }),
  setSelectedManageLeadId: (leadId) => set({ selectedManageLeadId: leadId }),
  setSelectedManageLeadIds: (leadIds) => set({ selectedManageLeadIds: leadIds }),
  setManageLeadView: (view) => set({ manageLeadView: view }),
}));
