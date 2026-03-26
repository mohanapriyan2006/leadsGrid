import { create } from "zustand";

import type { Lead } from "../features/leads/types/lead";

type LeadState = {
  leads: Lead[];
  setLeads: (leadList: Lead[]) => void;
};

export const useLeadStore = create<LeadState>((set) => ({
  leads: [],
  setLeads: (leadList) => set({ leads: leadList }),
}));
