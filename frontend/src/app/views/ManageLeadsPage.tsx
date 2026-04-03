import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { DndContext, type DragEndEvent, useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { ConfirmDialog } from "../../features/leads/components/ConfirmDialog";
import { EditLeadModal } from "../../features/leads/components/EditLeadModal";
import { LeadModal } from "../../features/leads/components/LeadModal";
import { leadService } from "../../features/leads/services/leadService";
import { useCentralizedLeads } from "../../features/leads/hooks/useCentralizedLeads";
import type {
  CSVImportResult,
  ManageLead,
  ManageLeadActionType,
  ManageLeadInsights,
  ManageLeadStage,
  ManageLeadView,
} from "../../features/leads/types/manageLead";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useLeadStore } from "../../store/useLeadStore";
import { PageBackground } from "../../components/ui/PageBackground";
import bgTeamCollab from "../../assets/bg-images/team-collaboration.svg";

const BOARD_STAGES: { id: ManageLeadStage; label: string; icon: string }[] = [
  { id: "NEW", label: "New", icon: "🧲" },
  { id: "QUALIFIED", label: "Qualified", icon: "🔍" },
  { id: "CONTACTED", label: "Contacted", icon: "💬" },
  { id: "RESPONDED", label: "Responded", icon: "🟢" },
];

const VIEW_OPTIONS: { value: ManageLeadView; label: string }[] = [
  { value: "kanban", label: "Kanban" },
  { value: "table", label: "Table" },
];

const NEXT_STAGE: Record<ManageLeadStage, ManageLeadStage | null> = {
  NEW: "QUALIFIED",
  QUALIFIED: "CONTACTED",
  CONTACTED: "RESPONDED",
  RESPONDED: null,
  NEGOTIATION: null,
  CONTRACTED: null,
  IN_PROGRESS: null,
  CLOSED: null,
};

const APP_IMPORT_FIELDS = [
  "name",
  "company",
  "email",
  "phone",
  "stage",
  "score",
  "budget_estimate",
  "urgency",
  "source",
  "last_activity_at",
  // CSV fields
  "category",
  "rating",
  "review_count",
  "address",
  "website_url",
  "open_now",
  "google_maps_url",
] as const;

const guessMapping = (header: string): string => {
  const normalized = header.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const aliases: Record<string, string> = {
    name: "name",
    lead_name: "name",
    client_name: "name",
    business_name: "name",
    company: "company",
    company_name: "company",
    mail: "email",
    email: "email",
    email_address: "email",
    phone: "phone",
    phone_number: "phone",
    mobile: "phone",
    status: "stage",
    pipeline_stage: "stage",
    stage: "stage",
    ai_score: "score",
    score: "score",
    budget: "budget_estimate",
    budget_estimate: "budget_estimate",
    urgency: "urgency",
    priority: "urgency",
    source: "source",
    last_activity: "last_activity_at",
    last_activity_at: "last_activity_at",
    // CSV fields
    category: "category",
    rating: "rating",
    review_count: "review_count",
    reviews: "review_count",
    address: "address",
    website_url: "website_url",
    website: "website_url",
    url: "website_url",
    open_now: "open_now",
    open: "open_now",
    google_maps_url: "google_maps_url",
    maps_url: "google_maps_url",
    google_maps: "google_maps_url",
  };
  return aliases[normalized] ?? "";
};

const formatMoney = (amount: number) => `$${amount.toLocaleString()}`;

