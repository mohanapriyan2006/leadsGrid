import { useEffect, useState, useMemo } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../auth/AuthContext";
import type { ManageLead, BinLead } from "../types/manageLead";
import { toManageLead } from "../services/leadModel";

export const useCentralizedLeads = () => {
  const { user } = useAuth();
  const [allLeads, setAllLeads] = useState<ManageLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setAllLeads([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe to all leads for the current user (both active and deleted)
    const leadsRef = collection(db, "users", user.uid, "leads");
    
    const unsubscribe = onSnapshot(
      leadsRef,
      (snapshot) => {
        try {
          const leadsData = snapshot.docs.map((doc) => toManageLead(doc.id, doc.data()));
          
          // Sort by creation date (newest first)
          leadsData.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
          
          setAllLeads(leadsData);
          setLoading(false);
        } catch (err) {
          console.error("Error processing leads snapshot:", err);
          setError(err instanceof Error ? err : new Error("Failed to process leads"));
          setLoading(false);
        }
      },
      (err) => {
        console.error("Firestore subscription error:", err);
        setError(err instanceof Error ? err : new Error("Failed to subscribe to leads"));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Computed values
  const leads = useMemo(() => allLeads.filter(lead => !lead.is_deleted), [allLeads]);
  
  const binLeads = useMemo((): BinLead[] => 
    allLeads
      .filter(lead => lead.is_deleted)
      .map(lead => ({
        id: lead.id,
        name: lead.name,
        company: lead.company,
        email: lead.email,
        deleted_at: lead.deleted_at ?? lead.updated_at,
      })),
    [allLeads]
  );

  const negotiationLeads = useMemo(() => 
    leads.filter(lead => lead.stage === "NEGOTIATION"),
    [leads]
  );

  const getLeadById = (id: string): ManageLead | undefined => {
    return allLeads.find(lead => lead.id === id);
  };

  const getLeadsByStage = (stage: string): ManageLead[] => {
    return leads.filter(lead => lead.stage === stage);
  };

  const refresh = async () => {
    // Real-time sync handles refresh automatically
    // This is a no-op but provided for API compatibility
    return Promise.resolve();
  };

  return {
    leads,              // Active leads only
    binLeads,           // Deleted leads
    negotiationLeads,   // Leads in NEGOTIATION stage
    loading,
    error,
    refresh,
    getLeadById,
    getLeadsByStage,
  };
};
