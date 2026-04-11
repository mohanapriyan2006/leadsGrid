import { addDoc, collection, orderBy, query, getDocs, Timestamp } from "firebase/firestore";

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

  list: async () => {
    const auth = getFirebaseAuth();
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      return [];
    }

    const snapshot = await getDocs(
      query(collection(db, "users", uid, "ai_history"), orderBy("createdAt", "desc")),
    );

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },
};
