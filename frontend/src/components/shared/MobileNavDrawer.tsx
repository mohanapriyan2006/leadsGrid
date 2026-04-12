import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { X, User, LayoutDashboard, Search, Inbox, Settings, Trash2, Brain, Users, Sparkles, Zap } from "lucide-react";
import { useAuth } from "../../features/auth/AuthContext";
import logo from "../../assets/logo1.png";

import { navigationItems } from "../../constants/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";

// Custom icon renderers with special effects for AI and Leads Discovery
const renderIcon = (label: string, isActive: boolean) => {
  const baseClasses = "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300";
  
  switch (label) {
    case "AI":
      return (
        <div className={`${baseClasses} ${
          isActive 
            ? "bg-gradient-to-br from-purple-600 to-violet-800 shadow-[0_0_20px_rgba(139,92,246,0.6)]" 
            : "bg-gradient-to-br from-purple-500/20 to-violet-600/20"
        }`}>
          <Brain className={`w-4 h-4 ${isActive ? "text-white" : "text-purple-400"}`} />
          {isActive && (
            <>
              <span className="absolute inset-0 rounded-lg animate-ping bg-purple-500/30" />
              <span className="absolute -inset-1 rounded-xl blur-sm bg-gradient-to-r from-purple-600 to-violet-600 animate-pulse" />
            </>
          )}
        </div>
      );
    case "Leads Discovery":
      return (
        <div className={`${baseClasses} ${
          isActive 
            ? "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.5)]" 
            : "bg-gradient-to-br from-cyan-500/20 to-blue-600/20"
        }`}>
          <Search className={`w-4 h-4 ${isActive ? "text-white" : "text-cyan-400"}`} />
          {isActive && (
            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 animate-pulse" />
          )}
        </div>
      );
    case "Dashboard":
      return (
        <div className={`${baseClasses} ${isActive ? "bg-accent/20 text-accent" : "bg-surface-tertiary/50 text-content-tertiary"}`}>
          <LayoutDashboard className="w-4 h-4" />
        </div>
      );
    case "Manage Leads":
      return (
        <div className={`${baseClasses} ${isActive ? "bg-accent/20 text-accent" : "bg-surface-tertiary/50 text-content-tertiary"}`}>
          <Users className="w-4 h-4" />
        </div>
      );
    case "Messages":
      return (
        <div className={`${baseClasses} ${isActive ? "bg-accent/20 text-accent" : "bg-surface-tertiary/50 text-content-tertiary"}`}>
          <Inbox className="w-4 h-4" />
        </div>
      );
    case "CRM":
      return (
        <div className={`${baseClasses} ${isActive ? "bg-accent/20 text-accent" : "bg-surface-tertiary/50 text-content-tertiary"}`}>
          <Zap className="w-4 h-4" />
        </div>
      );
    case "Settings":
      return (
        <div className={`${baseClasses} ${isActive ? "bg-accent/20 text-accent" : "bg-surface-tertiary/50 text-content-tertiary"}`}>
          <Settings className="w-4 h-4" />
        </div>
      );
    case "Recycle Bin":
      return (
        <div className={`${baseClasses} ${isActive ? "bg-accent/20 text-accent" : "bg-surface-tertiary/50 text-content-tertiary"}`}>
          <Trash2 className="w-4 h-4" />
        </div>
      );
    default:
      return (
        <div className={`${baseClasses} ${isActive ? "bg-accent/20 text-accent" : "bg-surface-tertiary/50 text-content-tertiary"}`}>
          <LayoutDashboard className="w-4 h-4" />
        </div>
      );
  }
};

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export const MobileNavDrawer = ({ open, onClose }: MobileNavDrawerProps) => {
  const { user } = useAuth();
  const [isClosing, setIsClosing] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const navigate = useNavigate();
  const homePath = user ? "/dashboard" : "/";

  useEffect(() => {
    const testDocRef = doc(db, "_system", "status");

    const unsubscribe = onSnapshot(
      testDocRef,
      () => {
        setIsBackendOnline(true);
      },
      () => {
        setIsBackendOnline(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setIsClosing(false);
      return;
    }

    // Stagger animation for nav items
    const timer = setTimeout(() => {
      setActiveIndex(-1);
    }, 100);

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
      clearTimeout(timer);
    };
  }, [open]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden " role="dialog" aria-modal="true" aria-label="Mobile navigation">
      {/* Backdrop with enhanced blur */}
      <button
        type="button"
        aria-label="Close menu"
        className={`absolute inset-0 bg-surface/80 backdrop-blur-xl transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />

      {/* Drawer Panel */}
      <aside className={`relative z-10 h-screen overflow-y-auto w-[min(85vw,340px)] border-r border-accent/20 bg-gradient-to-b from-surface via-surface-secondary to-surface-tertiary/50 p-0 backdrop-blur-glass shadow-2xl transition-transform duration-300 ease-out ${isClosing ? '-translate-x-full' : 'translate-x-0'}`}>

        {/* Header with Logo & User */}
        <div className="relative overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent-secondary/10 animate-pulse" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-pulse" />

          <div className="relative p-5 border-b border-accent/10">
            {/* Close Button */}
            <button
              type="button"
              className="absolute top-4 right-4 p-2 rounded-xl bg-surface-tertiary/50 border border-accent/10 text-content-tertiary hover:text-content hover:border-accent/30 hover:scale-110 transition-all duration-200"
              onClick={handleClose}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Logo & Brand */}
            <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => navigate(homePath)}>
              <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-700 to-purple-900 shadow-glow animate-float">
                <img src={logo} alt="leadsGrid" className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xl uppercase tracking-[0.10em] text-content-tertiary">LeadsGrid</span>
                <p className="text-[10px] text-content-tertiary uppercase tracking-widest">Lead Intelligence</p>
              </div>
            </div>

            {/* User Avatar Section */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-tertiary/30 border border-accent/10">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-accent/20 shadow-lg">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/40 to-accent-secondary/40 text-white">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${isBackendOnline ? 'bg-green-500' : 'bg-red-500'} border-2 border-surface`} />
              </div>
              <div className="flex-1 min-w-0">
                {isBackendOnline ? (
                  <p className="font-medium text-sm text-content truncate">{user?.displayName || "Welcome"}</p>
                ) : (
                  <p className="font-medium text-sm truncate text-red-500">Backend Offline</p>
                )}
                <p className="text-xs text-content-tertiary truncate">{user?.email || "Sign in to continue"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation with staggered animations */}
        <nav className="p-4 space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-content-tertiary mb-3 px-2">Navigation</p>
          {navigationItems.map((item, index) => {
            const isActive = window.location.pathname === item.path;
            const isAI = item.label === "AI";
            const isLeadsDiscovery = item.label === "Leads Discovery";
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleClose}
                className={`group flex items-center gap-3 rounded-xl border px-3 py-3 text-sm transition-all duration-300 hover:scale-[1.02] relative overflow-hidden ${
                  isActive
                    ? isAI
                      ? "border-purple-500/50 bg-gradient-to-r from-purple-500/20 to-violet-600/10 text-white shadow-[0_0_25px_rgba(139,92,246,0.3)] translate-x-1"
                      : isLeadsDiscovery
                        ? "border-cyan-500/50 bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-white shadow-[0_0_20px_rgba(6,182,212,0.25)] translate-x-1"
                        : "border-accent/40 bg-gradient-to-r from-accent-soft to-accent-soft/50 text-content shadow-glow translate-x-1"
                    : "border-transparent text-content-secondary hover:border-accent/20 hover:bg-accent-soft/30 hover:text-content"
                } ${activeIndex !== null ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                style={{
                  transitionDelay: `${index * 50}ms`,
                }}
              >
                {/* Special background effects */}
                {isActive && isAI && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-violet-600/10 to-purple-600/10 animate-pulse" />
                    <div className="absolute -right-2 -top-2 w-16 h-16 bg-purple-500/20 rounded-full blur-2xl" />
                  </>
                )}
                {isActive && isLeadsDiscovery && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-cyan-500/10" />
                    <div className="absolute -right-2 -top-2 w-16 h-16 bg-cyan-500/20 rounded-full blur-2xl" />
                  </>
                )}
                
                {/* Icon with special effects */}
                <div className="relative z-10">
                  {renderIcon(item.label, isActive)}
                </div>
                
                <span className="relative z-10 font-medium">{item.label}</span>
                
                {/* Active indicator dot with special colors */}
                {isActive && (
                  <span className={`ml-auto relative z-10 w-1.5 h-1.5 rounded-full animate-pulse ${
                    isAI ? "bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]" : 
                    isLeadsDiscovery ? "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" : 
                    "bg-accent"
                  }`} />
                )}
              </NavLink>
            );
          })}
        </nav>

      </aside>
    </div>
  );
};