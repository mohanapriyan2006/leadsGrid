import { useAuth } from "../../features/auth/AuthContext";
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";

type TopbarProps = {
  onOpenMobileNav?: () => void;
};

export const Topbar = ({ onOpenMobileNav }: TopbarProps) => {
  const { user } = useAuth();
  const [isBackendOnline, setIsBackendOnline] = useState(true);

  useEffect(() => {
    const testDocRef = doc(db, "_system", "status");

    const unsubscribe = onSnapshot(
      testDocRef,
      () => {
        setIsBackendOnline(false);
      },
      () => {
        setIsBackendOnline(true);
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-accent/10 bg-surface/70 px-3 py-2 backdrop-blur-glass sm:gap-3 sm:px-4 sm:py-3">
      <button
        type="button"
        className="glass-btn px-2 py-1 text-[11px] md:hidden"
        onClick={onOpenMobileNav}
        aria-label="Open navigation menu"
      >
        Menu
      </button>

      <div className="min-w-0 flex-1 md:max-w-md">
        <input
          type="search"
          placeholder="Search signals or accounts..."
          className="glass-input h-9 min-w-0 px-3 py-2 text-xs sm:h-10 sm:px-4 sm:text-sm"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5 text-sm text-content-secondary sm:gap-2">
        <div className="flex items-center gap-2 group relative">
          <button className="h-8 w-8 rounded-full overflow-hidden border border-accent/10 bg-surface-tertiary/60 text-xs text-content-secondary transition hover:border-accent/30 hover:text-content" aria-label="Profile">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              "◎"
            )}
          </button>
          <div 
            className="absolute top-10 right-0 hidden group-hover:block whitespace-nowrap glass-card-sm px-3 py-1 text-content text-xs"
          >
            {user?.displayName || "User"}
          </div>
        </div>
        <span className={`${isBackendOnline ? "badge-success" : "badge-danger"} hidden sm:inline-flex`}>
          {isBackendOnline ? "online" : "offline"}
        </span>
      </div>
    </header>
  );
};