const fromNow = (iso: string) => {
  const deltaMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(deltaMs / (1000 * 60 * 60));
  if (hours < 24) {
    return `${Math.max(hours, 0)}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

type BoardLeadCardProps = {
  lead: ManageLead;
  onHoverStart: (leadId: string, event: React.MouseEvent) => void;
  onHoverEnd: (leadId: string) => void;
};

const BoardLeadCard = ({ lead, onHoverStart, onHoverEnd }: BoardLeadCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <motion.article
      ref={setNodeRef}
      style={style}
      layout
      {...attributes}
      {...listeners}
      onMouseEnter={(event) => onHoverStart(lead.id, event)}
      onMouseLeave={() => onHoverEnd(lead.id)}
      className={`glass-card-sm p-3 text-xs transition cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-65" : ""
      }`}
      whileHover={{ y: -2 }}
    >
      <p className="text-sm font-semibold text-content">{lead.name}</p>
      <p className="text-[11px] text-content-secondary">{lead.company}</p>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-content-tertiary">
        <span>Score {lead.score}</span>
        <span>|</span>
        <span>{formatMoney(lead.budget_estimate)}</span>
        <span>|</span>
        <span>{fromNow(lead.last_activity_at)}</span>
      </div>
    </motion.article>
  );
};

type StageColumnProps = {
  stage: { id: ManageLeadStage; label: string; icon: string };
  leads: ManageLead[];
  onHoverStart: (leadId: string, event: React.MouseEvent) => void;
  onHoverEnd: (leadId: string) => void;
  onAddLead: () => void;
  uploadControl: ReactNode;
};

const StageColumn = ({ stage, leads, onHoverStart, onHoverEnd, onAddLead, uploadControl }: StageColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <section
      ref={setNodeRef}
      className={`glass-card p-3 transition ${
        isOver ? "border-accent/50 shadow-glow" : ""
      }`}
    >
      <div className="mb-3 rounded-glass-sm border border-accent/15 bg-gradient-to-r from-accent/10 to-accent-secondary/5 px-3 py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-content">
            {stage.icon} {stage.label}
          </h3>
          <span className="badge-accent px-2 py-0.5 text-[11px]">
            {leads.length}
          </span>
        </div>
      </div>

      <SortableContext items={leads.map((lead) => lead.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {leads.length === 0 ? (
            <div className="rounded-glass-sm border border-dashed border-accent/15 bg-surface-secondary/50 p-5 text-center text-xs text-content-secondary">
              <p>No leads here yet</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                {uploadControl}
                <button type="button" className="glass-btn px-2 py-1 text-xs" onClick={onAddLead}>
                  Add Lead
                </button>
              </div>
            </div>
          ) : null}

          {leads.map((lead) => (
            <BoardLeadCard key={lead.id} lead={lead} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} />
          ))}
        </div>
      </SortableContext>
    </section>
  );
};

export const ManageLeadsPage = () => {
  const navigate = useNavigate();
  const {
    selectedManageLeadId,
    manageLeadView,
    setSelectedManageLeadId,
    setManageLeadView,
  } = useLeadStore();

  // Use centralized leads hook for real-time data
  const { leads: manageLeads, loading, error: hookError } = useCentralizedLeads();

  const [search, setSearch] = useState("");
  const [onlyHot, setOnlyHot] = useState(false);
  const [insights, setInsights] = useState<ManageLeadInsights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [showAddRow, setShowAddRow] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvMapping, setCsvMapping] = useState<Record<string, string>>({});
  const [csvResult, setCsvResult] = useState<CSVImportResult | null>(null);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [modalPosition, setModalPosition] = useState<{ x: number; y: number } | null>(null);
  const [isModalHover, setIsModalHover] = useState(false);
  const isModalHoverRef = useRef(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [disableDetailsPopup, setDisableDetailsPopup] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [newLead, setNewLead] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    stage: "NEW" as ManageLeadStage,
    budget_estimate: 0,
  });

  const debouncedSearch = useDebouncedValue(search, 300);

  const loadInsights = async () => {
    try {
      const insightsPayload = await leadService.getManageLeadInsights();
      setInsights(insightsPayload);
    } catch (err) {
      console.error("Failed to load insights:", err);
    }
  };

  // Load insights on mount and when leads change
  useEffect(() => {
    if (!loading && manageLeads.length > 0) {
      void loadInsights();
    }
  }, [loading, manageLeads.length]);

  // Set error from hook
  useEffect(() => {
    if (hookError) {
      setError("Unable to load manage leads right now.");
      setErrorDetails(hookError.message);
    }
  }, [hookError]);

  // Auto-select first lead if none selected
  useEffect(() => {
    if (!selectedManageLeadId && manageLeads.length > 0) {
      setSelectedManageLeadId(manageLeads[0].id);
    }
  }, [manageLeads, selectedManageLeadId, setSelectedManageLeadId]);

  useEffect(() => {
    setHoveredId(null);
    setIsModalHover(false);
    setDetailsOpen(false);
    setEditOpen(false);
  }, [manageLeadView]);

  const filteredLeads = useMemo(() => {
    let filtered = manageLeads;

    // Apply search filter
    const q = search.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((lead) => {
        return (
          lead.name.toLowerCase().includes(q) ||
          lead.company.toLowerCase().includes(q) ||
          lead.email?.toLowerCase().includes(q) ||
          lead.phone?.toLowerCase().includes(q)
        );
      });
    }

    // Apply hot filter
    if (onlyHot) {
      filtered = filtered.filter(lead => lead.score >= 80);
    }

    return filtered;
  }, [manageLeads, search, onlyHot]);

  const grouped = useMemo(
    () =>
      BOARD_STAGES.map((stage) => ({
        ...stage,
        leads: filteredLeads.filter((lead) => lead.stage === stage.id),
      })),
    [filteredLeads],
  );

  const activeLead = useMemo(() => {
    if (hoveredId) {
      const hoveredLead = filteredLeads.find((lead) => lead.id === hoveredId);
      if (hoveredLead) return hoveredLead;
    }
    if (selectedManageLeadId) {
      return filteredLeads.find((lead) => lead.id === selectedManageLeadId) ?? null;
    }
    return null;
  }, [hoveredId, filteredLeads, selectedManageLeadId]);

  const createLeadRow = async () => {
    if (!newLead.name.trim() || !newLead.company.trim()) return;
    await leadService.createManageLead(newLead);
    setNewLead({ name: "", company: "", email: "", phone: "", stage: "NEW", budget_estimate: 0 });
    setShowAddRow(false);
    await loadInsights();
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
  };

  const importCsv = async () => {
    if (!csvFile) return;
    const result = await leadService.importManageLeadCSV(csvFile, csvMapping);
    setCsvResult(result);
    await loadInsights();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const targetStage = BOARD_STAGES.find((item) => item.id === String(over.id))?.id;
    const source = filteredLeads.find((lead) => lead.id === activeId);

    if (!targetStage || !source || source.stage === targetStage) return;

    await leadService.updateManageLead(source.id, { stage: targetStage });
    await loadInsights();
  };

  const runAction = async (leadId: string, actionType: ManageLeadActionType, targetStage?: ManageLeadStage) => {
    await leadService.manageLeadAction(leadId, { action_type: actionType, target_stage: targetStage });
    await loadInsights();
  };

  const moveNext = async (lead: ManageLead) => {
    const nextStage = NEXT_STAGE[lead.stage];
    if (!nextStage) return;
    await leadService.updateManageLead(lead.id, { stage: nextStage });
    await loadInsights();
    setFeedback(`Moved ${lead.name} to ${nextStage}`);
  };

  const openDetails = (leadId: string) => {
    setSelectedManageLeadId(leadId);
    setDetailsOpen(true);
  };

  const openEdit = (leadId: string) => {
    setSelectedManageLeadId(leadId);
    setEditOpen(true);
  };

  const handleHoverStart = (leadId: string, event: React.MouseEvent) => {
    if (disableDetailsPopup) return; // Don't show popup if disabled
    setHoveredId(leadId);
    setSelectedManageLeadId(leadId);
    setModalPosition({ x: event.clientX, y: event.clientY });
  };

  const handleHoverEnd = (leadId: string) => {
    window.setTimeout(() => {
      if (!isModalHoverRef.current) {
        setHoveredId((current) => (current === leadId ? null : current));
      }
    }, 120);
  };

  const moveToNEGOTIATION = async (lead: ManageLead) => {
    await leadService.updateManageLead(lead.id, { stage: "NEGOTIATION" });
    await loadInsights();
    setFeedback(`Moved ${lead.name} to NEGOTIATION and sent to CRM`);
    navigate("/crm", { state: { lead } });
  };

  const uploadButton = (
    <label className="glass-btn cursor-pointer px-2 py-1 text-[11px]">
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
        }}
      />
    </label>
  );

  if (loading) {
    return <div className="glass-card p-8 text-sm text-content-secondary">Loading Manage Leads dashboard...</div>;
  }

  if (error) {
    return (
      <div className="glass-card border-danger/30 p-4 text-sm text-danger">
        <p className="font-semibold">{error}</p>
        {errorDetails && (
          <p className="mt-2 text-xs text-danger/80">Details: {errorDetails}</p>
        )}
      </div>
    );
  }

  return (
    <div className="page-with-bg  ">
      <PageBackground image={bgTeamCollab} tint="rgba(168, 85, 247, 0.80)" />

      <div className="h-[calc(100vh-100px)] overflow-auto space-y-4 p-6">
      <header className="glass-card-lg p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="bg-gradient-to-r from-content via-accent to-accent-secondary bg-clip-text text-3xl font-semibold text-transparent">Manage Leads</h2>
            <p className="mt-1 text-sm text-content-secondary">Not a CRM. A lead conversion engine.</p>
          </div>
          <div className="flex items-center gap-2">
            {VIEW_OPTIONS.map((view) => (
              <button
                key={view.value}
                type="button"
                onClick={() => setManageLeadView(view.value)}
                className={`rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-all duration-200 ${
                  manageLeadView === view.value
                    ? "bg-gradient-to-r from-accent to-accent-secondary text-content-inverse shadow-glow"
                    : "border border-accent/10 bg-surface-secondary/80 text-content-tertiary hover:border-accent/30 hover:text-content-secondary"
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="glass-card-sm p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-content-tertiary">Hot leads</p>
            <p className="text-2xl font-semibold text-danger">{insights?.hot_leads_need_reply ?? 0}</p>
          </div>
          <div className="glass-card-sm p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-content-tertiary">Going cold</p>
            <p className="text-2xl font-semibold text-warning">{insights?.leads_going_cold ?? 0}</p>
          </div>
          <div className="glass-card-sm p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-content-tertiary">Likely to close</p>
            <p className="text-2xl font-semibold text-success">{insights?.leads_likely_to_close ?? 0}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name/company/email/phone"
            className="glass-input min-w-[220px] flex-1"
          />
          <button
            type="button"
            onClick={() => setOnlyHot((v) => !v)}
            className="glass-btn text-xs"
          >
            {onlyHot ? "Hot only: on" : "Hot only"}
          </button>
          <button
            type="button"
            onClick={() => setDisableDetailsPopup((v) => !v)}
            className={`glass-btn text-xs ${disableDetailsPopup ? "text-danger" : "text-success"}`}
            title={disableDetailsPopup ? "Click to enable details popup" : "Click to disable details popup"}
          >
            {disableDetailsPopup ? "🚫 Popups Off" : "✓ Popups On"}
          </button>
          {uploadButton}
          <button
            type="button"
            onClick={() => setShowAddRow((v) => !v)}
            className="glass-btn text-xs"
          >
            Add Lead
          </button>
        </div>
      </header>

      {feedback ? (
        <div className="rounded-glass-sm border border-success/30 bg-success-soft px-3 py-2 text-sm text-success">{feedback}</div>
      ) : null}

      {showAddRow ? (
        <div className="glass-card grid gap-2 p-3 md:grid-cols-6">
          <input className="glass-input px-2 py-1 text-sm" placeholder="Name" value={newLead.name} onChange={(e) => setNewLead((prev) => ({ ...prev, name: e.target.value }))} />
          <input className="glass-input px-2 py-1 text-sm" placeholder="Company" value={newLead.company} onChange={(e) => setNewLead((prev) => ({ ...prev, company: e.target.value }))} />
          <input className="glass-input px-2 py-1 text-sm" placeholder="Email" value={newLead.email} onChange={(e) => setNewLead((prev) => ({ ...prev, email: e.target.value }))} />
          <input className="glass-input px-2 py-1 text-sm" placeholder="Phone" value={newLead.phone} onChange={(e) => setNewLead((prev) => ({ ...prev, phone: e.target.value }))} />
          <input type="number" className="glass-input px-2 py-1 text-sm" placeholder="Budget" value={newLead.budget_estimate} onChange={(e) => setNewLead((prev) => ({ ...prev, budget_estimate: Number(e.target.value) || 0 }))} />
          <div className="flex gap-2">
            <button type="button" className="rounded-glass-sm border border-success/30 bg-success-soft px-3 py-1 text-xs text-success" onClick={() => void createLeadRow()}>Save</button>
            <button type="button" className="glass-btn px-3 py-1 text-xs" onClick={() => setShowAddRow(false)}>Cancel</button>
          </div>
        </div>
      ) : null}

      {csvFile && csvHeaders.length > 0 ? (
        <div className="glass-card p-4">
          <p className="text-sm text-content">CSV Field Mapping: {csvFile.name}</p>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {csvHeaders.map((header) => (
              <label key={header} className="glass-card-sm flex items-center justify-between gap-2 px-2 py-1 text-xs">
                <span className="text-content-secondary">{header}</span>
                <select
                  value={csvMapping[header] ?? ""}
                  onChange={(event) => setCsvMapping((prev) => ({ ...prev, [header]: event.target.value }))}
                  className="glass-input px-2 py-1 text-sm"
                >
                  <option value="">Ignore</option>
                  {APP_IMPORT_FIELDS.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => void importCsv()} className="accent-btn px-3 py-1.5 text-xs font-semibold">
              Import CSV
            </button>
            <button type="button" onClick={() => setCsvFile(null)} className="glass-btn px-3 py-1.5 text-xs">
              Cancel
            </button>
          </div>
          {csvResult ? (
            <p className="mt-2 text-xs text-content-secondary">
              Imported {csvResult.accepted}, skipped {csvResult.skipped}, invalid {csvResult.invalid}
            </p>
          ) : null}
        </div>
      ) : null}

      {manageLeadView === "kanban" ? (
        <DndContext 
          onDragStart={() => setIsDragging(true)}
          onDragEnd={(event) => void handleDragEnd(event)}
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {grouped.map((column) => (
              <StageColumn
                key={column.id}
                stage={column}
                leads={column.leads}
                onHoverStart={handleHoverStart}
                onHoverEnd={handleHoverEnd}
                onAddLead={() => setShowAddRow(true)}
                uploadControl={uploadButton}
              />
            ))}
          </div>
        </DndContext>
      ) : null}

      {manageLeadView === "table" ? (
        <div className="glass-card overflow-hidden">
          <div className="grid grid-cols-[1.2fr_1.2fr_1.4fr_130px_80px_110px_220px] border-b border-accent/10 bg-gradient-to-r from-accent/5 via-transparent to-transparent px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-content-tertiary">
            <span>Name</span>
            <span>Company</span>
            <span>Contact</span>
            <span>Stage</span>
            <span>Score</span>
            <span>Budget</span>
            <span>Actions</span>
          </div>

          {filteredLeads.map((lead) => (
            <div key={lead.id} className="grid grid-cols-[1.2fr_1.2fr_1.4fr_130px_80px_110px_220px] items-center border-b border-accent/5 px-4 py-2 text-xs transition-colors hover:bg-accent/5">
              <span className="text-content">{lead.name}</span>
              <span className="text-content-secondary">{lead.company}</span>
              <span className="text-content-secondary">{lead.email || lead.phone || "N/A"}</span>
              <span className="text-content-secondary">{lead.stage}</span>
              <span className="text-accent">{lead.score}</span>
              <span className="text-content-secondary">{formatMoney(lead.budget_estimate)}</span>
              <div className="flex gap-1">
                <button type="button" className="glass-btn px-2 py-1 text-[11px]" onClick={() => openDetails(lead.id)}>Details</button>
                <button type="button" className="glass-btn px-2 py-1 text-[11px]" onClick={() => openEdit(lead.id)}>Edit</button>
                <button type="button" className="rounded-glass-sm border border-danger/30 bg-danger-soft px-2 py-1 text-[11px] text-danger" onClick={() => setConfirmDeleteId(lead.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <LeadModal
        key={hoveredId || selectedManageLeadId || "closed"}
        lead={activeLead}
        open={manageLeadView === "kanban" ? Boolean(hoveredId && activeLead && !isDragging) : Boolean(detailsOpen && activeLead)}
        variant={manageLeadView === "kanban" ? "hover" : "dialog"}
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
          if (activeLead) {
            handleHoverEnd(activeLead.id);
          }
        }}
        onSendMessage={() => {
          if (!activeLead) return;
          void runAction(activeLead.id, "SEND_FOLLOW_UP");
        }}
        onScheduleCall={() => {
          if (!activeLead) return;
          void runAction(activeLead.id, "SCHEDULE_CALL");
        }}
        onMoveNext={() => {
          if (!activeLead) return;
          void moveNext(activeLead);
        }}
        onMoveToContacted={() => {
          if (!activeLead) return;
          void moveToNEGOTIATION(activeLead);
        }}
        onDelete={() => {
          if (!activeLead) return;
          setConfirmDeleteId(activeLead.id);
        }}
        onEdit={manageLeadView === "table" ? () => setEditOpen(true) : undefined}
      />

      <EditLeadModal
        lead={activeLead}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={(updated) => {
          if (!activeLead) return;
          if (!window.confirm("Are you sure you want to update this lead?")) return;
          void leadService
            .updateManageLead(activeLead.id, {
              name: updated.name,
              company: updated.company,
              email: updated.email || undefined,
              phone: updated.phone || undefined,
              stage: updated.stage,
              budget_estimate: updated.budget_estimate,
              notes: updated.notes || undefined,
              // CSV fields
              category: updated.category,
              rating: updated.rating,
              review_count: updated.review_count,
              address: updated.address,
              website_url: updated.website_url,
              open_now: updated.open_now,
              google_maps_url: updated.google_maps_url,
            })
            .then(async () => {
              await loadInsights();
              setEditOpen(false);
              setFeedback(`Updated ${updated.name}`);
            });
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        title="Delete Lead"
        description="Delete this lead? It will be moved to the recycle bin."
        confirmLabel="Delete"
        danger
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (!confirmDeleteId) return;
          void leadService.softDeleteManageLead(confirmDeleteId).then(async () => {
            setConfirmDeleteId(null);
            setHoveredId(null);
            setDetailsOpen(false);
            await loadInsights();
            setFeedback("Lead deleted");
          });
        }}
      />
      </div>
    </div>
  );
};
