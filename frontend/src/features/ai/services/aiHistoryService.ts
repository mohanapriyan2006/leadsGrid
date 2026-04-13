import { addDoc, collection, getDocs, limit, orderBy, query, Timestamp } from "firebase/firestore";

import { db, getFirebaseAuth } from "../../../lib/firebase";

export type AIHistoryType = "email" | "proposal" | "analysis";

export type SaveAIHistoryInput = {
  type: AIHistoryType;
  prompt: string;
  outputText: string;
  leadId?: string;
};

export const aiHistoryService = {
  save: async (payload: SaveAIHistoryInput) => {
    const auth = getFirebaseAuth();
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      return;
    }

    await addDoc(collection(db, "users", uid, "ai_history"), {
      type: payload.type,
      input: {
        prompt: payload.prompt,
        leadId: payload.leadId ?? null,
      },
      output: {
        text: payload.outputText,
      },
      createdAt: Timestamp.now(),
    });
  },

  list: async (take = 30) => {
    const auth = getFirebaseAuth();
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      return [];
    }

    const boundedTake = Math.max(1, Math.min(take, 100));

    const snapshot = await getDocs(
      query(
        collection(db, "users", uid, "ai_history"),
        orderBy("createdAt", "desc"),
        limit(boundedTake),
      ),
    );

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },
};
