import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../auth/AuthContext";
import type { ManageLead } from "../types/manageLead";
import { toManageLead } from "../services/leadModel";

export const useManageLeads = (isBin = false) => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<ManageLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLeads([]);
      setLoading(false);
      return;
    }

    // Query leads for the current user, filtering by deleted state
    const q = query(collection(db, "users", user.uid, "leads"), where("isDeleted", "==", isBin));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map((row) => toManageLead(row.id, row.data()));
      
      // Sort in memory to avoid needing immediate composite indexes
      leadsData.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      
      setLeads(leadsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isBin]);

  return { leads, loading };
};
