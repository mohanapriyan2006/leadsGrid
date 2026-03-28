import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, doc, deleteDoc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../auth/AuthContext";
import type { ManageLead, BinLead } from "../types/manageLead";

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
    const q = query(
      collection(db, "leads"),
      where("userId", "==", user.uid),
      where("is_deleted", "==", isBin)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map((doc) => ({
        ...(doc.data() as Omit<ManageLead, "id">),
        id: doc.id,
      })) as ManageLead[];
      
      // Sort in memory to avoid needing immediate composite indexes
      leadsData.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      
      setLeads(leadsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isBin]);

  return { leads, loading };
};
