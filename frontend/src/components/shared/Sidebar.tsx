import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { navigationItems } from "../../constants/navigation";
import {
  LayoutDashboard,
  Search,
  Layers,
  Inbox,
  Settings,
  Trash2,
  BrainCircuit as Brain,
  Sparkles,
  Zap,
  Cpu
} from "lucide-react";
import { useEffect, useState } from "react";

// Custom icon components with special effects
const AIIcon = ({ isActive }: { isActive: boolean }) => (
  <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${isActive
      ? "bg-gradient-to-br from-purple-600 to-violet-800 shadow-[0_0_20px_rgba(139,92,246,0.6)]"
      : "bg-gradient-to-br from-purple-500/20 to-violet-600/20 group-hover:shadow-[0_0_15px_rgba(139,92,246,0.4)]"
    }`}>
    <Brain className={`w-4 h-4 ${isActive ? "text-content" : "text-purple-400"}`} />
    {/* Sparkle effects */}
    <Sparkles className={`absolute -top-1 -right-1 w-3 h-3 text-yellow-400 animate-pulse `} />
    {/* Pulsing glow rings */}
    <span className={`absolute inset-0 rounded-lg animate-ping bg-purple-500/40 `} />
    <span className={`absolute -inset-1 rounded-xl blur-sm ${isActive ? "bg-gradient-to-r from-purple-600/40 to-violet-600/40 animate-pulse" : "hidden"}`} />
  </div>
);

const LeadsDiscoveryIcon = ({ isActive }: { isActive: boolean }) => (
  <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${isActive
      ? "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
      : "bg-gradient-to-br from-cyan-500/20 to-blue-600/20"
    }`}>
    <Search className={`w-4 h-4 ${isActive ? "text-content" : "text-cyan-400"}`} />
    {/* Sparkle effects */}
    <Sparkles className={`absolute -top-1 -right-1 w-3 h-3 ${isActive ? "text-yellow-400 animate-pulse" : "hidden"}`} />
  </div>
);

const iconMap: Record<string, (isActive: boolean) => React.ReactNode> = {
  "Dashboard": (isActive) => (
    <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${isActive ? "bg-accent/20 text-accent" : "bg-surface-tertiary/50 text-content-tertiary"}`}>
      <LayoutDashboard className="w-4 h-4" />
    </div>
  ),
  "Leads Discovery": (isActive) => <LeadsDiscoveryIcon isActive={isActive} />,
  "Manage Leads": (isActive) => (
    <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${isActive ? "bg-accent/20 text-accent" : "bg-surface-tertiary/50 text-content-tertiary"}`}>
      <Layers className="w-4 h-4" />
    </div>
  ),
  "Messages": (isActive) => (
    <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${isActive ? "bg-accent/20 text-accent" : "bg-surface-tertiary/50 text-content-tertiary"}`}>
      <Inbox className="w-4 h-4" />
    </div>
  ),
  "CRM": (isActive) => (
    <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${isActive ? "bg-accent/20 text-accent" : "bg-surface-tertiary/50 text-content-tertiary"}`}>
      <Zap className="w-4 h-4" />
    </div>
  ),
  "AI": (isActive) => <AIIcon isActive={isActive} />,
  "Settings": (isActive) => (
    <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${isActive ? "bg-accent/20 text-accent" : "bg-surface-tertiary/50 text-content-tertiary"}`}>
      <Settings className="w-4 h-4" />
    </div>
  ),
  "Recycle Bin": (isActive) => (
    <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${isActive ? "bg-accent/20 text-accent" : "bg-surface-tertiary/50 text-content-tertiary"}`}>
      <Trash2 className="w-4 h-4" />
    </div>
  ),
};

type SidebarProps = {
  className?: string;
};

export const Sidebar = ({ className = "" }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <aside className={`hidden w-72 border-r border-accent/10 bg-gradient-to-b from-surface-secondary/90 via-surface-secondary/80 to-surface/90 p-5 backdrop-blur-glass md:block ${className}`.trim()}>
      {/* Logo Section - Pro Level */}
      <div className="flex items-center gap-3 mb-4" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <div className="relative flex items-center justify-center w-fit h-fit rounded-2xl bg-gradient-to-br from-purple-700 to-purple-900 shadow-glow animate-float">
          <img src={logo} alt="leadsGrid" className="h-10 w-10" />
        </div>
        <div>
          <span className="text-xl uppercase tracking-[0.10em] text-content-tertiary">LeadsGrid</span>
          <p className="text-[10px] text-content-tertiary uppercase tracking-widest">Lead Intelligence</p>
        </div>
      </div>

      {/* Navigation - Pro Level with Icons */}
      <nav className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-content-tertiary mb-3 px-2 font-medium">Menu</p>
        {navigationItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const isAI = item.label === "AI";
          const isLeadsDiscovery = item.label === "Leads Discovery";
          const isHovered = hoveredItem === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`group flex items-center gap-3 rounded-xl border px-3 py-3 text-sm transition-all duration-300 relative overflow-hidden ${isActive
                  ? isAI
                    ? "border-purple-500/50 bg-gradient-to-r from-purple-500/20 to-violet-600/10 text-content shadow-[0_0_25px_rgba(139,92,246,0.3)]"
                    : isLeadsDiscovery
                      ? "border-cyan-500/50 bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-content shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                      : "border-accent/40 bg-gradient-to-r  from-accent-soft/40 to-accent-soft/10 text-content shadow-glow"
                  : "border-transparent text-content-secondary hover:border-accent/20 hover:bg-accent-soft/20 hover:text-content"
                }`}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Animated background gradient for special items */}
              {isActive && isAI && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-violet-600/10 to-purple-600/10 animate-pulse" />
                  <div className="absolute -right-2 -top-2 w-16 h-16 bg-purple-500/20 rounded-full blur-2xl animate-pulse" />
                </>
              )}
              {isActive && isLeadsDiscovery && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-cyan-500/10 animate-pulse" />
                  <div className="absolute -right-2 -top-2 w-16 h-16 bg-cyan-500/20 rounded-full blur-2xl" />
                </>
              )}

              {/* Icon */}
              <div className="relative z-10">
                {iconMap[item.label]?.(isActive) || (
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${isActive ? "bg-accent/20 text-accent" : "bg-surface-tertiary/50 text-content-tertiary"}`}>
                    <LayoutDashboard className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Label */}
              <span className="relative z-10 font-medium tracking-wide">{item.label}</span>

              {/* Active indicator dot */}
              {isActive && (
                <span className={`ml-auto relative z-10 w-1.5 h-1.5 rounded-full animate-pulse ${isAI ? "bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]" :
                    isLeadsDiscovery ? "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" :
                      "bg-accent"
                  }`} />
              )}

              {/* Hover arrow */}
              {!isActive && isHovered && (
                <span className="ml-auto text-content-tertiary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  →
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>


    </aside>
  );
};
