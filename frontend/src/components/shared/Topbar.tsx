import { useAuth } from "../../features/auth/AuthContext";
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Search } from "lucide-react";
import logo from "../../assets/logo.png";
import { span } from "framer-motion/client";

type TopbarProps = {
  onOpenMobileNav?: () => void;
};

export const Topbar = ({ onOpenMobileNav }: TopbarProps) => {
  const { user } = useAuth();
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const [isMenuHovered, setIsMenuHovered] = useState(false);

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
   
    <header className="sticky top-0 z-5 flex items-center gap-3 border-b border-accent/10 bg-surface/70 px-3 py-2 backdrop-blur-glass sm:gap-4 sm:px-4 sm:py-3">
      {/* Logo - LeadsGrid only */}
      <div className="flex items-center gap-2 shrink-0 md:hidden block">
        <div className="relative flex items-center justify-center w-fit h-fit rounded-xl bg-gradient-to-br from-accent to-accent-secondary shadow-glow">
          <img src={logo} alt="leadsGrid" className="h-6 w-6" />
        </div>
      </div>

      {/* Search Bar - Center */}
      <div className="flex-1 max-w-xl mx-auto">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-tertiary transition-colors group-focus-within:text-accent" />
          <input
            type="search"
            placeholder="Search signals or accounts..."
            className="w-full glass-input h-9 pl-9 pr-4 py-2 text-xs rounded-full border-accent/10 focus:border-accent/40 focus:shadow-glow transition-all duration-300 sm:h-10 sm:text-sm"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-[10px] text-content-tertiary bg-surface-tertiary/50 px-1.5 py-0.5 rounded">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Side - Menu Icon (Avatar inside menu) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Unique Animated Menu Icon */}
        <button
          type="button"
          className="relative md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-surface-secondary to-surface-tertiary border border-accent/20 shadow-glass transition-all duration-300 hover:shadow-glow hover:border-accent/40 hover:scale-105 active:scale-95 overflow-hidden group"
          onClick={onOpenMobileNav}
          onMouseEnter={() => setIsMenuHovered(true)}
          onMouseLeave={() => setIsMenuHovered(false)}
          aria-label="Open navigation menu"
        >
          {/* Animated hamburger/lines */}
          <div className="flex flex-col gap-1.5 items-center justify-center transition-transform duration-300">
            <span className={`block w-5 h-0.5 rounded-full bg-gradient-to-r from-accent to-accent-secondary transition-all duration-300 ${isMenuHovered ? 'w-4 translate-y-2 rotate-45' : ''}`} />
            <span className={`block w-3 h-0.5 rounded-full bg-accent transition-all duration-300 ${isMenuHovered ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 rounded-full bg-gradient-to-r from-accent-secondary to-accent transition-all duration-300 ${isMenuHovered ? 'w-4 -translate-y-2 -rotate-45' : ''}`} />
          </div>
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>

        {/* Status Badge - Desktop only */}
        <span className={`${isBackendOnline ? "badge-success" : "badge-danger"} hidden md:inline-flex shrink-0`}>
          {isBackendOnline ? "online" : "offline"}
        </span>

        {/* Desktop Avatar */}
        <div className="hidden md:flex items-center gap-2 group relative">
          <button className="h-9 w-9 rounded-xl overflow-hidden border border-accent/20 bg-surface-tertiary/60 text-xs text-content-secondary transition-all duration-200 hover:border-accent/40 hover:shadow-glow hover:scale-105" aria-label="Profile">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/30 to-accent-secondary/30 text-accent">
                <span className="text-sm font-medium">{(user?.displayName || "U")[0].toUpperCase()}</span>
              </div>
            )}
          </button>
          <div className="absolute top-12 right-0 hidden group-hover:block whitespace-nowrap glass-card-sm px-3 py-1.5 text-content text-xs z-50 animate-fadeIn">
            {user?.displayName || "User"}
          </div>
        </div>
      </div>
    </header>
  );
};
