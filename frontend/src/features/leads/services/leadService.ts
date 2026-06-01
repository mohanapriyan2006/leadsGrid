import {
  addDoc,
  collection,
  deleteDoc,
  type DocumentData,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  type QueryDocumentSnapshot,
  query,
  startAfter,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
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
import {
  buildLeadDedupeKey,
  createFirestoreLead,
  mapDiscoveryLeadToManageInput,
  toFirestoreLeadPatch,
  toManageLead,
} from "./leadModel";
import { mapDiscoveryLeadToManageInputWithAI, type DiscoveryLeadAIIntent } from "./leadModel";
import type { DiscoveryLeadDto, DiscoveryParams } from "../types/discovery";
import { adaptDiscoveryLead } from "./discoveryAdapter";
import { buildManageLeadAnalytics, buildManageLeadInsights } from "./leadMetrics";
import { usageTracker } from "../../billing/services/usageTracker";
import { showLimitModal } from "../../billing/hooks/useLimitModal";

const BATCH_WRITE_SIZE = 250;
const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 250;

export type ManageLeadsCursor = QueryDocumentSnapshot<DocumentData> | null;

export type ManageLeadsPageResult = {
  items: ManageLead[];
  nextCursor: ManageLeadsCursor;
  hasMore: boolean;
};

const splitIntoChunks = <T,>(items: T[], chunkSize: number): T[][] => {
  if (items.length === 0) {
    return [];
  }

  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
};

const getBoundedPageSize = (value?: number) => {
  if (!value || value <= 0) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(Math.max(1, value), MAX_PAGE_SIZE);
};

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

    const limitCheck = await usageTracker.checkLimit("leads_discovery_per_day", params.limit ?? 12);
    if (!limitCheck.allowed) {
      showLimitModal({ action: "leads_discovery_per_day", current: limitCheck.current, limit: limitCheck.limit });
      throw new Error("Plan limit reached: Lead Discovery");
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
    await usageTracker.incrementUsage("leads_discovery_per_day", mapped.length);

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
    page_size?: number;
  }): Promise<ManageLead[]> => {
    const page = await leadService.listManageLeadsPage(params);
    return page.items;
  },

  listManageLeadsPage: async (params: {
    query?: string;
    stage?: ManageLeadStage;
    source?: ManageLeadSource;
    min_score?: number;
    only_hot?: boolean;
    only_cold?: boolean;
    urgency?: ManageLeadUrgency;
    page_size?: number;
    cursor?: ManageLeadsCursor;
  }): Promise<ManageLeadsPageResult> => {
    try {
      const user = getCurrentUser();
      const pageSize = getBoundedPageSize(params.page_size);

      let q = query(
        getUserLeadsCollection(user.uid),
        where("isDeleted", "==", false),
        orderBy("updatedAt", "desc"),
        limit(pageSize),
      );

      if (params.stage) {
        q = query(q, where("pipelineStage", "==", params.stage));
      }

      if (params.cursor) {
        q = query(q, startAfter(params.cursor));
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

      const lastDoc = snapshot.docs.at(-1) ?? null;

      return {
        items: leads,
        nextCursor: lastDoc,
        hasMore: snapshot.docs.length >= pageSize,
      };
    } catch (error) {
      console.error("listManageLeads error:", error);
      throw error;
    }
  },

  listAllManageLeads: async (params?: {
    query?: string;
    stage?: ManageLeadStage;
    source?: ManageLeadSource;
    min_score?: number;
    only_hot?: boolean;
    only_cold?: boolean;
    urgency?: ManageLeadUrgency;
    page_size?: number;
  }): Promise<ManageLead[]> => {
    const combined: ManageLead[] = [];
    let cursor: ManageLeadsCursor = null;
    let hasMore = true;

    while (hasMore) {
      const page = await leadService.listManageLeadsPage({
        ...(params ?? {}),
        page_size: params?.page_size,
        cursor,
      });

      combined.push(...page.items);
      cursor = page.nextCursor;
      hasMore = page.hasMore && Boolean(cursor);
    }

    return combined;
  },

  getManageLeadInsights: async (leadsInput?: ManageLead[]): Promise<ManageLeadInsights> => {
    const leads = leadsInput ?? await leadService.listManageLeads({});
    return buildManageLeadInsights(leads);
  },

  getManageLeadAnalytics: async (leadsInput?: ManageLead[]): Promise<ManageLeadAnalytics> => {
    const leads = leadsInput ?? await leadService.listManageLeads({});
    return buildManageLeadAnalytics(leads);
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
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      throw new Error("Lead not found after update");
    }
    return toManageLead(snap.id, snap.data());
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
    
    const ref = getUserLeadDocument(user.uid, leadId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      throw new Error("Lead not found after action");
    }

    return toManageLead(snap.id, snap.data());
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
    const storageCheck = await usageTracker.checkLimit("storage_limit", 1);
    if (!storageCheck.allowed) {
      showLimitModal({ action: "storage_limit", current: storageCheck.current, limit: storageCheck.limit });
      throw new Error("Plan limit reached: Lead Storage");
    }

    const user = getCurrentUser();

    const newLead = createFirestoreLead(payload);

    const docRef = await addDoc(getUserLeadsCollection(user.uid), newLead);
    return toManageLead(docRef.id, newLead);
  },

  saveDiscoveryLeadAsManageLead: async (
    lead: Lead,
    options?: { aiIntent?: DiscoveryLeadAIIntent | null },
  ): Promise<ManageLead> => {
    const user = getCurrentUser();
    const candidate = options?.aiIntent
      ? mapDiscoveryLeadToManageInputWithAI(lead, options.aiIntent)
      : mapDiscoveryLeadToManageInput(lead);

    const dedupeKey = buildLeadDedupeKey(
      candidate.name,
      candidate.company,
      candidate.source ?? "website",
    );

    // Duplicate guard using indexed key to avoid scanning the entire collection.
    const existingSnap = await getDocs(
      query(
        getUserLeadsCollection(user.uid),
        where("isDeleted", "==", false),
        where("dedupeKey", "==", dedupeKey),
        limit(1),
      ),
    );

    if (!existingSnap.empty) {
      const existing = existingSnap.docs[0];
      return toManageLead(existing.id, existing.data());
    }

    const storageCheck = await usageTracker.checkLimit("storage_limit", 1);
    if (!storageCheck.allowed) {
      showLimitModal({ action: "storage_limit", current: storageCheck.current, limit: storageCheck.limit });
      throw new Error("Plan limit reached: Lead Storage");
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
    const chunks = splitIntoChunks(payload.lead_ids, BATCH_WRITE_SIZE);

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      for (const id of chunk) {
        const ref = getUserLeadDocument(user.uid, id);
        if (payload.action === "SOFT_DELETE") {
          batch.update(ref, { isDeleted: true, deletedAt: Timestamp.now(), updatedAt: Timestamp.now() });
          updated++;
        } else if (payload.action === "MOVE_STAGE" && payload.target_stage) {
          batch.update(ref, toFirestoreLeadPatch({ stage: payload.target_stage }));
          updated++;
        }
      }

      await batch.commit();
    }

    return { updated };
  },

  bulkRestoreManageLeads: async (leadIds: string[]): Promise<{ updated: number }> => {
    const user = getCurrentUser();
    let updated = 0;
    const chunks = splitIntoChunks(leadIds, BATCH_WRITE_SIZE);

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      for (const leadId of chunk) {
        const ref = getUserLeadDocument(user.uid, leadId);
        batch.update(ref, { isDeleted: false, deletedAt: null, updatedAt: Timestamp.now() });
        updated++;
      }
      await batch.commit();
    }

    return { updated };
  },

  bulkDeleteManageLeadsForever: async (leadIds: string[]): Promise<{ deleted: number }> => {
    const user = getCurrentUser();
    let deleted = 0;
    const chunks = splitIntoChunks(leadIds, BATCH_WRITE_SIZE);

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      for (const leadId of chunk) {
        const ref = getUserLeadDocument(user.uid, leadId);
        batch.delete(ref);
        deleted++;
      }
      await batch.commit();
    }

    return { deleted };
  },

  softDeleteManageLead: async (leadId: string): Promise<void> => {
    const user = getCurrentUser();
    const ref = getUserLeadDocument(user.uid, leadId);
    await updateDoc(ref, { isDeleted: true, deletedAt: Timestamp.now(), updatedAt: Timestamp.now() });
  },

  listManageLeadBinPage: async (params?: {
    page_size?: number;
    cursor?: ManageLeadsCursor;
  }): Promise<ManageLeadsPageResult> => {
    const user = getCurrentUser();
    const pageSize = getBoundedPageSize(params?.page_size);

    let q = query(
      getUserLeadsCollection(user.uid),
      where("isDeleted", "==", true),
      orderBy("updatedAt", "desc"),
      limit(pageSize),
    );

    if (params?.cursor) {
      q = query(q, startAfter(params.cursor));
    }

    const snapshot = await getDocs(q);
    const leads = snapshot.docs.map((row) => toManageLead(row.id, row.data()));

    return {
      items: leads,
      nextCursor: snapshot.docs.at(-1) ?? null,
      hasMore: snapshot.docs.length >= pageSize,
    };
  },

  listManageLeadBin: async (): Promise<BinLead[]> => {
    const page = await leadService.listManageLeadBinPage();
    return page.items.map((lead) => ({
      id: lead.id,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      deleted_at: lead.deleted_at ?? lead.updated_at,
    }));
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

          const storageCheck = await usageTracker.checkLimit("storage_limit", rows.length);
          if (!storageCheck.allowed && storageCheck.remaining <= 0) {
            showLimitModal({ action: "storage_limit", current: storageCheck.current, limit: storageCheck.limit });
            results.errors.push("Plan limit reached: Lead Storage. No leads can be imported.");
            resolve(results);
            return;
          }

          const maxRows = storageCheck.remaining;
          let batch = writeBatch(db);
          let pendingWrites = 0;

          const commitBatch = async () => {
            if (pendingWrites === 0) return;
            await batch.commit();
            batch = writeBatch(db);
            pendingWrites = 0;
          };

          for (let i = 0; i < rows.length && results.accepted < maxRows; i++) {
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
                dedupeKey: buildLeadDedupeKey(
                  businessName,
                  ((mappedData["company"] as string) || businessName),
                  "website",
                ),
              };

              const targetRef = doc(getUserLeadsCollection(user.uid));
              batch.set(targetRef, leadData);
              pendingWrites++;

              if (pendingWrites >= BATCH_WRITE_SIZE) {
                await commitBatch();
              }

              results.accepted++;
            } catch (error) {
              results.invalid++;
              results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : String(error)}`);
            }
          }

          await commitBatch();

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
