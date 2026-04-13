import { useEffect, useState } from "react";
import { doc, onSnapshot, type FirestoreError } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";

export const useFirebaseOnline = () => {
  const [isFirebaseOnline, setIsFirebaseOnline] = useState<boolean>(
    isFirebaseConfigured && navigator.onLine,
  );

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsFirebaseOnline(false);
      return;
    }

    const onlineFallback = () => {
      setIsFirebaseOnline(true);
    };

    const offlineFallback = () => {
      setIsFirebaseOnline(false);
    };

    window.addEventListener("online", onlineFallback);
    window.addEventListener("offline", offlineFallback);

    const ref = doc(db, "_system", "status");
    const unsubscribe = onSnapshot(
      ref,
      { includeMetadataChanges: true },
      (snapshot) => {
        if (!navigator.onLine) {
          setIsFirebaseOnline(false);
          return;
        }

        // If we can read from server or cache while browser is online,
        // treat Firebase as reachable for UI status purposes.
        setIsFirebaseOnline(!snapshot.metadata.fromCache || navigator.onLine);
      },
      (error: FirestoreError) => {
        // Permission issues do not necessarily mean Firebase is offline.
        if (error.code === "permission-denied" && navigator.onLine) {
          setIsFirebaseOnline(true);
          return;
        }
        setIsFirebaseOnline(false);
      },
    );

    return () => {
      unsubscribe();
      window.removeEventListener("online", onlineFallback);
      window.removeEventListener("offline", offlineFallback);
    };
  }, []);

  return isFirebaseOnline;
};
