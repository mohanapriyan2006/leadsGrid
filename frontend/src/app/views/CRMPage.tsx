import { useEffect, useMemo, useState, useRef } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ConfirmDialog } from "../../features/leads/components/ConfirmDialog";
import { useCentralizedLeads } from "../../features/leads/hooks/useCentralizedLeads";
import { leadService } from "../../features/leads/services/leadService";
import { FullscreenToggleButton } from "../../components/ui/FullscreenToggleButton";
import { PageBackground } from "../../components/ui/PageBackground";
import { ResponsivePageLayout } from "../../components/ui/ResponsivePageLayout";
import bgConnecting from "../../assets/bg-images/connecting-teams.svg";
import type { DealStatus } from "../../features/common/types/ui";
import { AddDealForm } from "../../features/crm/components/AddDealForm";
import { CRMStatsGrid } from "../../features/crm/components/CRMStatsGrid";
import { CRMTableView } from "../../features/crm/components/CRMTableView";
import { DealModal } from "../../features/crm/components/DealModal";
import { KanbanCard } from "../../features/crm/components/KanbanCard";
import { DroppableStatusColumn } from "../../features/crm/components/StatusColumn";
import {
  CRM_STAGES,
  STATUS_COLUMNS,
  STATUS_TO_STAGE,
  STAGE_TO_STATUS,
  formatCurrency,
  parseCurrency,
} from "../../features/crm/constants/crm";
import type { CRMStage, Deal, NewDealDraft } from "../../features/crm/types/crm";

const INITIAL_NEW_DEAL: NewDealDraft = {
  name: "",
  company: "",
  status: "negotiation",
  score: 60,
  lastAction: "",
  daysInStage: 0,
  value: "$0",
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
  const isModalHoverRef = useRef(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [disableDetailsPopup, setDisableDetailsPopup] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [newDeal, setNewDeal] = useState<NewDealDraft>({ ...INITIAL_NEW_DEAL });

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
      if (!isModalHoverRef.current) {
        setHoveredId((current) => (current === dealId ? null : current));
      }
    }, 120);
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

  const handleSaveEdit = async (updated: NewDealDraft) => {
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

    if (STATUS_COLUMNS.includes(overId as DealStatus)) {
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

    setNewDeal({ ...INITIAL_NEW_DEAL });
    setIsAdding(false);
  };

  const handleNewDealChange = (
    field: keyof NewDealDraft,
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

  return (
    <ResponsivePageLayout
      backgroundImage={bgConnecting}
      tint="rgba(109, 111, 252, 0.70)"
      opacity={0.84}
      contentClassName="space-y-4"
    >
        <PageBackground image={bgConnecting} tint="rgba(109, 111, 252, 0.76)" opacity={0.88} />
        <header className="glass-card-lg flex flex-col justify-between gap-3 px-4 py-4 sm:px-5 sm:py-5 md:flex-row md:items-center md:px-6">
          <div>
            <h2 className="bg-gradient-to-r from-content via-accent to-accent-secondary bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl">
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
            <FullscreenToggleButton />
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

        {isAdding && (
          <AddDealForm
            draft={newDeal}
            onChange={handleNewDealChange}
            onSubmit={() => {
              void handleAddDeal();
            }}
            onCancel={() => setIsAdding(false)}
          />
        )}

        <CRMStatsGrid deals={deals} totalValue={totalValue} closedValue={closedValue} />

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
          <CRMTableView
            deals={deals}
            onUpdateStatus={(dealId, status) => {
              void updateStatus(dealId, status);
            }}
            onOpenDetails={openDetails}
            onOpenEdit={openEdit}
            onDeleteRequest={setConfirmDeleteId}
          />
        ) : (
          <DndContext
            onDragStart={() => setIsDragging(true)}
            onDragCancel={() => setIsDragging(false)}
            onDragEnd={(event) => {
              void handleDragEnd(event);
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {STATUS_COLUMNS.map((status) => {
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
            isModalHoverRef.current = false;
          }}
          onMouseEnter={() => {
            setIsModalHover(true);
            isModalHoverRef.current = true;
          }}
          onMouseLeave={() => {
            setIsModalHover(false);
            isModalHoverRef.current = false;
            if (activeDeal) {
              handleHoverEnd(activeDeal.id);
            }
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
              className="fixed inset-0 z-[110] flex items-center justify-center bg-surface/80 px-4 py-6 backdrop-blur-sm sm:py-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditOpen(false)}
            >
              <motion.form
                className="glass-card-lg w-full max-w-xl max-h-[90dvh] space-y-3 overflow-y-auto p-4 sm:p-5"
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
    </ResponsivePageLayout>
  );
};