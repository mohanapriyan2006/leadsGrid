import { doc, onSnapshot } from "firebase/firestore";

import { db, getFirebaseAuth } from "../../../lib/firebase";
import type { AgentRunState } from "./agentApiService";

type Listener = (run: AgentRunState) => void;

type FirestoreRunDoc = {
  run?: AgentRunState;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const parseRunState = (value: unknown): AgentRunState | null => {
  if (!isObject(value)) return null;

  const runCandidate = (value as FirestoreRunDoc).run;
  if (!runCandidate || typeof runCandidate !== "object") return null;

  return runCandidate as AgentRunState;
};

export const agentRunRealtimeService = {
  subscribeToRun: (runId: string, onRun: Listener): (() => void) => {
    const auth = getFirebaseAuth();
    const uid = auth?.currentUser?.uid;

    if (!uid || !runId) {
      return () => {};
    }

    const runRef = doc(db, "users", uid, "agent_runs", runId);

    return onSnapshot(runRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const run = parseRunState(snapshot.data());
      if (!run) return;
      onRun(run);
    });
  },
};
