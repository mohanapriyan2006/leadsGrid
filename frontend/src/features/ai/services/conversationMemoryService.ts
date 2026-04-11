import { collection, doc, getDocs, limit, orderBy, query, setDoc, Timestamp } from "firebase/firestore";

import { db, getFirebaseAuth } from "../../../lib/firebase";
import type { ChatSession } from "../types/chat";

const COLLECTION_NAME = "conversations";

const toSession = (value: Record<string, unknown>): ChatSession | null => {
  const id = typeof value.id === "string" ? value.id : "";
  const title = typeof value.title === "string" ? value.title : "Untitled conversation";
  const preview = typeof value.preview === "string" ? value.preview : "";
  const createdAt = typeof value.createdAt === "string" ? value.createdAt : "";
  const messages = Array.isArray(value.messages) ? value.messages : [];

  if (!id) return null;

  return {
    id,
    title,
    preview,
    createdAt,
    messages: messages as ChatSession["messages"],
  };
};

export const conversationMemoryService = {
  saveSession: async (session: ChatSession): Promise<void> => {
    const auth = getFirebaseAuth();
    const uid = auth?.currentUser?.uid;
    if (!uid) return;

    const sessionRef = doc(db, "users", uid, COLLECTION_NAME, session.id);
    await setDoc(
      sessionRef,
      {
        id: session.id,
        title: session.title,
        preview: session.preview,
        createdAt: session.createdAt,
        messages: session.messages,
        updatedAt: Timestamp.now(),
      },
      { merge: true },
    );
  },

  listSessions: async (take = 20): Promise<ChatSession[]> => {
    const auth = getFirebaseAuth();
    const uid = auth?.currentUser?.uid;
    if (!uid) return [];

    const snapshot = await getDocs(
      query(
        collection(db, "users", uid, COLLECTION_NAME),
        orderBy("updatedAt", "desc"),
        limit(take),
      ),
    );

    return snapshot.docs
      .map((entry) => toSession(entry.data() as Record<string, unknown>))
      .filter((session): session is ChatSession => Boolean(session));
  },
};
