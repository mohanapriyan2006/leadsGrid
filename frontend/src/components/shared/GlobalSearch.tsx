import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  Target,
  Zap,
  LayoutDashboard,
  Layers,
  Inbox,
  Trash2,
  Settings,
  BrainCircuit as Brain,
  Sparkles,
  UserCircle2,
  Building2,
  MessageSquareText,
  PlugZap,
  Bell,
  CreditCard,
  Lock,
  Bot,
  ArrowRight,
  Command,
  Loader2,
} from "lucide-react";
import { useGlobalSearch, type SearchResult } from "../../hooks/useGlobalSearch";
import type { ManageLead } from "../../features/leads/types/manageLead";

const featureIconMap: Record<string, React.ReactNode> = {
  "dashboard": <LayoutDashboard className="w-4 h-4" />,
  "leads-discovery": <Search className="w-4 h-4" />,
  "manage-leads": <Layers className="w-4 h-4" />,
  "messages": <Inbox className="w-4 h-4" />,
  "crm": <Zap className="w-4 h-4" />,
  "ai": <Brain className="w-4 h-4" />,
  "settings": <Settings className="w-4 h-4" />,
  "recycle-bin": <Trash2 className="w-4 h-4" />,
};

const settingsIconMap: Record<string, React.ReactNode> = {
  "profile": <UserCircle2 className="w-4 h-4" />,
  "workspace": <Building2 className="w-4 h-4" />,
  "leads-scoring": <Target className="w-4 h-4" />,
  "messaging": <MessageSquareText className="w-4 h-4" />,
  "integrations": <PlugZap className="w-4 h-4" />,
  "ai-settings": <Bot className="w-4 h-4" />,
  "notifications": <Bell className="w-4 h-4" />,
  "billing": <CreditCard className="w-4 h-4" />,
  "privacy-data": <Lock className="w-4 h-4" />,
};

const categoryColors: Record<string, { bg: string; text: string; border: string; glow: string , color: string }> = {
  leads: { color: "bg-info-soft", bg: "bg-accent-secondary/40" , text: "text-info", border: "border-info/30", glow: "shadow-[0_0_10px_rgba(6,182,212,0.25)]" },
  deals: { color: "bg-warning-soft", bg: "bg-accent-secondary/40", text: "text-warning", border: "border-warning/30", glow: "shadow-[0_0_10px_rgba(245,158,11,0.25)]" },
  features: { color: "bg-accent-soft", bg: "bg-accent-secondary/40", text: "text-accent", border: "border-accent/30", glow: "shadow-[0_0_10px_rgba(167,139,250,0.25)]" },
  settings: { color: "bg-success-soft", bg: "bg-accent-secondary/40", text: "text-success", border: "border-success/30", glow: "shadow-[0_0_10px_rgba(16,185,129,0.25)]" },
  recycle: { color: "bg-danger-soft", bg: "bg-accent-secondary/40", text: "text-danger", border: "border-danger/30", glow: "shadow-[0_0_10px_rgba(239,68,68,0.25)]" },
};

