import { useAuth } from "../../features/auth/AuthContext";
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";

export const Topbar = () => {
  const { user, signOut } = useAuth();
  const [isBackendOnline, setIsBackendOnline] = useState(true);

  useEffect(() => {
    // Listen to a test document to check Firestore connectivity
    // We use metadata changes to detect connection state
    const testDocRef = doc(db, "_system", "status");
    
    const unsubscribe = onSnapshot(
      testDocRef,
      { includeMetadataChanges: true },
      (snapshot) => {
        // If we receive any snapshot (even from cache initially), backend is reachable
        // If metadata has fromCache: false, we're definitely connected
        setIsBackendOnline(!snapshot.metadata.fromCache || true);
      },
      (error) => {
        // Error means we can't reach backend
        setIsBackendOnline(false);
      }
    );

    // Also check periodically by attempting to fetch
    const intervalId = setInterval(() => {
      // Try to get a fresh snapshot - if it succeeds, we're connected
      unsubscribe();
      const newUnsubscribe = onSnapshot(
        testDocRef,
        { includeMetadataChanges: true },
        (snapshot) => {
          setIsBackendOnline(!snapshot.metadata.fromCache || true);
        },
        () => {
          setIsBackendOnline(false);
        }
      );
      // Update the unsubscribe function reference
      (window as unknown as { _unsub: () => void })._unsub = newUnsubscribe;
    }, 30000); // Check every 30 seconds

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-accent/10 bg-surface/70 px-4 py-3 backdrop-blur-glass">
      <input
        type="search"
        placeholder="Search signals or accounts..."
        className="glass-input max-w-md"
      />
      <div className="ml-auto flex items-center gap-2 text-sm text-content-secondary">
        <div className="flex items-center gap-2 group relative">
          <button className="h-8 w-8 rounded-full overflow-hidden border border-accent/10 bg-surface-tertiary/60 text-xs text-content-secondary transition hover:border-accent/30 hover:text-content" aria-label="Profile">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              "◎"
            )}
          </button>
          <button 
            onClick={signOut}
            className="absolute top-10 right-0 hidden group-hover:block whitespace-nowrap glass-card-sm px-3 py-1 text-content text-xs hover:bg-accent-soft"
          >
            Sign Out
          </button>
        </div>
        <span className={isBackendOnline ? "badge-success" : "badge-error"}>
          {isBackendOnline ? "online" : "offline"}
        </span>
      </div>
    </header>
  );
};
