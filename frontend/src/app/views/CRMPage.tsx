import { useEffect, useMemo, useState, useRef } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { ScoreBadge } from "../../components/ui/ScoreBadge";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ConfirmDialog } from "../../features/leads/components/ConfirmDialog";
import { useCentralizedLeads } from "../../features/leads/hooks/useCentralizedLeads";
import { leadService } from "../../features/leads/services/leadService";
import { PageBackground } from "../../components/ui/PageBackground";
import bgConnecting from "../../assets/bg-images/connecting-teams.svg";
import type { DealStatus } from "../../features/common/types/ui";
import type { ManageLeadStage } from "../../features/leads/types/manageLead";

type CRMStage = Extract<ManageLeadStage, "NEGOTIATION" | "CONTRACTED" | "IN_PROGRESS" | "CLOSED">;

type Deal = {
  id: string;
  name: string;
  company: string;
  status: DealStatus;
  score: number;
  lastAction: string;
  daysInStage: number;
  value: string;
  email?: string | null;
  phone?: string | null;
};

const CRM_STAGES: CRMStage[] = ["NEGOTIATION", "CONTRACTED", "IN_PROGRESS", "CLOSED"];

const STAGE_TO_STATUS: Record<CRMStage, DealStatus> = {
  NEGOTIATION: "negotiation",
  CONTRACTED: "contracted",
  IN_PROGRESS: "in-progress",
  CLOSED: "closed",
};

const STATUS_TO_STAGE: Record<DealStatus, CRMStage> = {
  negotiation: "NEGOTIATION",
  contracted: "CONTRACTED",
  "in-progress": "IN_PROGRESS",
  closed: "CLOSED",
};

const parseCurrency = (value: string) => Number(value.replace(/[$,]/g, "") || "0");
const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

