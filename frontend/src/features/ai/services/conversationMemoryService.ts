import { collection, deleteDoc, doc, getDocs, limit, orderBy, query, setDoc, Timestamp } from "firebase/firestore";

import { db, getFirebaseAuth } from "../../../lib/firebase";
import type { ChatSession } from "../types/chat";

const COLLECTION_NAME = "conversations";
const SESSION_SAVE_DEBOUNCE_MS = 1500;
const MAX_LIST_SESSIONS = 50;

const pendingSessions = new Map<string, ChatSession>();
const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();

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
  saveSession: async (session: ChatSession, options?: { immediate?: boolean }): Promise<void> => {
    const auth = getFirebaseAuth();
    const uid = auth?.currentUser?.uid;
    if (!uid) return;

    const persist = async (target: ChatSession) => {
      const sessionRef = doc(db, "users", uid, COLLECTION_NAME, target.id);
      await setDoc(
        sessionRef,
        {
          id: target.id,
          title: target.title,
          preview: target.preview,
          createdAt: target.createdAt,
          messages: target.messages,
          updatedAt: Timestamp.now(),
        },
        { merge: true },
      );
    };

    if (options?.immediate) {
      const existingTimer = pendingTimers.get(session.id);
      if (existingTimer) {
        clearTimeout(existingTimer);
        pendingTimers.delete(session.id);
      }
      pendingSessions.delete(session.id);
      await persist(session);
      return;
    }

    pendingSessions.set(session.id, session);

    const existingTimer = pendingTimers.get(session.id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      const latestSession = pendingSessions.get(session.id);
      if (!latestSession) {
        pendingTimers.delete(session.id);
        return;
      }

      pendingSessions.delete(session.id);
      pendingTimers.delete(session.id);
      void persist(latestSession);
    }, SESSION_SAVE_DEBOUNCE_MS);

    pendingTimers.set(session.id, timer);
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    const auth = getFirebaseAuth();
    const uid = auth?.currentUser?.uid;
    if (!uid) return;
    const sessionRef = doc(db, "users", uid, COLLECTION_NAME, sessionId);
    await deleteDoc(sessionRef);
  },

  listSessions: async (take = 20): Promise<ChatSession[]> => {
    const auth = getFirebaseAuth();
    const uid = auth?.currentUser?.uid;
    if (!uid) return [];

    const boundedTake = Math.max(1, Math.min(take, MAX_LIST_SESSIONS));

    const snapshot = await getDocs(
      query(
        collection(db, "users", uid, COLLECTION_NAME),
        orderBy("updatedAt", "desc"),
        limit(boundedTake),
      ),
    );

    return snapshot.docs
      .map((entry) => toSession(entry.data() as Record<string, unknown>))
      .filter((session): session is ChatSession => Boolean(session));
  },
};
