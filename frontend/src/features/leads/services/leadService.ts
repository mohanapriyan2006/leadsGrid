import { collection, query, where, getDocs, doc, addDoc, updateDoc, deleteDoc, orderBy, Timestamp } from "firebase/firestore";
import { db, getFirebaseAuth } from "../../../lib/firebase";
import { apiClient } from "../../../lib/api";
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
import { createFirestoreLead, mapDiscoveryLeadToManageInput, toFirestoreLeadPatch, toManageLead } from "./leadModel";
import type { DiscoveryLeadDto, DiscoveryParams } from "../types/discovery";
import { adaptDiscoveryLead } from "./discoveryAdapter";

const getCurrentUser = () => {
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  if (!user) {
    throw new Error("Unauthenticated or Firebase not configured");
  }
  return user;
};

const getUserLeadsCollection = (uid: string) => collection(db, "users", uid, "leads");

const getUserLeadDocument = (uid: string, leadId: string) => doc(db, "users", uid, "leads", leadId);

export const leadService = {
  discoverLeads: async (params: DiscoveryParams): Promise<Lead[]> => {
    if (!params.query.trim()) {
      return [];
    }

    const auth = getFirebaseAuth();
    const user = auth?.currentUser;
    const token = user ? await user.getIdToken() : null;

    const response = await apiClient.get<DiscoveryLeadDto[]>("/agent/discover", {
      params: {
        query: params.query,
        limit: params.limit ?? 12,
      },
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(user?.uid ? { "x-user-id": user.uid } : {}),
      },
    });

    const mapped = (response.data || []).map(adaptDiscoveryLead);
    if (!params.selectedSources || params.selectedSources.length === 0) {
      return mapped;
    }

    return mapped.filter((lead) => params.selectedSources?.includes(lead.source));
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
    try {
      const user = getCurrentUser();

      let q = query(
        getUserLeadsCollection(user.uid),
        where("isDeleted", "==", false),
      );

      if (params.stage) {
        q = query(q, where("pipelineStage", "==", params.stage));
      }
      
      const snapshot = await getDocs(q);
      let leads = snapshot.docs.map((row) => toManageLead(row.id, row.data()));

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
    } catch (error) {
      console.error("listManageLeads error:", error);
      throw error;
    }
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
    const user = getCurrentUser();
    const q = query(
      collection(db, "users", user.uid, "leads", leadId, "activities"),
      orderBy("created_at", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ManageLeadActivity));
  },

  updateManageLead: async (
    leadId: string,
    payload: Partial<ManageLead>
  ): Promise<ManageLead> => {
    const user = getCurrentUser();
    const ref = getUserLeadDocument(user.uid, leadId);
    await updateDoc(ref, toFirestoreLeadPatch(payload));
    const snap = await getDocs(query(getUserLeadsCollection(user.uid), where("__name__", "==", leadId)));
    return toManageLead(snap.docs[0].id, snap.docs[0].data());
  },

  manageLeadAction: async (
    leadId: string,
    payload: { action_type: ManageLeadActionType; note?: string; target_stage?: ManageLeadStage },
  ): Promise<ManageLead> => {
    const user = getCurrentUser();

    await addDoc(collection(db, "users", user.uid, "leads", leadId, "activities"), {
      lead_id: leadId,
      activity_type: payload.action_type,
      message: payload.note || "Action performed",
      created_at: new Date().toISOString()
    });

    if (payload.target_stage) {
      return await leadService.updateManageLead(leadId, { stage: payload.target_stage });
    }
    
    const snap = await getDocs(query(getUserLeadsCollection(user.uid), where("__name__", "==", leadId)));
    return toManageLead(snap.docs[0].id, snap.docs[0].data());
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
    category?: string | null;
    rating?: number | null;
    review_count?: number | null;
    address?: string | null;
    website_url?: string | null;
    google_maps_url?: string | null;
    source?: ManageLeadSource;
    notes?: string | null;
    score?: number;
    urgency?: ManageLeadUrgency;
  }): Promise<ManageLead> => {
    const user = getCurrentUser();

    const newLead = createFirestoreLead(payload);

    const docRef = await addDoc(getUserLeadsCollection(user.uid), newLead);
    return toManageLead(docRef.id, newLead);
  },

  saveDiscoveryLeadAsManageLead: async (lead: Lead): Promise<ManageLead> => {
    const user = getCurrentUser();
    const candidate = mapDiscoveryLeadToManageInput(lead);

    // Lightweight duplicate guard by matching canonical name+company+source.
    const existingSnap = await getDocs(
      query(
        getUserLeadsCollection(user.uid),
        where("isDeleted", "==", false),
      ),
    );
    const existing = existingSnap.docs
      .map((row) => toManageLead(row.id, row.data()))
      .find(
        (row) =>
          row.name.toLowerCase() === candidate.name.toLowerCase()
          && row.company.toLowerCase() === candidate.company.toLowerCase()
          && row.source === candidate.source,
      );

    if (existing) {
      return existing;
    }

    const newLead = createFirestoreLead(candidate);
    const docRef = await addDoc(getUserLeadsCollection(user.uid), newLead);
    return toManageLead(docRef.id, newLead);
  },

  bulkManageLeadAction: async (payload: {
    lead_ids: string[];
    action: BulkLeadAction;
    target_stage?: ManageLeadStage;
  }): Promise<{ updated: number }> => {
    const user = getCurrentUser();
    let updated = 0;
    for (const id of payload.lead_ids) {
      const ref = getUserLeadDocument(user.uid, id);
      if (payload.action === "SOFT_DELETE") {
        await updateDoc(ref, { isDeleted: true, deletedAt: Timestamp.now(), updatedAt: Timestamp.now() });
        updated++;
      } else if (payload.action === "MOVE_STAGE" && payload.target_stage) {
        await updateDoc(ref, toFirestoreLeadPatch({ stage: payload.target_stage }));
        updated++;
      }
    }
    return { updated };
  },

  softDeleteManageLead: async (leadId: string): Promise<void> => {
    const user = getCurrentUser();
    const ref = getUserLeadDocument(user.uid, leadId);
    await updateDoc(ref, { isDeleted: true, deletedAt: Timestamp.now(), updatedAt: Timestamp.now() });
  },

  listManageLeadBin: async (): Promise<BinLead[]> => {
    const user = getCurrentUser();

    const q = query(
      getUserLeadsCollection(user.uid),
      where("isDeleted", "==", true),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((row) => {
      const lead = toManageLead(row.id, row.data());
      return {
        id: lead.id,
        name: lead.name,
        company: lead.company,
        email: lead.email,
        deleted_at: lead.deleted_at ?? lead.updated_at,
      };
    });
  },

  restoreManageLead: async (leadId: string): Promise<void> => {
    const user = getCurrentUser();
    const ref = getUserLeadDocument(user.uid, leadId);
    await updateDoc(ref, { isDeleted: false, deletedAt: null, updatedAt: Timestamp.now() });
  },

  deleteManageLeadForever: async (leadId: string): Promise<void> => {
    const user = getCurrentUser();
    const ref = getUserLeadDocument(user.uid, leadId);
    await deleteDoc(ref);
  },

  importManageLeadCSV: async (
    file: File,
    fieldMapping: Record<string, string>,
  ): Promise<CSVImportResult> => {
    const user = getCurrentUser();
    const results: CSVImportResult = {
      accepted: 0,
      skipped: 0,
      invalid: 0,
      warnings: [],
      errors: [],
    };

    // Dynamically import papaparse
    const Papa = (await import("papaparse" as any)).default;

    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (parseResult: any) => {
          const rows = parseResult.data as Record<string, string>[];

          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            // Map CSV fields to lead fields based on fieldMapping
            const mappedData: Record<string, string | number | boolean | null> = {};
            
            for (const [csvField, appField] of Object.entries(fieldMapping)) {
              if (appField && row[csvField] !== undefined) {
                let value: string | number | boolean | null = row[csvField].trim();
                
                // Convert types based on field
                if (appField === "rating" || appField === "review_count" || appField === "score") {
                  const num = parseFloat(value as string);
                  value = isNaN(num) ? null : num;
                } else if (appField === "budget_estimate") {
                  const num = parseFloat(value as string);
                  value = isNaN(num) ? 0 : num;
                } else if (value === "" || value === null) {
                  value = null;
                }
                
                mappedData[appField] = value;
              }
            }

            // Skip if no business name
            const businessName = (mappedData["name"] as string) || "";
            if (!businessName) {
              results.skipped++;
              results.warnings.push(`Row ${i + 1}: Skipped - no business name`);
              continue;
            }

            try {
              // Create lead data matching Firestore schema
              const leadData = {
                name: businessName,
                company: (mappedData["company"] as string) || businessName,
                email: (mappedData["email"] as string) || null,
                phone: (mappedData["phone"] as string) || null,
                status: "new",
                pipelineStage: "NEW",
                isDeleted: false,
                deletedAt: null,
                source: "csv" as const,
                notes: null,
                tags: [],
                budgetEstimate: (mappedData["budget_estimate"] as number) || 0,
                score: (mappedData["score"] as number) || 50,
                urgency: "medium" as const,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                lastActivityAt: Timestamp.now(),
                // CSV fields
                category: (mappedData["category"] as string) || null,
                rating: (mappedData["rating"] as number) || null,
                reviewCount: (mappedData["review_count"] as number) || null,
                address: (mappedData["address"] as string) || null,
                websiteUrl: (mappedData["website_url"] as string) || null,
                googleMapsUrl: (mappedData["google_maps_url"] as string) || null,
              };

              await addDoc(getUserLeadsCollection(user.uid), leadData);
              results.accepted++;
            } catch (error) {
              results.invalid++;
              results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : String(error)}`);
            }
          }

          resolve(results);
        },
        error: (error: { message: string }) => {
          results.errors.push(`CSV parse error: ${error.message}`);
          resolve(results);
        },
      });
    });
  },
};