type DealModalProps = {
  deal: Deal | null;
  open: boolean;
  variant?: "hover" | "dialog";
  position?: { x: number; y: number } | null;
  onClose: () => void;
  onDelete: () => void;
  onEdit?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

const DealModal = ({
  deal,
  open,
  variant = "hover",
  position,
  onClose,
  onDelete,
  onEdit,
  onMouseEnter,
  onMouseLeave,
}: DealModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDraggingModal, setIsDraggingModal] = useState(false);
  const [modalOffset, setModalOffset] = useState({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });

  if (!deal) return null;
  const isHover = variant === "hover";

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDraggingModal(true);
    dragStartPos.current = {
      x: e.clientX - modalOffset.x,
      y: e.clientY - modalOffset.y,
    };
  };

  // Handle drag move
  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDraggingModal) return;
    e.preventDefault();
    setModalOffset({
      x: e.clientX - dragStartPos.current.x,
      y: e.clientY - dragStartPos.current.y,
    });
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDraggingModal(false);
  };

  const hoverStyle = position
    ? { left: Math.min(position.x + 16, window.innerWidth - 380), top: Math.min(position.y, window.innerHeight - 400) }
    : { right: 24, top: 96 };

  // Merge hover position with drag offset for draggable popups
  const dialogStyle = isHover
    ? { ...hoverStyle, transform: `translate(${modalOffset.x}px, ${modalOffset.y}px)` }
    : { transform: `translate(${modalOffset.x}px, ${modalOffset.y}px)` };

  // Determine status color
  const getStatusColor = (status: DealStatus) => {
    switch (status) {
      case "negotiation": return "text-info";
      case "contracted": return "text-success";
      case "in-progress": return "text-warning";
      case "closed": return "text-accent-secondary";
      default: return "text-content-secondary";
    }
  };

  // Progress percentage based on status
  const getProgress = (status: DealStatus) => {
    switch (status) {
      case "negotiation": return 25;
      case "contracted": return 50;
      case "in-progress": return 75;
      case "closed": return 100;
      default: return 0;
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={isHover ? "fixed z-[90]" : "fixed inset-0 z-[100] flex items-center justify-center bg-surface/80 backdrop-blur-sm px-4"}
          style={isHover ? hoverStyle : undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isHover ? undefined : onClose}
        >
          <motion.section
            ref={modalRef}
            className={`glass-card-lg w-full p-4 ${isHover ? "max-w-sm" : "max-w-md"} ${isDraggingModal ? "cursor-grabbing" : ""}`}
            style={dialogStyle}
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.985 }}
            transition={{ duration: 0.16 }}
            onClick={(event) => event.stopPropagation()}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
          >
            {/* Draggable Header */}
            <div
              className={`flex items-start justify-between gap-3 cursor-grab active:cursor-grabbing`}
              onMouseDown={handleDragStart}
            >
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-content">{deal.name}</h3>
                <p className="text-sm text-content-secondary">{deal.company}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-content-tertiary">⋮⋮ Drag</span>
                <button type="button" onClick={onClose} className="glass-btn px-2 py-1 text-xs">Close</button>
              </div>
            </div>

            {/* Status & Progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-content-tertiary uppercase tracking-[0.1em]">Pipeline Progress</span>
                <span className={`font-semibold ${getStatusColor(deal.status)}`}>{getProgress(deal.status)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-accent-secondary transition-all duration-500"
                  style={{ width: `${getProgress(deal.status)}%` }}
                />
              </div>
            </div>

            {/* Badges */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="badge-info">Score {deal.score}</span>
              <span className={`badge-success ${getStatusColor(deal.status)}`}>Status {deal.status}</span>
              <span className="badge-accent">Value {deal.value}</span>
            </div>

            {/* Contact Details */}
            <div className="glass-card-sm mt-4 p-3 text-xs">
              <p className="text-content-tertiary uppercase tracking-[0.08em] mb-2">Contact Info</p>
              <div className="grid gap-1 text-content-secondary">
                {deal.email && <p>📧 {deal.email}</p>}
                {deal.phone && <p>📱 {deal.phone}</p>}
                <p>📅 Last Action: {deal.lastAction}</p>
                <p>⏱️ Days in Stage: {deal.daysInStage}</p>
              </div>
            </div>

            {/* Deal Stats */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="glass-card-sm p-2 text-center">
                <p className="text-[10px] text-content-tertiary uppercase tracking-[0.08em]">Deal Value</p>
                <p className="text-sm font-semibold text-success">{deal.value}</p>
              </div>
              <div className="glass-card-sm p-2 text-center">
                <p className="text-[10px] text-content-tertiary uppercase tracking-[0.08em]">Quality Score</p>
                <p className="text-sm font-semibold text-accent">{deal.score}/100</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {onEdit && (
                <button type="button" onClick={onEdit} className="glass-btn px-3 py-1.5 text-xs">
                  ✏️ Edit
                </button>
              )}
              <button type="button" onClick={onDelete} className="rounded-glass-sm border border-danger/30 bg-danger-soft px-3 py-1.5 text-xs text-danger transition hover:shadow-[0_0_16px_rgba(239,68,68,0.3)]">
                🗑️ Delete
              </button>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export const CRMPage = () => {
  const [view, setView] = useState<"table" | "kanban">("table");
  const { leads: centralizedLeads, loading } = useCentralizedLeads();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Modal states
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [modalPosition, setModalPosition] = useState<{ x: number; y: number } | null>(null);
  const [isModalHover, setIsModalHover] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [disableDetailsPopup, setDisableDetailsPopup] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [newDeal, setNewDeal] = useState<Omit<Deal, "id">>({
    name: "",
    company: "",
    status: "negotiation",
    score: 60,
    lastAction: "",
    daysInStage: 0,
    value: "$0",
  });

  useEffect(() => {
    const nextDeals = centralizedLeads
      .filter((lead) => CRM_STAGES.includes(lead.stage as CRMStage))
      .map((lead) => {
        const updatedAt = new Date(lead.updated_at || lead.created_at || Date.now());
        const daysInStage = Math.max(0, Math.floor((Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)));

        return {
          id: lead.id,
          name: lead.name,
          company: lead.company,
          status: STAGE_TO_STATUS[lead.stage as CRMStage],
          score: lead.score,
          lastAction: lead.last_activity_at ? new Date(lead.last_activity_at).toLocaleDateString() : "No recent activity",
          daysInStage,
          value: formatCurrency(lead.budget_estimate),
          email: lead.email,
          phone: lead.phone,
        } satisfies Deal;
      });

    setDeals(nextDeals);
  }, [centralizedLeads]);

  const activeDeal = useMemo(() => {
    if (hoveredId) {
      return deals.find((deal) => deal.id === hoveredId) ?? null;
    }
    if (selectedDealId) {
      return deals.find((deal) => deal.id === selectedDealId) ?? null;
    }
    return null;
  }, [hoveredId, selectedDealId, deals]);

  const handleHoverStart = (dealId: string, event: React.MouseEvent) => {
    if (disableDetailsPopup) return; // Don't show popup if disabled
    setHoveredId(dealId);
    setSelectedDealId(dealId);
    setModalPosition({ x: event.clientX, y: event.clientY });
  };

  const handleHoverEnd = (dealId: string) => {
    window.setTimeout(() => {
      if (!isModalHover) {
        setHoveredId((current) => (current === dealId ? null : current));
      }
    }, 40);
  };

  const openDetails = (dealId: string) => {
    setSelectedDealId(dealId);
    setDetailsOpen(true);
  };

  const openEdit = (dealId: string) => {
    setSelectedDealId(dealId);
    setEditOpen(true);
  };

  const handleDelete = async (dealId: string) => {
    await leadService.softDeleteManageLead(dealId);
    setConfirmDeleteId(null);
    setFeedback("Deal deleted and moved to recycle bin");
  };

  const handleSaveEdit = async (updated: Omit<Deal, "id">) => {
    if (!selectedDealId) return;
    if (!window.confirm("Are you sure you want to update this deal?")) return;

    await leadService.updateManageLead(selectedDealId, {
      name: updated.name,
      company: updated.company,
      stage: STATUS_TO_STAGE[updated.status],
      score: updated.score,
      budget_estimate: parseCurrency(updated.value),
    });

    setEditOpen(false);
    setFeedback("Deal updated successfully");
  };

  const totalValue = useMemo(
    () =>
      deals
        .filter((deal) => deal.status !== "closed")
        .reduce(
          (sum, deal) => sum + Number(deal.value.replace(/[$,]/g, "")),
          0,
        ),
    [deals],
  );

  const closedValue = useMemo(
    () =>
      deals
        .filter((deal) => deal.status === "closed")
        .reduce(
          (sum, deal) => sum + Number(deal.value.replace(/[$,]/g, "")),
          0,
        ),
    [deals],
  );

  const updateStatus = async (id: string, status: DealStatus) => {
    setDeals((current) =>
      current.map((deal) => (deal.id === id ? { ...deal, status } : deal)),
    );

    await leadService.updateManageLead(id, {
      stage: STATUS_TO_STAGE[status],
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const statuses: DealStatus[] = ["negotiation", "contracted", "in-progress", "closed"];

    if (statuses.includes(overId as DealStatus)) {
      await updateStatus(activeId, overId as DealStatus);
      return;
    }

    const overDeal = deals.find((deal) => deal.id === overId);
    if (!overDeal) return;

    await updateStatus(activeId, overDeal.status);
  };

  const handleAddDeal = async () => {
    if (!newDeal.name.trim() || !newDeal.company.trim()) return;

    await leadService.createManageLead({
      name: newDeal.name,
      company: newDeal.company,
      email: undefined,
      phone: undefined,
      stage: STATUS_TO_STAGE[newDeal.status],
      budget_estimate: parseCurrency(newDeal.value),
    });

    setNewDeal({
      name: "",
      company: "",
      status: "negotiation",
      score: 60,
      lastAction: "",
      daysInStage: 0,
      value: "$0",
    });
    setIsAdding(false);
  };

  const handleNewDealChange = (
    field: keyof Omit<Deal, "id">,
    value: string | number,
  ) => {
    setNewDeal((prev) => ({
      ...prev,
      [field]:
        field === "score"
          ? Math.max(0, Math.min(100, Number(value) || 0))
          : field === "value"
            ? String(value)
            : value,
    }));
  };

  const statusColumns: DealStatus[] = [
    "negotiation",
    "contracted",
    "in-progress",
    "closed",
  ];

  const getStatusLabelColor = (status: DealStatus) => {
    switch (status) {
      case "negotiation":
        return "from-info/30 via-info/10 to-transparent text-info";
      case "contracted":
        return "from-success/30 via-success/10 to-transparent text-success";
      case "in-progress":
        return "from-warning/30 via-warning/10 to-transparent text-warning";
      case "closed":
        return "from-accent-secondary/30 via-accent-secondary/10 to-transparent text-accent-secondary";
      default:
        return "from-content-tertiary/30 via-content-tertiary/10 to-transparent text-content-secondary";
    }
  };

  return (
    <div className="page-with-bg">
      <PageBackground image={bgConnecting} tint="rgba(99, 102, 241,0.80)" />
      <div className="h-[calc(100vh-100px)] overflow-auto space-y-4 p-6">
        <header className="glass-card-lg flex flex-col justify-between gap-3 px-5 py-5 md:flex-row md:items-center md:px-6">
          <div>
            <h2 className="bg-gradient-to-r from-content via-accent to-accent-secondary bg-clip-text text-3xl font-semibold text-transparent">
              Pipeline CRM
            </h2>
            <p className="mt-1 text-sm text-content-secondary">
              Deal intelligence, live pipeline control, and adaptive execution.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-accent/10 bg-surface-secondary/80 px-3 py-1.5 text-[11px] text-content-tertiary backdrop-blur-glass md:flex">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-success" />
              Realtime scoring enabled
            </div>
            <button
              onClick={() => setDisableDetailsPopup((v) => !v)}
              className={`glass-btn text-xs ${disableDetailsPopup ? "text-danger" : "text-success"}`}
              title={disableDetailsPopup ? "Click to enable details popup" : "Click to disable details popup"}
            >
              {disableDetailsPopup ? "🚫 Popups Off" : "✓ Popups On"}
            </button>
            <button
              onClick={() => setIsAdding((s) => !s)}
              className="accent-btn group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-surface/80 text-[11px] text-accent">
                +
              </span>
              New deal
            </button>
          </div>
        </header>

        {/* add deal form */}
        {isAdding && (
          <div className="glass-card border-accent/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-1 flex-wrap gap-3">
                <input
                  value={newDeal.name}
                  onChange={(e) =>
                    handleNewDealChange("name", e.target.value)
                  }
                  placeholder="Client name"
                  className="glass-input min-w-[140px] flex-1 px-3 py-2 text-xs"
                />
                <input
                  value={newDeal.company}
                  onChange={(e) =>
                    handleNewDealChange("company", e.target.value)
                  }
                  placeholder="Company"
                  className="glass-input min-w-[140px] flex-1 px-3 py-2 text-xs"
                />
                <select
                  value={newDeal.status}
                  onChange={(e) =>
                    handleNewDealChange(
                      "status",
                      e.target.value as DealStatus,
                    )
                  }
                  className="glass-input px-3 py-2 text-xs"
                >
                  <option value="negotiation">negotiation</option>
                  <option value="contracted">contracted</option>
                  <option value="in-progress">in-progress</option>
                  <option value="closed">closed</option>
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={newDeal.score}
                    onChange={(e) =>
                      handleNewDealChange("score", e.target.value)
                    }
                    placeholder="Score"
                    className="glass-input w-20 px-2 py-2 text-xs"
                  />
                  <ScoreBadge score={newDeal.score} />
                </div>
                <input
                  value={newDeal.value}
                  onChange={(e) =>
                    handleNewDealChange("value", e.target.value)
                  }
                  placeholder="$10,000"
                  className="glass-input w-28 px-3 py-2 text-xs text-success"
                />
                <input
                  value={newDeal.lastAction}
                  onChange={(e) =>
                    handleNewDealChange("lastAction", e.target.value)
                  }
                  placeholder="Last touchpoint"
                  className="glass-input min-w-[160px] flex-1 px-3 py-2 text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddDeal}
                  className="accent-btn px-3 py-2 text-xs font-semibold"
                >
                  Add to pipeline
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-content-tertiary hover:text-content-secondary transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* stats */}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "ACTIVE PIPELINE",
              value: `$${totalValue.toLocaleString()}`,
              color: "#b595ff",
              sub: "Open opportunities",
            },
            {
              label: "CLOSED WON",
              value: `$${closedValue.toLocaleString()}`,
              color: "#10B981",
              sub: "Realized revenue",
            },
            {
              label: "TOTAL LEADS",
              value: String(deals.length),
              color: "#F9FAFB",
              sub: "Tracked accounts",
            },
            {
              label: "AVG. SCORE",
              value: String(
                Math.round(
                  deals.reduce((sum, deal) => sum + deal.score, 0) /
                  deals.length,
                ),
              ),
              color: "#F59E0B",
              sub: "Overall quality",
            },
          ].map((item) => (
            <article
              key={item.label}
              className="glass-card group relative overflow-hidden p-4 transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-glow"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 blur-3xl transition group-hover:opacity-100">
                <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(167,139,250,0.4),transparent_60%)]" />
              </div>
              <p className="text-[11px] tracking-[0.18em] text-content-tertiary">
                {item.label}
              </p>
              <p
                className="mt-2 text-3xl font-semibold drop-shadow-sm"
                style={{ color: item.color }}
              >
                {item.value}
              </p>
              <p className="mt-1 text-[11px] text-content-secondary">{item.sub}</p>
            </article>
          ))}
        </div>

        {/* view toggle */}
        <div className="flex items-center justify-between gap-2">
          <div className="glass-card-sm inline-flex p-1 text-[11px]">
            {(["table", "kanban"] as const).map((option) => (
              <button
                key={option}
                onClick={() => setView(option)}
                className={`relative rounded-full px-4 py-1.5 uppercase tracking-[0.18em] transition-all duration-200 ${view === option
                    ? "bg-gradient-to-r from-accent to-accent-secondary text-content-inverse shadow-glow"
                    : "text-content-tertiary hover:text-content-secondary"
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
          <p className="hidden text-[11px] text-content-tertiary md:block">
            Drag deals between stages in Kanban view to instantly update status.
          </p>
        </div>

        {feedback ? (
          <div className="rounded-glass-sm border border-success/30 bg-success-soft px-3 py-2 text-sm text-success">{feedback}</div>
        ) : null}

        {/* main content */}
        {loading ? (
          <div className="glass-card p-8 text-center text-content-secondary">Loading CRM deals...</div>
        ) : view === "table" ? (
          <div className="glass-card overflow-hidden">
            <div className="grid grid-cols-[2fr_1.5fr_1fr_90px_1fr_220px] border-b border-accent/10 bg-gradient-to-r from-accent/5 via-transparent to-transparent px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-content-tertiary">
              <span>Client</span>
              <span>Company</span>
              <span>Status</span>
              <span>Score</span>
              <span>Last action</span>
              <span>Actions</span>
            </div>
            <div className="divide-y divide-accent/5">
              {deals.map((deal, index) => (
                <div
                  key={deal.id}
                  className="grid grid-cols-[2fr_1.5fr_1fr_90px_1fr_220px] items-center px-4 py-3 transition-colors hover:bg-accent/5"
                  style={{
                    animation: `fadeInUp 0.35s ease-out ${index * 0.03}s both`,
                  }}
                >
                  <span className="text-sm text-content">{deal.name}</span>
                  <span className="text-sm text-content-secondary">{deal.company}</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={deal.status}
                      onChange={(event) =>
                        void updateStatus(
                          deal.id,
                          event.target.value as DealStatus,
                        )
                      }
                      className="glass-input px-2 py-1 text-xs"
                    >
                      <option value="negotiation">negotiation</option>
                      <option value="contracted">contracted</option>
                      <option value="in-progress">in-progress</option>
                      <option value="closed">closed</option>
                    </select>
                    <StatusBadge status={deal.status} />
                  </div>
                  <ScoreBadge score={deal.score} />
                  <span className="text-sm text-content-secondary">
                    {deal.lastAction}
                  </span>
                  <div className="flex gap-1">
                    <button type="button" className="glass-btn px-2 py-1 text-[11px]" onClick={() => openDetails(deal.id)}>Details</button>
                    <button type="button" className="glass-btn px-2 py-1 text-[11px]" onClick={() => openEdit(deal.id)}>Edit</button>
                    <button type="button" className="rounded-glass-sm border border-danger/30 bg-danger-soft px-2 py-1 text-[11px] text-danger" onClick={() => setConfirmDeleteId(deal.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <DndContext
            onDragStart={() => setIsDragging(true)}
            onDragCancel={() => setIsDragging(false)}
            onDragEnd={(event) => {
              void handleDragEnd(event);
            }}
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {statusColumns.map((status) => {
                const columnDeals = deals.filter((deal) => deal.status === status);

                return (
                  <DroppableStatusColumn
                    key={status}
                    status={status}
                    columnDeals={columnDeals}
                  >
                    <SortableContext
                      items={columnDeals.map((d) => d.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex-1 space-y-2 overflow-hidden">
                        {columnDeals.length === 0 && (
                          <div className="flex h-28 items-center justify-center rounded-glass-sm border border-dashed border-accent/15 bg-surface-secondary/50 text-[11px] text-content-secondary">
                            Drop deals here to move into{" "}
                            <span className="ml-1 font-semibold">
                              {status}
                            </span>
                            .
                          </div>
                        )}

                        {columnDeals.map((deal, index) => (
                          <KanbanCard
                            key={deal.id}
                            deal={deal}
                            index={index}
                            onHoverStart={handleHoverStart}
                            onHoverEnd={handleHoverEnd}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DroppableStatusColumn>
                );
              })}
            </div>
          </DndContext>
        )}

        <DealModal
          key={hoveredId || selectedDealId || "closed"}
          deal={activeDeal}
          open={view === "kanban" ? Boolean(hoveredId && activeDeal && !isDragging) : Boolean(detailsOpen && activeDeal)}
          variant={view === "kanban" ? "hover" : "dialog"}
          position={modalPosition}
          onClose={() => {
            setHoveredId(null);
            setDetailsOpen(false);
          }}
          onMouseEnter={() => setIsModalHover(true)}
          onMouseLeave={() => {
            setIsModalHover(false);
            setHoveredId(null);
          }}
          onDelete={() => {
            if (!activeDeal) return;
            setConfirmDeleteId(activeDeal.id);
          }}
          onEdit={view === "table" ? () => setEditOpen(true) : undefined}
        />

        {/* Edit Modal */}
        <AnimatePresence>
          {editOpen && activeDeal && (
            <motion.div
              className="fixed inset-0 z-[110] flex items-center justify-center bg-surface/80 backdrop-blur-sm px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditOpen(false)}
            >
              <motion.form
                className="glass-card-lg w-full max-w-xl space-y-3 p-5"
                initial={{ opacity: 0, y: 10, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.985 }}
                transition={{ duration: 0.16 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveEdit({
                    name: activeDeal.name,
                    company: activeDeal.company,
                    status: activeDeal.status,
                    score: activeDeal.score,
                    lastAction: activeDeal.lastAction,
                    daysInStage: activeDeal.daysInStage,
                    value: activeDeal.value,
                  });
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-content">Edit Deal</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-xs text-content-secondary">
                    Name
                    <input
                      defaultValue={activeDeal.name}
                      className="glass-input mt-1"
                    />
                  </label>
                  <label className="text-xs text-content-secondary">
                    Company
                    <input
                      defaultValue={activeDeal.company}
                      className="glass-input mt-1"
                    />
                  </label>
                  <label className="text-xs text-content-secondary">
                    Status
                    <select
                      defaultValue={activeDeal.status}
                      className="glass-input mt-1"
                    >
                      <option value="negotiation" className="bg-surface-tertiary">negotiation</option>
                      <option value="contracted" className="bg-surface-tertiary">contracted</option>
                      <option value="in-progress" className="bg-surface-tertiary">in-progress</option>
                      <option value="closed" className="bg-surface-tertiary">closed</option>
                    </select>
                  </label>
                  <label className="text-xs text-content-secondary">
                    Score
                    <input
                      type="number"
                      defaultValue={activeDeal.score}
                      className="glass-input mt-1"
                    />
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    className="glass-btn px-3 py-1.5 text-xs"
                    onClick={() => setEditOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="accent-btn px-3 py-1.5 text-xs font-semibold">
                    Update Deal
                  </button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>

        <ConfirmDialog
          open={Boolean(confirmDeleteId)}
          title="Delete Deal"
          description="Delete this deal? It will be moved to the recycle bin."
          confirmLabel="Delete"
          danger
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => {
            if (!confirmDeleteId) return;
            void handleDelete(confirmDeleteId);
          }}
        />

        {/* simple keyframes for table rows */}
        <style >{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      </div>
    </div>
  );
};

type KanbanCardProps = {
  deal: Deal;
  index: number;
  onHoverStart: (dealId: string, event: React.MouseEvent) => void;
  onHoverEnd: (dealId: string) => void;
};

const KanbanCard = ({ deal, index, onHoverStart, onHoverEnd }: KanbanCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id });
  const baseStyle = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      id={deal.id}
      onMouseEnter={(e) => onHoverStart(deal.id, e)}
      onMouseLeave={() => onHoverEnd(deal.id)}
      {...attributes}
      {...listeners}
      className={`glass-card-sm cursor-grab p-2.5 text-xs outline-none transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-glow active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
      style={{
        ...baseStyle,
        animation: `fadeInUp 0.35s ease-out ${index * 0.04}s both`,
      }}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-sm text-content">{deal.name}</p>
        <ScoreBadge score={deal.score} />
      </div>
      <p className="text-[11px] text-content-secondary">{deal.company}</p>
      <p className="mt-1 text-[11px] text-content-tertiary">{deal.lastAction}</p>
      <p className="mt-1 text-sm font-semibold text-success">
        {deal.value}
      </p>
    </div>
  );
};

type StatusColumnHeaderProps = {
  status: DealStatus;
  columnDeals: Deal[];
};

type DroppableStatusColumnProps = {
  status: DealStatus;
  columnDeals: Deal[];
  children: React.ReactNode;
};

const DroppableStatusColumn = ({ status, columnDeals, children }: DroppableStatusColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      className={`glass-card group flex flex-col p-3 transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-glow ${isOver ? "border-accent/50 ring-1 ring-accent/30 shadow-glow" : ""}`}
    >
      <StatusColumnHeader status={status} columnDeals={columnDeals} />
      {children}
    </section>
  );
};

const StatusColumnHeader = ({ status, columnDeals }: StatusColumnHeaderProps) => {
  const getStatusLabelColor = (s: DealStatus) => {
    switch (s) {
      case "negotiation":
        return "from-info/30 via-info/10 to-transparent text-info";
      case "contracted":
        return "from-success/30 via-success/10 to-transparent text-success";
      case "in-progress":
        return "from-warning/30 via-warning/10 to-transparent text-warning";
      case "closed":
        return "from-accent-secondary/30 via-accent-secondary/10 to-transparent text-accent-secondary";
      default:
        return "from-content-tertiary/30 via-content-tertiary/10 to-transparent text-content-secondary";
    }
  };

  return (
    <div
      className={`mb-3 flex items-center justify-between rounded-xl bg-gradient-to-r px-3 py-2 text-xs font-semibold tracking-[0.16em] ${getStatusLabelColor(status)}`}
    >
      <h3>{status.toUpperCase()}</h3>
      <span className="rounded-full bg-surface/60 px-2 py-0.5 text-[11px] text-content">
        {columnDeals.length}
      </span>
    </div>
  );
};