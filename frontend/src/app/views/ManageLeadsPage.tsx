import { useEffect, useMemo, useState, type ReactNode } from "react";
import { DndContext, type DragEndEvent, useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { ConfirmDialog } from "../../features/leads/components/ConfirmDialog";
import { EditLeadModal } from "../../features/leads/components/EditLeadModal";
import { LeadModal } from "../../features/leads/components/LeadModal";
import { leadService } from "../../features/leads/services/leadService";
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
] as const;

const guessMapping = (header: string): string => {
  const normalized = header.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const aliases: Record<string, string> = {
    name: "name",
    lead_name: "name",
    client_name: "name",
    business_name: "company",
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
      className={`rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/75 via-slate-950/80 to-black/90 p-3 text-xs transition cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-65" : ""
      }`}
      whileHover={{ y: -2 }}
    >
      <p className="text-sm font-semibold text-white">{lead.name}</p>
      <p className="text-[11px] text-text-dim">{lead.company}</p>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-text-dim">
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
      className={`rounded-2xl border border-white/10 bg-slate-950/75 p-3 transition ${
        isOver ? "border-cyan-300/70" : ""
      }`}
    >
      <div className="mb-3 rounded-xl border border-white/10 bg-gradient-to-r from-cyan-500/15 to-violet-500/10 px-3 py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
            {stage.icon} {stage.label}
          </h3>
          <span className="rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[11px] text-text-dim">
            {leads.length}
          </span>
        </div>
      </div>

      <SortableContext items={leads.map((lead) => lead.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {leads.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-black/35 p-5 text-center text-xs text-text-dim">
              <p>No leads here yet</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                {uploadControl}
                <button type="button" className="rounded-lg border border-white/10 px-2 py-1" onClick={onAddLead}>
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
    manageLeads,
    selectedManageLeadId,
    manageLeadView,
    setManageLeads,
    setSelectedManageLeadId,
    setManageLeadView,
  } = useLeadStore();

  const [search, setSearch] = useState("");
  const [onlyHot, setOnlyHot] = useState(false);
  const [insights, setInsights] = useState<ManageLeadInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [showAddRow, setShowAddRow] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvMapping, setCsvMapping] = useState<Record<string, string>>({});
  const [csvResult, setCsvResult] = useState<CSVImportResult | null>(null);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [modalPosition, setModalPosition] = useState<{ x: number; y: number } | null>(null);
  const [isModalHover, setIsModalHover] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
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

  const loadLeads = async (query: string, hotOnly: boolean) => {
    const list = await leadService.listManageLeads({
      query: query || undefined,
      only_hot: hotOnly,
    });
    setManageLeads(list);
    if (!selectedManageLeadId && list.length > 0) {
      setSelectedManageLeadId(list[0].id);
    }
  };

  const loadInsights = async () => {
    const insightsPayload = await leadService.getManageLeadInsights();
    setInsights(insightsPayload);
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([loadLeads("", onlyHot), loadInsights()]);
        setInitialized(true);
      } catch {
        setError("Unable to load manage leads right now.");
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  useEffect(() => {
    if (!initialized) return;
    const run = async () => {
      try {
        setError(null);
        await loadLeads(debouncedSearch, onlyHot);
      } catch {
        setError("Unable to refresh leads right now.");
      }
    };
    void run();
  }, [debouncedSearch, onlyHot, initialized]);

  useEffect(() => {
    setHoveredId(null);
    setIsModalHover(false);
    setDetailsOpen(false);
    setEditOpen(false);
  }, [manageLeadView]);

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return manageLeads;

    return manageLeads.filter((lead) => {
      return (
        lead.name.toLowerCase().includes(q) ||
        lead.company.toLowerCase().includes(q) ||
        lead.email?.toLowerCase().includes(q) ||
        lead.phone?.toLowerCase().includes(q)
      );
    });
  }, [manageLeads, search]);

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
    await Promise.all([loadLeads(debouncedSearch, onlyHot), loadInsights()]);
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
    await Promise.all([loadLeads(debouncedSearch, onlyHot), loadInsights()]);
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
    await Promise.all([loadLeads(debouncedSearch, onlyHot), loadInsights()]);
  };

  const runAction = async (leadId: string, actionType: ManageLeadActionType, targetStage?: ManageLeadStage) => {
    await leadService.manageLeadAction(leadId, { action_type: actionType, target_stage: targetStage });
    await Promise.all([loadLeads(debouncedSearch, onlyHot), loadInsights()]);
  };

  const moveNext = async (lead: ManageLead) => {
    const nextStage = NEXT_STAGE[lead.stage];
    if (!nextStage) return;
    await leadService.updateManageLead(lead.id, { stage: nextStage });
    await Promise.all([loadLeads(debouncedSearch, onlyHot), loadInsights()]);
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
    setHoveredId(leadId);
    setSelectedManageLeadId(leadId);
    setModalPosition({ x: event.clientX, y: event.clientY });
  };

  const handleHoverEnd = (leadId: string) => {
    window.setTimeout(() => {
      if (!isModalHover) {
        setHoveredId((current) => (current === leadId ? null : current));
      }
    }, 40);
  };

  const moveToNEGOTIATION = async (lead: ManageLead) => {
    await leadService.updateManageLead(lead.id, { stage: "NEGOTIATION" });
    await Promise.all([loadLeads(debouncedSearch, onlyHot), loadInsights()]);
    setFeedback(`Moved ${lead.name} to NEGOTIATION and sent to CRM`);
    navigate("/crm", { state: { lead } });
  };

  const uploadButton = (
    <label className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-[11px] text-text-dim">
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
    return <div className="rounded-2xl border border-white/10 bg-black/30 p-8 text-sm text-text-dim">Loading Manage Leads dashboard...</div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-rose-400/40 bg-rose-950/30 p-4 text-sm text-rose-100">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-transparent to-cyan-500/10 p-4 backdrop-blur-xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-semibold text-white">Manage Leads</h2>
            <p className="text-sm text-text-dim">Not a CRM. A lead conversion engine.</p>
          </div>
          <div className="flex items-center gap-2">
            {VIEW_OPTIONS.map((view) => (
              <button
                key={view.value}
                type="button"
                onClick={() => setManageLeadView(view.value)}
                className={`rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] ${
                  manageLeadView === view.value
                    ? "bg-gradient-to-r from-cyan-400 to-violet-400 text-slate-950"
                    : "border border-white/10 bg-black/30 text-text-dim"
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/35 p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-dim">Hot leads</p>
            <p className="text-2xl font-semibold text-cyan-200">{insights?.hot_leads_need_reply ?? 0}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/35 p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-dim">Going cold</p>
            <p className="text-2xl font-semibold text-amber-200">{insights?.leads_going_cold ?? 0}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/35 p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-dim">Likely to close</p>
            <p className="text-2xl font-semibold text-emerald-200">{insights?.leads_likely_to_close ?? 0}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name/company/email/phone"
            className="min-w-[220px] flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
          />
          <button
            type="button"
            onClick={() => setOnlyHot((v) => !v)}
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-text-dim"
          >
            {onlyHot ? "Hot only: on" : "Hot only"}
          </button>
          {uploadButton}
          <button
            type="button"
            onClick={() => setShowAddRow((v) => !v)}
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-text-dim"
          >
            Add Lead
          </button>
        </div>
      </header>

      {feedback ? (
        <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100">{feedback}</div>
      ) : null}

      {showAddRow ? (
        <div className="grid gap-2 rounded-2xl border border-white/10 bg-black/35 p-3 md:grid-cols-6">
          <input className="rounded border border-white/10 bg-black/30 px-2 py-1 text-sm" placeholder="Name" value={newLead.name} onChange={(e) => setNewLead((prev) => ({ ...prev, name: e.target.value }))} />
          <input className="rounded border border-white/10 bg-black/30 px-2 py-1 text-sm" placeholder="Company" value={newLead.company} onChange={(e) => setNewLead((prev) => ({ ...prev, company: e.target.value }))} />
          <input className="rounded border border-white/10 bg-black/30 px-2 py-1 text-sm" placeholder="Email" value={newLead.email} onChange={(e) => setNewLead((prev) => ({ ...prev, email: e.target.value }))} />
          <input className="rounded border border-white/10 bg-black/30 px-2 py-1 text-sm" placeholder="Phone" value={newLead.phone} onChange={(e) => setNewLead((prev) => ({ ...prev, phone: e.target.value }))} />
          <input type="number" className="rounded border border-white/10 bg-black/30 px-2 py-1 text-sm" placeholder="Budget" value={newLead.budget_estimate} onChange={(e) => setNewLead((prev) => ({ ...prev, budget_estimate: Number(e.target.value) || 0 }))} />
          <div className="flex gap-2">
            <button type="button" className="rounded border border-emerald-300/40 bg-emerald-500/15 px-3 py-1 text-xs" onClick={() => void createLeadRow()}>Save</button>
            <button type="button" className="rounded border border-white/10 px-3 py-1 text-xs" onClick={() => setShowAddRow(false)}>Cancel</button>
          </div>
        </div>
      ) : null}

      {csvFile && csvHeaders.length > 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
          <p className="text-sm text-white">CSV Field Mapping: {csvFile.name}</p>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {csvHeaders.map((header) => (
              <label key={header} className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/25 px-2 py-1 text-xs">
                <span className="text-text-dim">{header}</span>
                <select
                  value={csvMapping[header] ?? ""}
                  onChange={(event) => setCsvMapping((prev) => ({ ...prev, [header]: event.target.value }))}
                  className="rounded border border-white/15 bg-black/40 px-2 py-1 text-white"
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
            <button type="button" onClick={() => void importCsv()} className="rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950">
              Import CSV
            </button>
            <button type="button" onClick={() => setCsvFile(null)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-text-dim">
              Cancel
            </button>
          </div>
          {csvResult ? (
            <p className="mt-2 text-xs text-text-dim">
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
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
          <div className="grid grid-cols-[1.2fr_1.2fr_1.4fr_130px_80px_110px_220px] border-b border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-text-dim">
            <span>Name</span>
            <span>Company</span>
            <span>Contact</span>
            <span>Stage</span>
            <span>Score</span>
            <span>Budget</span>
            <span>Actions</span>
          </div>

          {filteredLeads.map((lead) => (
            <div key={lead.id} className="grid grid-cols-[1.2fr_1.2fr_1.4fr_130px_80px_110px_220px] items-center border-b border-white/5 px-4 py-2 text-xs">
              <span className="text-white">{lead.name}</span>
              <span className="text-text-dim">{lead.company}</span>
              <span className="text-text-dim">{lead.email || lead.phone || "N/A"}</span>
              <span className="text-text-dim">{lead.stage}</span>
              <span className="text-cyan-200">{lead.score}</span>
              <span className="text-text-dim">{formatMoney(lead.budget_estimate)}</span>
              <div className="flex gap-1">
                <button type="button" className="rounded border border-white/10 px-2 py-1 text-[11px]" onClick={() => openDetails(lead.id)}>Details</button>
                <button type="button" className="rounded border border-white/10 px-2 py-1 text-[11px]" onClick={() => openEdit(lead.id)}>Edit</button>
                <button type="button" className="rounded border border-rose-300/35 bg-rose-500/15 px-2 py-1 text-[11px] text-rose-100" onClick={() => setConfirmDeleteId(lead.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <LeadModal
        lead={activeLead}
        open={manageLeadView === "kanban" ? Boolean(hoveredId && activeLead && !isDragging) : Boolean(detailsOpen && activeLead)}
        variant={manageLeadView === "kanban" ? "hover" : "dialog"}
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
            })
            .then(async () => {
              await Promise.all([loadLeads(debouncedSearch, onlyHot), loadInsights()]);
              setEditOpen(false);
              setFeedback(`Updated ${updated.name}`);
            });
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        title="Delete Lead"
        description="Delete this lead permanently?"
        confirmLabel="Delete"
        danger
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (!confirmDeleteId) return;
          void leadService.softDeleteManageLead(confirmDeleteId).then(async () => {
            setConfirmDeleteId(null);
            setHoveredId(null);
            setDetailsOpen(false);
            await Promise.all([loadLeads(debouncedSearch, onlyHot), loadInsights()]);
            setFeedback("Lead deleted");
          });
        }}
      />
    </div>
  );
};
