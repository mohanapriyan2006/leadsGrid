import { collection, query, where, getDocs, doc, addDoc, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
import { db, auth } from "../../../lib/firebase";
import type { Lead } from "../types/lead";
import type {
  BinLead,
  BulkLeadAction,
  CSVImportResult,
  ManageLead,
  ManageLeadActionType,
  ManageLeadActivity,
  ManageLeadAnalytics,
  ManageLeadInsights,
  ManageLeadSource,
  ManageLeadStage,
  ManageLeadUrgency,
} from "../types/manageLead";

export const leadService = {
  // Discovery logic should call a Cloud Function or separate service for scraping
  discoverLeads: async (params: { query: string; source: Lead["source"]; limit: number }): Promise<Lead[]> => {
    // TODO: Connect to Cloud Function / AI scraping backend
    console.warn("discoverLeads: currently a mock in Firebase migration");
    return [];
  },

  listManageLeads: async (params: {
    query?: string;
    stage?: ManageLeadStage;
    source?: ManageLeadSource;
    min_score?: number;
    only_hot?: boolean;
    only_cold?: boolean;
    urgency?: ManageLeadUrgency;
  }): Promise<ManageLead[]> => {
    const user = auth.currentUser;
    if (!user) throw new Error("Unauthenticated");

    let q = query(
      collection(db, "leads"),
      where("userId", "==", user.uid),
      where("is_deleted", "==", false)
    );

    if (params.stage) {
      q = query(q, where("stage", "==", params.stage));
    }
    
    const snapshot = await getDocs(q);
    let leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ManageLead));

    if (params.only_hot) {
      leads = leads.filter(l => l.score >= 80);
    }
    if (params.query) {
      const lowerQ = params.query.toLowerCase();
      leads = leads.filter(l => 
        l.name.toLowerCase().includes(lowerQ) || 
        l.company.toLowerCase().includes(lowerQ)
      );
    }

    leads.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    return leads;
  },

  getManageLeadInsights: async (): Promise<ManageLeadInsights> => {
    const leads = await leadService.listManageLeads({});
    return {
      hot_leads_need_reply: leads.filter(l => l.score >= 80 && l.stage === "RESPONDED").length,
      leads_going_cold: leads.filter(l => l.is_going_cold).length,
      leads_likely_to_close: leads.filter(l => l.score >= 70 && l.stage === "NEGOTIATION").length,
    };
  },

  getManageLeadAnalytics: async (): Promise<ManageLeadAnalytics> => {
    const leads = await leadService.listManageLeads({});
    return {
      total_leads: leads.length,
      NEGOTIATION_count: leads.filter(l => l.stage === "NEGOTIATION").length,
      conversion_rate: 15.5,
      pipeline_value: leads.reduce((acc, l) => acc + (l.budget_estimate || 0), 0),
      stage_drop_offs: { "NEW": 10, "CONTACTED": 5 },
    };
  },

  getManageLeadTimeline: async (leadId: string): Promise<ManageLeadActivity[]> => {
    const q = query(
      collection(db, "lead_activities"),
      where("lead_id", "==", leadId),
      orderBy("created_at", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ManageLeadActivity));
  },

  updateManageLead: async (
    leadId: string,
    payload: Partial<ManageLead>
  ): Promise<ManageLead> => {
    const ref = doc(db, "leads", leadId);
    await updateDoc(ref, {
      ...payload,
      updated_at: new Date().toISOString()
    });
    const snap = await getDocs(query(collection(db, "leads"), where("__name__", "==", leadId)));
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as ManageLead;
  },

  manageLeadAction: async (
    leadId: string,
    payload: { action_type: ManageLeadActionType; note?: string; target_stage?: ManageLeadStage },
  ): Promise<ManageLead> => {
    await addDoc(collection(db, "lead_activities"), {
      lead_id: leadId,
      activity_type: payload.action_type,
      message: payload.note || "Action performed",
      created_at: new Date().toISOString()
    });

    if (payload.target_stage) {
      return await leadService.updateManageLead(leadId, { stage: payload.target_stage });
    }
    
    const snap = await getDocs(query(collection(db, "leads"), where("__name__", "==", leadId)));
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as ManageLead;
  },

  runManageLeadAutomation: async (): Promise<{
    reminders_due: number;
    follow_ups_generated: number;
    leads_marked_cold: number;
  }> => {
    return { reminders_due: 0, follow_ups_generated: 0, leads_marked_cold: 0 };
  },

  createManageLead: async (payload: {
    name: string;
    company: string;
    email?: string;
    phone?: string;
    stage?: ManageLeadStage;
    budget_estimate?: number;
  }): Promise<ManageLead> => {
    const user = auth.currentUser;
    if (!user) throw new Error("Unauthenticated");

    const newLead = {
      ...payload,
      userId: user.uid,
      source: "website",
      score: 50,
      is_going_cold: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, "leads"), newLead);
    return { id: docRef.id, ...newLead } as unknown as ManageLead;
  },

  bulkManageLeadAction: async (payload: {
    lead_ids: string[];
    action: BulkLeadAction;
    target_stage?: ManageLeadStage;
  }): Promise<{ updated: number }> => {
    let updated = 0;
    for (const id of payload.lead_ids) {
      const ref = doc(db, "leads", id);
      if (payload.action === "SOFT_DELETE") {
        await updateDoc(ref, { is_deleted: true, deleted_at: new Date().toISOString() });
        updated++;
      } else if (payload.action === "MOVE_STAGE" && payload.target_stage) {
        await updateDoc(ref, { stage: payload.target_stage, updated_at: new Date().toISOString() });
        updated++;
      }
    }
    return { updated };
  },

  softDeleteManageLead: async (leadId: string): Promise<void> => {
    const ref = doc(db, "leads", leadId);
    await updateDoc(ref, { is_deleted: true, deleted_at: new Date().toISOString() });
  },

  listManageLeadBin: async (): Promise<BinLead[]> => {
    const user = auth.currentUser;
    if (!user) throw new Error("Unauthenticated");

    const q = query(
      collection(db, "leads"),
      where("userId", "==", user.uid),
      where("is_deleted", "==", true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BinLead));
  },

  restoreManageLead: async (leadId: string): Promise<void> => {
    const ref = doc(db, "leads", leadId);
    await updateDoc(ref, { is_deleted: false, deleted_at: null, updated_at: new Date().toISOString() });
  },

  deleteManageLeadForever: async (leadId: string): Promise<void> => {
    const ref = doc(db, "leads", leadId);
    await deleteDoc(ref);
  },

  importManageLeadCSV: async (
    file: File,
    fieldMapping: Record<string, string>,
  ): Promise<CSVImportResult> => {
    console.warn("importManageLeadCSV needs papaparse integration in frontend to push to Firestore");
    return { accepted: 0, skipped: 0, invalid: 0, warnings: [], errors: [] };
  },
};
