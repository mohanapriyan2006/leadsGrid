import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { ScoreBadge } from "../../components/ui/ScoreBadge";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { MOCK_DEALS } from "../../features/crm/constants/mockDeals";
import { ConfirmDialog } from "../../features/leads/components/ConfirmDialog";
import type { DealStatus } from "../../features/common/types/ui";

type Deal = (typeof MOCK_DEALS)[number];

type DealModalProps = {
  deal: Deal | null;
  open: boolean;
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
  position,
  onClose,
  onDelete,
  onEdit,
  onMouseEnter,
  onMouseLeave,
}: DealModalProps) => {
  if (!deal) return null;

  const hoverStyle = position
    ? { left: Math.min(position.x + 16, window.innerWidth - 340), top: Math.min(position.y, window.innerHeight - 300) }
    : { right: 24, top: 96 };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed z-[90]"
          style={hoverStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.section
            className="w-full max-w-sm rounded-glass border border-accent/10 bg-surface-tertiary/95 p-4 shadow-glass-lg"
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.985 }}
            transition={{ duration: 0.16 }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-content">{deal.name}</h3>
                <p className="text-sm text-content-secondary">{deal.company}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="glass-btn px-2 py-1 text-xs"
              >
                Close
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="badge-info">Score {deal.score}</span>
              <span className="glass-btn px-2 py-1 text-xs">Status {deal.status}</span>
              <span className="badge-success">Value {deal.value}</span>
            </div>

            <div className="mt-3 text-xs text-content-secondary">
              <p>Last Action: {deal.lastAction}</p>
              <p>Days in Stage: {deal.daysInStage}</p>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {onEdit ? (
                <button
                  type="button"
                  onClick={onEdit}
                  className="glass-btn px-3 py-1.5 text-xs"
                >
                  Edit
                </button>
              ) : null}
              <button
                type="button"
                onClick={onDelete}
                className="rounded border border-danger/30 bg-danger-soft px-3 py-1.5 text-xs text-danger transition hover:bg-danger/20"
              >
                Delete
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
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
  const [isAdding, setIsAdding] = useState(false);
  
  // Modal states
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [modalPosition, setModalPosition] = useState<{ x: number; y: number } | null>(null);
  const [isModalHover, setIsModalHover] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
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

  const handleDelete = (dealId: string) => {
    setDeals((prev) => prev.filter((d) => d.id !== dealId));
    setConfirmDeleteId(null);
    setFeedback("Deal deleted and moved to recycle bin");
  };

  const handleSaveEdit = (updated: Omit<Deal, "id">) => {
    if (!selectedDealId) return;
    if (!window.confirm("Are you sure you want to update this deal?")) return;
    setDeals((prev) =>
      prev.map((deal) =>
        deal.id === selectedDealId
          ? { ...deal, ...updated, id: deal.id }
          : deal
      )
    );
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

  const updateStatus = (id: string, status: DealStatus) => {
    setDeals((current) =>
      current.map((deal) => (deal.id === id ? { ...deal, status } : deal)),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    setDeals((prev) => {
      const statuses: DealStatus[] = ["negotiation", "contracted", "in-progress", "closed"];
      const activeIndex = prev.findIndex((deal) => deal.id === activeId);
      if (activeIndex === -1) return prev;

      const activeDeal = prev[activeIndex];

      if (statuses.includes(overId as DealStatus)) {
        const targetStatus = overId as DealStatus;
        return prev.map((deal) =>
          deal.id === activeId ? { ...deal, status: targetStatus } : deal,
        );
      }

      const overIndex = prev.findIndex((deal) => deal.id === overId);
      if (overIndex === -1) return prev;
      const overDeal = prev[overIndex];

      if (activeDeal.status === overDeal.status) {
        return arrayMove(prev, activeIndex, overIndex);
      }

      const next = [...prev];
      const [moved] = next.splice(activeIndex, 1);
      const targetIndex = next.findIndex((deal) => deal.id === overId);
      const updatedMoved = { ...moved, status: overDeal.status };
      if (targetIndex === -1) {
        next.push(updatedMoved);
      } else {
        next.splice(targetIndex, 0, updatedMoved);
      }
      return next;
    });
  };

  const handleAddDeal = () => {
    if (!newDeal.name.trim() || !newDeal.company.trim()) return;

    const id = `deal-${Date.now()}`;
    const valueNumber = Number(
      String(newDeal.value).replace(/[$,]/g, "") || "0",
    );
    const formattedValue = `$${valueNumber.toLocaleString()}`;

    setDeals((prev) => [
      {
        id,
        ...newDeal,
        value: formattedValue,
      },
      ...prev,
    ]);

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
        return "from-sky-500/40 via-sky-400/20 to-transparent text-sky-200";
      case "contracted":
        return "from-emerald-500/40 via-emerald-400/20 to-transparent text-emerald-200";
      case "in-progress":
        return "from-amber-500/40 via-amber-400/20 to-transparent text-amber-200";
      case "closed":
        return "from-violet-500/40 via-violet-400/20 to-transparent text-violet-200";
      default:
        return "from-slate-500/40 via-slate-400/20 to-transparent text-slate-200";
    }
  };

  return (
    <div className="relative space-y-5">
      {/* gradient glow backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.35),transparent_55%),radial-gradient(circle_at_bottom,_rgba(45,212,191,0.25),transparent_55%)] opacity-80" />

      <header className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-accent/10 px-4 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.85)] backdrop-blur-xl md:flex-row md:items-center md:px-6">
        <div>
          <h2 className="bg-gradient-to-r from-white via-sky-100 to-emerald-200 bg-clip-text text-3xl font-semibold text-transparent">
            Pipeline CRM
          </h2>
          <p className="mt-1 text-sm text-text-dim">
            Deal intelligence, live pipeline control, and adaptive execution.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[11px] text-text-dim shadow-inner shadow-white/5 md:flex">
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Realtime scoring enabled
          </div>
          <button
            onClick={() => setIsAdding((s) => !s)}
            className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-sky-400 px-3 py-1.5 text-xs font-medium text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:translate-y-0.5 hover:shadow-xl hover:shadow-emerald-400/50 active:translate-y-0"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-950/80 text-[11px] text-emerald-300">
              +
            </span>
            New deal
          </button>
        </div>
      </header>

      {/* add deal form */}
      {isAdding && (
        <div className="animate-in slide-in-from-top-2 fade-in rounded-2xl border border-emerald-500/40 bg-slate-900/80 p-4 shadow-[0_22px_55px_rgba(5,46,22,0.85)] backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-1 flex-wrap gap-3">
              <input
                value={newDeal.name}
                onChange={(e) =>
                  handleNewDealChange("name", e.target.value)
                }
                placeholder="Client name"
                className="min-w-[140px] flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none ring-0 transition focus:border-emerald-400/60 focus:bg-black/70"
              />
              <input
                value={newDeal.company}
                onChange={(e) =>
                  handleNewDealChange("company", e.target.value)
                }
                placeholder="Company"
                className="min-w-[140px] flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none ring-0 transition focus:border-emerald-400/60 focus:bg-black/70"
              />
              <select
                value={newDeal.status}
                onChange={(e) =>
                  handleNewDealChange(
                    "status",
                    e.target.value as DealStatus,
                  )
                }
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-emerald-400/60"
              >
                <option value="contacted">contacted</option>
                <option value="replied">replied</option>
                <option value="negotiation">negotiation</option>
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
                  className="w-20 rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-xs text-white outline-none focus:border-emerald-400/60"
                />
                <ScoreBadge score={newDeal.score} />
              </div>
              <input
                value={newDeal.value}
                onChange={(e) =>
                  handleNewDealChange("value", e.target.value)
                }
                placeholder="$10,000"
                className="w-28 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-emerald-200 outline-none focus:border-emerald-400/60"
              />
              <input
                value={newDeal.lastAction}
                onChange={(e) =>
                  handleNewDealChange("lastAction", e.target.value)
                }
                placeholder="Last touchpoint"
                className="min-w-[160px] flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-emerald-400/60"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddDeal}
                className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400 hover:shadow-emerald-400/60"
              >
                Add to pipeline
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="text-xs text-text-dim hover:text-slate-200"
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
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-slate-900/70 to-black/80 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.9)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-emerald-400/60 hover:shadow-[0_22px_55px_rgba(34,197,94,0.35)]"
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 blur-3xl transition group-hover:opacity-100">
              <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.55),transparent_60%),radial-gradient(circle_at_bottom,_rgba(34,197,94,0.55),transparent_60%)]" />
            </div>
            <p className="text-[11px] tracking-[0.18em] text-text-dim">
              {item.label}
            </p>
            <p
              className="mt-2 text-3xl font-semibold drop-shadow-sm"
              style={{ color: item.color }}
            >
              {item.value}
            </p>
            <p className="mt-1 text-[11px] text-text-dim">{item.sub}</p>
          </article>
        ))}
      </div>

      {/* view toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex rounded-full border border-white/15 bg-black/70 p-1 text-[11px] shadow-lg shadow-black/60 backdrop-blur">
          {(["table", "kanban"] as const).map((option) => (
            <button
              key={option}
              onClick={() => setView(option)}
              className={`relative rounded-full px-4 py-1.5 uppercase tracking-[0.18em] transition ${
                view === option
                  ? "bg-gradient-to-r from-emerald-500/90 to-sky-500/90 text-slate-950 shadow-[0_0_22px_rgba(16,185,129,0.65)]"
                  : "text-text-dim hover:text-slate-100"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <p className="hidden text-[11px] text-text-dim md:block">
          Drag deals between stages in Kanban view to instantly update status.
        </p>
      </div>

      {feedback ? (
        <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100">{feedback}</div>
      ) : null}

      {/* main content */}
      {view === "table" ? (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 shadow-[0_22px_55px_rgba(15,23,42,0.95)] backdrop-blur-xl">
          <div className="grid grid-cols-[2fr_1.5fr_1fr_90px_1fr_220px] border-b border-white/10 bg-gradient-to-r from-white/5 via-slate-900/80 to-white/5 px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-text-dim">
            <span>Client</span>
            <span>Company</span>
            <span>Status</span>
            <span>Score</span>
            <span>Last action</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-white/5">
            {deals.map((deal, index) => (
              <div
                key={deal.id}
                className="grid grid-cols-[2fr_1.5fr_1fr_90px_1fr_220px] items-center px-4 py-3 transition-colors hover:bg-white/5"
                style={{
                  animation: `fadeInUp 0.35s ease-out ${index * 0.03}s both`,
                }}
              >
                <span className="text-sm text-white">{deal.name}</span>
                <span className="text-sm text-text-dim">{deal.company}</span>
                <div className="flex items-center gap-2">
                  <select
                    value={deal.status}
                    onChange={(event) =>
                      updateStatus(
                        deal.id,
                        event.target.value as DealStatus,
                      )
                    }
                    className="rounded border border-white/15 bg-black/40 px-2 py-1 text-xs text-white outline-none transition focus:border-emerald-400/70"
                  >
                    <option value="negotiation">negotiation</option>
                    <option value="contracted">contracted</option>
                    <option value="in-progress">in-progress</option>
                    <option value="closed">closed</option>
                  </select>
                  <StatusBadge status={deal.status} />
                </div>
                <ScoreBadge score={deal.score} />
                <span className="text-sm text-text-dim">
                  {deal.lastAction}
                </span>
                <div className="flex gap-1">
                  <button type="button" className="rounded border border-white/10 px-2 py-1 text-[11px]" onClick={() => openDetails(deal.id)}>Details</button>
                  <button type="button" className="rounded border border-white/10 px-2 py-1 text-[11px]" onClick={() => openEdit(deal.id)}>Edit</button>
                  <button type="button" className="rounded border border-rose-300/35 bg-rose-500/15 px-2 py-1 text-[11px] text-rose-100" onClick={() => setConfirmDeleteId(deal.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <DndContext 
          onDragStart={() => setIsDragging(true)}
          onDragCancel={() => setIsDragging(false)}
          onDragEnd={handleDragEnd}
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
                        <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/30 text-[11px] text-text-dim">
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
        deal={activeDeal}
        open={view === "kanban" ? Boolean(hoveredId && activeDeal && !isDragging) : Boolean(detailsOpen && activeDeal)}
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
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/65 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditOpen(false)}
          >
            <motion.form
              className="w-full max-w-xl space-y-3 rounded-2xl border border-white/10 bg-slate-950/95 p-5"
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
              <h3 className="text-lg font-semibold text-white">Edit Deal</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-xs text-text-dim">
                  Name
                  <input
                    defaultValue={activeDeal.name}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm text-white"
                  />
                </label>
                <label className="text-xs text-text-dim">
                  Company
                  <input
                    defaultValue={activeDeal.company}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm text-white"
                  />
                </label>
                <label className="text-xs text-text-dim">
                  Status
                  <select
                    defaultValue={activeDeal.status}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm text-white"
                  >
                    <option value="negotiation">negotiation</option>
                    <option value="contracted">contracted</option>
                    <option value="in-progress">in-progress</option>
                    <option value="closed">closed</option>
                  </select>
                </label>
                <label className="text-xs text-text-dim">
                  Score
                  <input
                    type="number"
                    defaultValue={activeDeal.score}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm text-white"
                  />
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  className="rounded-lg border border-white/15 bg-black/35 px-3 py-1.5 text-xs text-text-dim"
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950">
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
          handleDelete(confirmDeleteId);
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
      className={`cursor-grab rounded-xl border border-white/15 bg-gradient-to-br from-white/5 via-slate-900/80 to-black/90 p-2.5 text-xs shadow-[0_14px_35px_rgba(15,23,42,0.95)] outline-none transition hover:-translate-y-0.5 hover:border-emerald-400/60 hover:bg-slate-900/90 hover:shadow-[0_20px_50px_rgba(34,197,94,0.35)] active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
      style={{
        ...baseStyle,
        animation: `fadeInUp 0.35s ease-out ${index * 0.04}s both`,
      }}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-sm text-white">{deal.name}</p>
        <ScoreBadge score={deal.score} />
      </div>
      <p className="text-[11px] text-text-dim">{deal.company}</p>
      <p className="mt-1 text-[11px] text-text-dim">{deal.lastAction}</p>
      <p className="mt-1 text-sm font-semibold text-emerald-300">
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
      className={`group flex flex-col rounded-2xl border border-white/10 bg-slate-950/80 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.9)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-emerald-400/60 hover:shadow-[0_22px_55px_rgba(34,197,94,0.35)] ${isOver ? "border-cyan-300/70 ring-1 ring-cyan-300/40" : ""}`}
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
        return "from-sky-500/40 via-sky-400/20 to-transparent text-sky-200";
      case "contracted":
        return "from-emerald-500/40 via-emerald-400/20 to-transparent text-emerald-200";
      case "in-progress":
        return "from-amber-500/40 via-amber-400/20 to-transparent text-amber-200";
      case "closed":
        return "from-violet-500/40 via-violet-400/20 to-transparent text-violet-200";
      default:
        return "from-slate-500/40 via-slate-400/20 to-transparent text-slate-200";
    }
  };

  return (
    <div
      className={`mb-3 flex items-center justify-between rounded-xl bg-gradient-to-r px-3 py-2 text-xs font-semibold tracking-[0.16em] ${getStatusLabelColor(status)}`}
    >
      <h3>{status.toUpperCase()}</h3>
      <span className="rounded-full bg-black/40 px-2 py-0.5 text-[11px] text-slate-100">
        {columnDeals.length}
      </span>
    </div>
  );
};