function ResultIcon({ result }: { result: SearchResult }) {
  if (result.category === "leads") return <Target className={`w-4 h-4 ${categoryColors.leads.text}`} />;
  if (result.category === "deals") return featureIconMap[result.icon] ?? <Zap className={`w-4 h-4 ${categoryColors.deals.text}`} />;
  if (result.category === "recycle") return <Trash2 className={`w-4 h-4 ${categoryColors.recycle.text}`} />;
  if (result.category === "features") return featureIconMap[result.icon] ?? <Sparkles className="w-4 h-4 text-accent" />;
  if (result.category === "settings") return settingsIconMap[result.icon] ?? <Settings className="w-4 h-4 text-success" />;
  return <Sparkles className="w-4 h-4 text-accent" />;
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  const lowerQuery = query.toLowerCase();
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === lowerQuery ? (
          <mark key={i} className="bg-accent/20 text-accent rounded px-0.5 font-medium">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export const GlobalSearch = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [isNavigating, setIsNavigating] = useState(false);

  const { results, loadingDeals, reset } = useGlobalSearch(query, isOpen);

  const flatResults = useMemo(() => results.flatMap((g) => g.items), [results]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [flatResults.length]);

  // Keyboard shortcut: Cmd/Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => {
          if (!prev) {
            setTimeout(() => inputRef.current?.focus(), 0);
          }
          return !prev;
        });
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
        reset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reset]);

  // Track input position for fixed dropdown placement
  useEffect(() => {
    if (!isOpen) return;
    const updatePos = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDropdownPos({ top: rect.bottom + 8, left: rect.left, width: rect.width });
      }
    };
    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [isOpen]);

  // Click outside to close (excludes both input and portaled dropdown)
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setIsOpen(false);
      setQuery("");
      reset();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, reset]);

  // Scroll selected item into view
  useEffect(() => {
    const el = itemRefs.current[selectedIndex];
    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!flatResults.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % flatResults.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const result = flatResults[selectedIndex];
        if (result) navigateToResult(result);
      }
    },
    [flatResults, selectedIndex]
  );

  const navigateToResult = useCallback(
    (result: SearchResult) => {
      setIsNavigating(true);
      setIsOpen(false);
      setQuery("");

      // Navigate immediately
      if (result.category === "leads") {
        navigate("/leads-discovery");
      } else if (result.category === "deals") {
        const lead = result.meta?.lead as ManageLead | undefined;
        if (lead && (result.meta?.isCrm as boolean)) {
          navigate("/crm", { state: { selectedDealId: lead.id } });
        } else if (lead) {
          navigate("/manage-leads", { state: { selectedManageLeadId: lead.id } });
        } else {
          navigate(result.path);
        }
      } else if (result.category === "recycle") {
        const lead = result.meta?.lead as ManageLead | undefined;
        if (lead) {
          navigate("/recycle-bin", { state: { selectedLeadId: lead.id } });
        } else {
          navigate(result.path);
        }
      } else {
        navigate(result.path);
      }

      // Stop loader after 1 second regardless
      setTimeout(() => {
        setIsNavigating(false);
      }, 1000);
    },
    [navigate]
  );

  const hasQuery = query.trim().length > 0;
  const showDropdown = isOpen && hasQuery;
  const showRecent = isOpen && !hasQuery;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4  transition-colors group-focus-within:text-accent" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleInputKeyDown}
          placeholder="Search leads, deals, features, settings..."
          className="w-full glass-input h-9 pl-9 pr-4 py-2 text-xs rounded-full border-accent/10 focus:border-accent/40 focus:shadow-glow transition-all duration-300 sm:h-10 sm:text-sm"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-[10px]  bg-surface-tertiary/50 px-1.5 py-0.5 rounded">
          <Command className="w-3 h-3" />
          <span>K</span>
        </div>
      </div>

      {/* Navigation loading overlay */}
      {isNavigating &&
        createPortal(
          <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-surface/40 backdrop-blur-sm">
            <div className="glass-card-lg flex flex-col items-center gap-3 px-8 py-6">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
              <p className="text-sm font-medium text-content-secondary">Loading...</p>
            </div>
          </div>,
          document.body
        )}

      {/* Dropdown rendered via portal to escape all parent stacking contexts */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              zIndex: 99999,
            }}
          >
            <div className="glass-card-lg max-h-[70vh] overflow-y-auto p-2 sm:p-3 animate-fadeIn">
              {showRecent && (
                <div className="text-center py-6 px-4">
                  <div className="mx-auto w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center mb-3">
                    <Search className="w-5 h-5 text-accent" />
                  </div>
                  <p className="text-sm text-content-secondary font-medium">Type to search anything</p>
                  <p className="text-xs  mt-1">
                    Leads, deals, pages, and settings — all in one place.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {["Leads Discovery", "CRM", "Settings", "Messages"].map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setQuery(s);
                          inputRef.current?.focus();
                        }}
                        className="text-[11px] px-2.5 py-1 rounded-full border border-accent/15 bg-surface-secondary/60 text-content-secondary hover:border-accent/30 hover:text-content transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showDropdown && flatResults.length === 0 && !loadingDeals && (
                <div className="text-center py-8 px-4">
                  <div className="mx-auto w-10 h-10 rounded-full bg-surface-tertiary flex items-center justify-center mb-3">
                    <X className="w-5 h-5 " />
                  </div>
                  <p className="text-sm text-content-secondary font-medium">No results found</p>
                  <p className="text-xs  mt-1">
                    Try a different keyword or check spelling.
                  </p>
                </div>
              )}

              {showDropdown && loadingDeals && flatResults.length === 0 && (
                <div className="text-center py-8 px-4">
                  <Loader2 className="w-5 h-5 text-accent animate-spin mx-auto mb-2" />
                  <p className="text-xs text-content-secondary">Loading deals...</p>
                </div>
              )}

              {showDropdown &&
                results.map((group) => {
                  const colors = categoryColors[group.category];
                  return (
                    <div key={group.category} className="mb-2 last:mb-0">
                      <div className="flex items-center gap-2 px-2 py-1.5">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${colors.text}`}>
                          {group.label}
                        </span>
                        <div className="flex-1 h-px bg-gradient-to-r from-accent/10 to-transparent" />
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${colors.color} ${colors.text} ${colors.border}`}>
                          {group.items.length}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        {group.items.map((item, idx) => {
                          const globalIdx = flatResults.findIndex((r) => r.id === item.id);
                          const isSelected = globalIdx === selectedIndex;
                          return (
                            <button
                              key={item.id}
                              ref={(el) => { itemRefs.current[globalIdx] = el; }}
                              onClick={() => navigateToResult(item)}
                              onMouseEnter={() => setSelectedIndex(globalIdx)}
                              className={`w-full flex items-center gap-3 rounded-glass-sm px-3 py-2.5 text-left transition-all duration-200 group/result ${
                                isSelected
                                  ? `${colors.bg} border ${colors.border} ${colors.glow}`
                                  : "border border-transparent hover:bg-surface-secondary/60 hover:border-accent/10"
                              }`}
                            >
                              <div
                                className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors ${
                                  isSelected ? colors.bg : "bg-surface-tertiary/60"
                                }`}
                              >
                                <ResultIcon result={item} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-content truncate">
                                  <Highlight text={item.title} query={query} />
                                </p>
                                <p className="text-xs text-content-secondary truncate">
                                  <Highlight text={item.subtitle} query={query} />
                                </p>
                              </div>
                              <ArrowRight
                                className={`w-3.5 h-3.5 shrink-0 transition-all duration-200 ${
                                  isSelected
                                    ? `${colors.text} opacity-100 translate-x-0`
                                    : "text-content-tertiary opacity-0 -translate-x-1"
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

              {showDropdown && flatResults.length > 0 && (
                <div className="pt-2 pb-1 text-center">
                  <p className="text-[10px] ">
                    Press <kbd className="px-1 py-0.5 rounded bg-surface-tertiary text-content-secondary text-[10px]">↑</kbd>{" "}
                    <kbd className="px-1 py-0.5 rounded bg-surface-tertiary text-content-secondary text-[10px]">↓</kbd> to navigate,{" "}
                    <kbd className="px-1 py-0.5 rounded bg-surface-tertiary text-content-secondary text-[10px]">Enter</kbd> to select
                  </p>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
