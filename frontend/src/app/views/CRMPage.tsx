import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { AnimatePresence, motion } from "framer-motion";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ConfirmDialog } from "../../features/leads/components/ConfirmDialog";
import { useCentralizedLeads } from "../../features/leads/hooks/useCentralizedLeads";
import { leadService } from "../../features/leads/services/leadService";
import { usePipelineViewPreferences } from "../../features/settings/hooks/usePipelineViewPreferences";
import { FullscreenToggleButton } from "../../components/ui/FullscreenToggleButton";
import { PageBackground } from "../../components/ui/PageBackground";
import { ResponsivePageLayout } from "../../components/ui/ResponsivePageLayout";
import { PaginatedTableToolbar } from "../../components/ui/PaginatedTableToolbar";
import { usePaginatedFilterSort } from "../../hooks/usePaginatedFilterSort";
import { CRMAnalysisPage } from "./CRMAnalysisPage";
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
import { ManageLeadsCsvMappingPanel } from "../../features/leads/components/ManageLeadsCsvMappingPanel";
import { guessMapping } from "../../features/leads/constants/manageLeads";
import type { CSVImportResult } from "../../features/leads/types/manageLead";
import type {
  CRMStage,
  Deal,
  NewDealDraft,
} from "../../features/crm/types/crm";

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
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState<"table" | "kanban" | "analysis">("table");
  const {
    leads: centralizedLeads,
    loading,
    refresh,
    hasMoreLeads,
    loadingMoreLeads,
    loadMoreLeads,
  } = useCentralizedLeads({ pageSize: 120 });
  const { crmStatusLabelMap, preferredExportFields } = usePipelineViewPreferences();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDealIds, setSelectedDealIds] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Modal states
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [modalPosition, setModalPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isModalHover, setIsModalHover] = useState(false);
  const isModalHoverRef = useRef(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [disableDetailsPopup, setDisableDetailsPopup] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editDraft, setEditDraft] = useState<NewDealDraft | null>(null);
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [newDeal, setNewDeal] = useState<NewDealDraft>({ ...INITIAL_NEW_DEAL });
  const [kanbanSearch, setKanbanSearch] = useState("");

  // CSV upload state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvMapping, setCsvMapping] = useState<Record<string, string>>({});
  const [csvResult, setCsvResult] = useState<CSVImportResult | null>(null);

  const {
    query: tableQuery,
    setQuery: setTableQuery,
    sort: tableSort,
    setSort: setTableSort,
    currentPage: tablePage,
    setCurrentPage: setTablePage,
    totalPages: tableTotalPages,
    totalItems: tableTotalItems,
    paginatedItems: paginatedDeals,
    hasNextPage: tableHasNextPage,
    hasPrevPage: tableHasPrevPage,
    goToNextPage: goToTableNextPage,
    goToPrevPage: goToTablePrevPage,
    goToPage: goToTablePage,
  } = usePaginatedFilterSort<Deal>({
    items: deals,
    pageSize: 20,
    defaultSort: "time_desc",
    searchFn: (deal, q) =>
      deal.name.toLowerCase().includes(q) ||
      deal.company.toLowerCase().includes(q) ||
      (deal.email?.toLowerCase().includes(q) ?? false) ||
      (deal.phone?.toLowerCase().includes(q) ?? false),
    getTime: (deal) =>
      new Date(deal.lastAction && deal.lastAction !== "No recent activity"
        ? deal.lastAction
        : 0
      ).getTime() || 0,
    getAlphabet: (deal) => deal.name.toLowerCase(),
  });

  const kanbanFilteredDeals = useMemo(() => {
    const q = kanbanSearch.trim().toLowerCase();
    if (!q) return deals;
    return deals.filter(
      (deal) =>
        deal.name.toLowerCase().includes(q) ||
        deal.company.toLowerCase().includes(q),
    );
  }, [deals, kanbanSearch]);

  const NEXT_DEAL_STATUS: Record<DealStatus, DealStatus | null> = {
    negotiation: "contracted",
    contracted: "in-progress",
    "in-progress": "closed",
    closed: null,
  };

  useEffect(() => {
    const nextDeals = centralizedLeads
      .filter((lead) => CRM_STAGES.includes(lead.stage as CRMStage))
      .map((lead) => {
        const updatedAt = new Date(
          lead.updated_at || lead.created_at || Date.now(),
        );
        const daysInStage = Math.max(
          0,
          Math.floor(
            (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24),
          ),
        );

        return {
          id: lead.id,
          name: lead.name,
          company: lead.company,
          status: STAGE_TO_STATUS[lead.stage as CRMStage],
          score: lead.score,
          lastAction: lead.last_activity_at
            ? new Date(lead.last_activity_at).toLocaleDateString()
            : "No recent activity",
          daysInStage,
          value: formatCurrency(lead.budget_estimate),
          email: lead.email,
          phone: lead.phone,
          category: lead.category,
          rating: lead.rating,
          review_count: lead.review_count,
          address: lead.address,
          website_url: lead.website_url,
          google_maps_url: lead.google_maps_url,
          notes: lead.notes,
        } satisfies Deal;
      });

    setDeals(nextDeals);
  }, [centralizedLeads]);

  useEffect(() => {
    setSelectedDealIds((prev) =>
      prev.filter((id) => deals.some((deal) => deal.id === id)),
    );
  }, [deals]);

  // Open deal from global search
  useEffect(() => {
    const dealId = location.state?.selectedDealId;
    if (dealId && typeof dealId === "string") {
      setSelectedDealId(dealId);
      setDetailsOpen(true);
      navigate(".", { replace: true, state: {} });
    }
  }, []);

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
    await refresh();
    setSelectedDealIds((prev) => prev.filter((id) => id !== dealId));
    setConfirmDeleteId(null);
    setFeedback("Deal deleted and moved to recycle bin");
  };

  const toggleSelectDeal = (dealId: string) => {
    setSelectedDealIds((prev) =>
      prev.includes(dealId)
        ? prev.filter((id) => id !== dealId)
        : [...prev, dealId],
    );
  };

  const toggleSelectAllDeals = () => {
    setSelectedDealIds((prev) => {
      const allSelected =
        deals.length > 0 && deals.every((deal) => prev.includes(deal.id));
      if (allSelected) return [];
      return deals.map((deal) => deal.id);
    });
  };

  const handleBulkDeleteDeals = async () => {
    if (selectedDealIds.length === 0) return;

    await leadService.bulkManageLeadAction({
      lead_ids: selectedDealIds,
      action: "SOFT_DELETE",
    });
    await refresh();
    setSelectedDealIds([]);
    setFeedback(
      `${selectedDealIds.length} deal(s) deleted and moved to recycle bin`,
    );
    setConfirmBulkDeleteOpen(false);
  };

  const handleExportSelectedDealsCsv = () => {
    if (selectedDealIds.length === 0) return;

    const selectedDeals = deals.filter((deal) =>
      selectedDealIds.includes(deal.id),
    );
    if (selectedDeals.length === 0) return;

    const escapeCsv = (value: unknown) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const fieldDefinitions: Record<string, { header: string; getValue: (deal: Deal) => unknown }> = {
      name: { header: "Name", getValue: (deal) => deal.name },
      company: { header: "Company", getValue: (deal) => deal.company },
      stage: {
        header: "Stage",
        getValue: (deal) => crmStatusLabelMap[deal.status] ?? deal.status,
      },
      status: {
        header: "Status",
        getValue: (deal) => crmStatusLabelMap[deal.status] ?? deal.status,
      },
      score: { header: "Score", getValue: (deal) => deal.score },
      last_action: { header: "Last Action", getValue: (deal) => deal.lastAction },
      value: { header: "Deal Value", getValue: (deal) => deal.value },
      budget_estimate: { header: "Deal Value", getValue: (deal) => deal.value },
      email: { header: "Email", getValue: (deal) => deal.email },
      phone: { header: "Phone", getValue: (deal) => deal.phone },
      category: { header: "Category", getValue: (deal) => deal.category },
      rating: { header: "Rating", getValue: (deal) => deal.rating },
      review_count: { header: "Review Count", getValue: (deal) => deal.review_count },
      address: { header: "Address", getValue: (deal) => deal.address },
      website_url: { header: "Website URL", getValue: (deal) => deal.website_url },
      google_maps_url: {
        header: "Google Maps URL",
        getValue: (deal) => deal.google_maps_url,
      },
      notes: { header: "Notes", getValue: (deal) => deal.notes },
    };

    const fallbackFields = [
      "name",
      "company",
      "stage",
      "score",
      "value",
      "email",
      "phone",
      "notes",
    ];
    const selectedFields =
      preferredExportFields.length > 0 ? preferredExportFields : fallbackFields;
    const activeFields = selectedFields
      .map((field) => fieldDefinitions[field])
      .filter(Boolean);

    if (activeFields.length === 0) {
      return;
    }

    const headers = activeFields.map((field) => field.header);
    const rows = selectedDeals.map((deal) =>
      activeFields.map((field) => field.getValue(deal)),
    );

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `crm-selected-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);

    setFeedback(`Exported ${selectedDeals.length} selected deal(s) to CSV`);
  };

  useEffect(() => {
    if (!editOpen || !activeDeal) return;
    setEditDraft({
      name: activeDeal.name,
      company: activeDeal.company,
      status: activeDeal.status,
      score: activeDeal.score,
      lastAction: activeDeal.lastAction,
      daysInStage: activeDeal.daysInStage,
      value: activeDeal.value,
      email: activeDeal.email ?? null,
      phone: activeDeal.phone ?? null,
      category: activeDeal.category ?? null,
      rating: activeDeal.rating ?? null,
      review_count: activeDeal.review_count ?? null,
      address: activeDeal.address ?? null,
      website_url: activeDeal.website_url ?? null,
      google_maps_url: activeDeal.google_maps_url ?? null,
      notes: activeDeal.notes ?? null,
    });
  }, [editOpen, activeDeal]);

  const handleSaveEdit = async () => {
    if (!selectedDealId || !editDraft) return;

    await leadService.updateManageLead(selectedDealId, {
      name: editDraft.name,
      company: editDraft.company,
      email: editDraft.email || undefined,
      phone: editDraft.phone || undefined,
      stage: STATUS_TO_STAGE[editDraft.status],
      score: editDraft.score,
      budget_estimate: parseCurrency(editDraft.value),
      notes: editDraft.notes || undefined,
      category: editDraft.category ?? null,
      rating: editDraft.rating ?? null,
      review_count: editDraft.review_count ?? null,
      address: editDraft.address ?? null,
      website_url: editDraft.website_url ?? null,
      google_maps_url: editDraft.google_maps_url ?? null,
    });

    setDeals((current) =>
      current.map((deal) =>
        deal.id === selectedDealId ? { ...deal, ...editDraft } : deal,
      ),
    );

    setEditOpen(false);
    setEditDraft(null);
    setConfirmEditOpen(false);
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

  const handleDealSendMessage = () => {
    if (!activeDeal) return;
    if (!activeDeal.email) {
      setFeedback("No email available for this deal.");
      return;
    }

    navigate("/messages", {
      state: {
        fromPipeline: true,
        leadId: activeDeal.id,
        tone: "professional",
        subject: `Regarding ${activeDeal.company} - Partnership Opportunity`,
        customContext: `Status: ${activeDeal.status}. Score: ${activeDeal.score}. Last action: ${activeDeal.lastAction}. Deal value: ${activeDeal.value}.`,
      },
    });
    setFeedback(`Redirected to Messages for ${activeDeal.name}`);
  };

  const handleDealScheduleCall = () => {
    if (!activeDeal) return;
    if (!activeDeal.phone) {
      setFeedback("No phone number available for this deal.");
      return;
    }

    window.open(`tel:${activeDeal.phone}`, "_blank", "noopener,noreferrer");
    setFeedback(`Initiated call action for ${activeDeal.phone}`);
  };

  const handleDealMoveNext = async () => {
    if (!activeDeal) return;
    const nextStatus = NEXT_DEAL_STATUS[activeDeal.status];
    if (!nextStatus) {
      setFeedback("Deal is already in the final stage.");
      return;
    }

    await updateStatus(activeDeal.id, nextStatus);
    setFeedback(`Moved ${activeDeal.name} to ${nextStatus}`);
  };

  const handleDealNotesUpdate = async (notes: string) => {
    if (!activeDeal) return;

    await leadService.updateManageLead(activeDeal.id, { notes });
    setDeals((current) =>
      current.map((deal) =>
        deal.id === activeDeal.id ? { ...deal, notes } : deal,
      ),
    );
    setFeedback("Deal notes updated");
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
      score: newDeal.score,
    });

    await refresh();
    setNewDeal({ ...INITIAL_NEW_DEAL });
    setIsAdding(false);
  };

  const handleFilePick = async (file: File) => {
    setCsvFile(file);
    const text = await file.text();
    const [headerLine = ""] = text.split(/\r?\n/);
    const headers = headerLine.split(",").map((item) => item.trim()).filter(Boolean);
    setCsvHeaders(headers);
    const initial: Record<string, string> = {};
    headers.forEach((header) => {
      initial[header] = guessMapping(header);
    });
    setCsvMapping(initial);
    setCsvResult(null);
  };

  const importCsv = async () => {
    if (!csvFile) return;
    const result = await leadService.importManageLeadCSV(csvFile, csvMapping, "NEGOTIATION");
    setCsvResult(result);
    await refresh();
    if (result.accepted > 0) {
      setFeedback(`Imported ${result.accepted} deal(s) from CSV into NEGOTIATION stage`);
      setCsvFile(null);
      setCsvHeaders([]);
      setCsvMapping({});
    }
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
    <>
      <PageBackground image={bgConnecting} tint="rgba(109, 111, 252, 0.70)" />
      <ResponsivePageLayout contentClassName="space-y-4">
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
            {/* <div className="hidden items-center gap-2 rounded-full border border-accent/10 bg-surface-secondary/80 px-3 py-1.5 text-[11px]   backdrop-blur-glass md:flex">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-success" />
              Realtime scoring
            </div> */}
            <FullscreenToggleButton />
            <button
              onClick={() => setDisableDetailsPopup((v) => !v)}
              className={`glass-btn text-xs ${disableDetailsPopup ? "text-danger" : "text-success"}`}
              title={
                disableDetailsPopup
                  ? "Click to enable details popup"
                  : "Click to disable details popup"
              }
            >
              {disableDetailsPopup ? "🚫 Popups Off" : "✓ Popups On"}
            </button>
            <label className="glass-btn cursor-pointer group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium">

              Upload CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void handleFilePick(file);
                  }
                  event.target.value = "";
                }}
              />
            </label>
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

        {csvFile && csvHeaders.length > 0 ? (
          <ManageLeadsCsvMappingPanel
            fileName={csvFile.name}
            csvHeaders={csvHeaders}
            csvMapping={csvMapping}
            csvResult={csvResult}
            onMappingChange={(header, field) => {
              setCsvMapping((previous) => ({ ...previous, [header]: field }));
            }}
            onImport={() => {
              void importCsv();
            }}
            onCancel={() => {
              setCsvFile(null);
              setCsvHeaders([]);
              setCsvMapping({});
              setCsvResult(null);
            }}
          />
        ) : null}

        <CRMStatsGrid
          deals={deals}
          totalValue={totalValue}
          closedValue={closedValue}
        />

        {/* view toggle */}
        <div className="flex items-center justify-between gap-2">
          <div className="glass-card-sm  gap-1 inline-flex p-1 text-[11px]">
            {(["table", "kanban", "analysis"] as const).map((option) => (
              <button
                key={option}
                onClick={() => setView(option)}
                className={`relative rounded-full px-4 py-1.5 uppercase tracking-[0.18em] transition-all duration-200 ${
                  view === option
                    ? "bg-gradient-to-r from-accent to-accent-secondary text-content-inverse shadow-glow"
                    : "text-content hover:text-content-secondary"
                } ${option === "analysis" ? "relative p-4 animate-pulseGlow  " : ""} `}
              >
                {option}
              </button>
            ))}
          </div>
          <p className="hidden text-[11px]   md:block">
            {view === "analysis"
              ? "Analyze pipeline trends, AI recommendations, and close probability in one place."
              : "Drag deals between stages in Kanban view to instantly update status."}
          </p>
        </div>

        {feedback ? (
          <div className="rounded-glass-sm border border-success/30 bg-success-soft px-3 py-2 text-sm text-success">
            {feedback}
          </div>
        ) : null}

        {/* main content */}
        {loading ? (
          <div className="glass-card p-8 text-center text-content-secondary">
            Loading CRM deals...
          </div>
        ) : view === "analysis" ? (
          <CRMAnalysisPage deals={deals} />
        ) : view === "table" ? (
          <>
            <div className="glass-card-sm flex flex-wrap items-center gap-2 px-3 py-2">
              <span className="text-xs text-content-secondary">
                {selectedDealIds.length} selected
              </span>
              <button
                type="button"
                onClick={() => {
                  setConfirmBulkDeleteOpen(true);
                }}
                disabled={selectedDealIds.length === 0}
                className="rounded-glass-sm border border-danger/30 bg-danger-soft px-2.5 py-1 text-[11px] text-danger disabled:cursor-not-allowed disabled:opacity-50"
              >
                Delete Selected
              </button>
              <button
                type="button"
                onClick={handleExportSelectedDealsCsv}
                disabled={selectedDealIds.length === 0}
                className="glass-btn px-2.5 py-1 text-[11px] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Export Selected CSV
              </button>
            </div>

            <PaginatedTableToolbar
              query={tableQuery}
              onQueryChange={(value) => {
                setTableQuery(value);
                setTablePage(1);
              }}
              sort={tableSort}
              onSortChange={setTableSort}
              currentPage={tablePage}
              totalPages={tableTotalPages}
              totalItems={tableTotalItems}
              onPrevPage={goToTablePrevPage}
              onNextPage={goToTableNextPage}
              onPageChange={goToTablePage}
              placeholder="Search deals by name, company, email or phone..."
              className="px-1"
            />

            <CRMTableView
              deals={paginatedDeals}
              selectedDealIds={selectedDealIds}
              statusLabels={crmStatusLabelMap}
              onToggleSelectDeal={toggleSelectDeal}
              onToggleSelectAllDeals={toggleSelectAllDeals}
              onUpdateStatus={(dealId, status) => {
                void updateStatus(dealId, status);
              }}
              onOpenDetails={openDetails}
              onOpenEdit={openEdit}
              onDeleteRequest={setConfirmDeleteId}
            />
          </>
        ) : (
          <>
            <div className="glass-card-sm flex items-center gap-3 px-3 py-2">
              <input
                type="text"
                value={kanbanSearch}
                onChange={(e) => setKanbanSearch(e.target.value)}
                placeholder="Search deals in kanban..."
                className="glass-input flex-1 min-w-[200px] text-sm"
              />
              <span className="text-xs text-content-secondary">
                {kanbanFilteredDeals.length} deals
              </span>
            </div>
            <DndContext
              onDragStart={() => setIsDragging(true)}
              onDragCancel={() => setIsDragging(false)}
              onDragEnd={(event) => {
                void handleDragEnd(event);
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {STATUS_COLUMNS.map((status) => {
                  const columnDeals = kanbanFilteredDeals.filter(
                    (deal) => deal.status === status,
                  );

                return (
                  <DroppableStatusColumn
                    key={status}
                    status={status}
                    columnDeals={columnDeals}
                    statusLabels={crmStatusLabelMap}
                  >
                    <SortableContext
                      items={columnDeals.map((d) => d.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex-1 space-y-2 overflow-hidden">
                        {columnDeals.length === 0 && (
                          <div className="flex h-28 items-center justify-center rounded-glass-sm border border-dashed border-accent/15 bg-surface-secondary/50 text-[11px] text-content-secondary">
                            Drop deals here to move into{" "}
                            <span className="ml-1 font-semibold">{status}</span>
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
        </>
        )}

        <DealModal
          key={hoveredId || selectedDealId || "closed"}
          deal={activeDeal}
          open={
            view === "kanban"
              ? Boolean(hoveredId && activeDeal && !isDragging)
              : Boolean(detailsOpen && activeDeal)
          }
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
          onSendMessage={handleDealSendMessage}
          onScheduleCall={handleDealScheduleCall}
          onMoveNext={() => {
            void handleDealMoveNext();
          }}
          onNotesUpdate={(notes) => {
            void handleDealNotesUpdate(notes);
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
                  setConfirmEditOpen(true);
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-content">
                  Edit Deal
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-xs text-content-secondary">
                    Name
                    <input
                      value={editDraft?.name ?? ""}
                      onChange={(event) =>
                        setEditDraft((prev) =>
                          prev ? { ...prev, name: event.target.value } : prev,
                        )
                      }
                      className="glass-input mt-1"
                    />
                  </label>
                  <label className="text-xs text-content-secondary">
                    Company
                    <input
                      value={editDraft?.company ?? ""}
                      onChange={(event) =>
                        setEditDraft((prev) =>
                          prev
                            ? { ...prev, company: event.target.value }
                            : prev,
                        )
                      }
                      className="glass-input mt-1"
                    />
                  </label>
                  <label className="text-xs text-content-secondary">
                    Email
                    <input
                      value={editDraft?.email ?? ""}
                      onChange={(event) =>
                        setEditDraft((prev) =>
                          prev
                            ? { ...prev, email: event.target.value || null }
                            : prev,
                        )
                      }
                      className="glass-input mt-1"
                    />
                  </label>
                  <label className="text-xs text-content-secondary">
                    Phone
                    <input
                      value={editDraft?.phone ?? ""}
                      onChange={(event) =>
                        setEditDraft((prev) =>
                          prev
                            ? { ...prev, phone: event.target.value || null }
                            : prev,
                        )
                      }
                      className="glass-input mt-1"
                    />
                  </label>
                  <label className="text-xs text-content-secondary">
                    Status
                    <select
                      value={editDraft?.status ?? "negotiation"}
                      onChange={(event) =>
                        setEditDraft((prev) =>
                          prev
                            ? {
                                ...prev,
                                status: event.target.value as DealStatus,
                              }
                            : prev,
                        )
                      }
                      className="glass-input mt-1"
                    >
                      <option
                        value="negotiation"
                        className="bg-surface-tertiary"
                      >
                        negotiation
                      </option>
                      <option
                        value="contracted"
                        className="bg-surface-tertiary"
                      >
                        contracted
                      </option>
                      <option
                        value="in-progress"
                        className="bg-surface-tertiary"
                      >
                        in-progress
                      </option>
                      <option value="closed" className="bg-surface-tertiary">
                        closed
                      </option>
                    </select>
                  </label>
                  <label className="text-xs text-content-secondary">
                    Score
                    <input
                      type="number"
                      value={editDraft?.score ?? 0}
                      onChange={(event) =>
                        setEditDraft((prev) =>
                          prev
                            ? {
                                ...prev,
                                score: Number(event.target.value) || 0,
                              }
                            : prev,
                        )
                      }
                      className="glass-input mt-1"
                    />
                  </label>
                  <label className="text-xs text-content-secondary">
                    Deal Value
                    <input
                      value={editDraft?.value ?? "$0"}
                      onChange={(event) =>
                        setEditDraft((prev) =>
                          prev ? { ...prev, value: event.target.value } : prev,
                        )
                      }
                      className="glass-input mt-1"
                    />
                  </label>
                  <label className="text-xs text-content-secondary">
                    Category
                    <input
                      value={editDraft?.category ?? ""}
                      onChange={(event) =>
                        setEditDraft((prev) =>
                          prev
                            ? { ...prev, category: event.target.value || null }
                            : prev,
                        )
                      }
                      className="glass-input mt-1"
                    />
                  </label>
                  <label className="text-xs text-content-secondary">
                    Rating
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={editDraft?.rating ?? ""}
                      onChange={(event) =>
                        setEditDraft((prev) =>
                          prev
                            ? {
                                ...prev,
                                rating: event.target.value
                                  ? Number(event.target.value)
                                  : null,
                              }
                            : prev,
                        )
                      }
                      className="glass-input mt-1"
                    />
                  </label>
                  <label className="text-xs text-content-secondary">
                    Review Count
                    <input
                      type="number"
                      value={editDraft?.review_count ?? ""}
                      onChange={(event) =>
                        setEditDraft((prev) =>
                          prev
                            ? {
                                ...prev,
                                review_count: event.target.value
                                  ? Number(event.target.value)
                                  : null,
                              }
                            : prev,
                        )
                      }
                      className="glass-input mt-1"
                    />
                  </label>
                  <label className="text-xs text-content-secondary md:col-span-2">
                    Address
                    <input
                      value={editDraft?.address ?? ""}
                      onChange={(event) =>
                        setEditDraft((prev) =>
                          prev
                            ? { ...prev, address: event.target.value || null }
                            : prev,
                        )
                      }
                      className="glass-input mt-1"
                    />
                  </label>
                  <label className="text-xs text-content-secondary md:col-span-2">
                    Website URL
                    <input
                      value={editDraft?.website_url ?? ""}
                      onChange={(event) =>
                        setEditDraft((prev) =>
                          prev
                            ? {
                                ...prev,
                                website_url: event.target.value || null,
                              }
                            : prev,
                        )
                      }
                      className="glass-input mt-1"
                    />
                  </label>
                  <label className="text-xs text-content-secondary md:col-span-2">
                    Google Maps URL
                    <input
                      value={editDraft?.google_maps_url ?? ""}
                      onChange={(event) =>
                        setEditDraft((prev) =>
                          prev
                            ? {
                                ...prev,
                                google_maps_url: event.target.value || null,
                              }
                            : prev,
                        )
                      }
                      className="glass-input mt-1"
                    />
                  </label>
                  <label className="text-xs text-content-secondary md:col-span-2">
                    Notes
                    <textarea
                      rows={4}
                      value={editDraft?.notes ?? ""}
                      onChange={(event) =>
                        setEditDraft((prev) =>
                          prev
                            ? { ...prev, notes: event.target.value || null }
                            : prev,
                        )
                      }
                      className="glass-input mt-1"
                    />
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    className="glass-btn px-3 py-1.5 text-xs"
                    onClick={() => {
                      setEditOpen(false);
                      setEditDraft(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="accent-btn px-3 py-1.5 text-xs font-semibold"
                  >
                    Update Deal
                  </button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>

        <ConfirmDialog
          open={confirmEditOpen}
          title="Confirm Deal Update"
          description="Are you sure you want to update this deal?"
          confirmLabel="Update Deal"
          onCancel={() => setConfirmEditOpen(false)}
          onConfirm={() => {
            void handleSaveEdit();
          }}
        />

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

        <ConfirmDialog
          open={confirmBulkDeleteOpen}
          title="Delete Selected Deals"
          description={`Delete ${selectedDealIds.length} selected deal(s)? They will be moved to the recycle bin.`}
          confirmLabel="Delete Selected"
          danger
          onCancel={() => setConfirmBulkDeleteOpen(false)}
          onConfirm={() => {
            void handleBulkDeleteDeals();
          }}
        />

        {hasMoreLeads ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                void loadMoreLeads();
              }}
              disabled={loadingMoreLeads}
              className="glass-btn px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingMoreLeads ? "Loading more deals..." : "Load More Deals"}
            </button>
          </div>
        ) : null}

        {/* simple keyframes for table rows */}
        <style>{`
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
    </>
  );
};
