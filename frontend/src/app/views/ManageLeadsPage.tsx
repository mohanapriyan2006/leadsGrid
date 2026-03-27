import { useEffect, useMemo, useState } from "react";
import { DndContext, type DragEndEvent, useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";

import { leadService } from "../../features/leads/services/leadService";
import type {
  CSVImportResult,
  ManageLead,
  ManageLeadActionType,
  ManageLeadActivity,
  ManageLeadAnalytics,
  ManageLeadInsights,
  ManageLeadStage,
  ManageLeadView,
} from "../../features/leads/types/manageLead";
import { useLeadStore } from "../../store/useLeadStore";

const STAGES: { id: ManageLeadStage; label: string; icon: string }[] = [
  { id: "NEW", label: "New", icon: "🧲" },
  { id: "QUALIFIED", label: "Qualified", icon: "🔍" },
  { id: "CONTACTED", label: "Contacted", icon: "💬" },
  { id: "RESPONDED", label: "Responded", icon: "🟢" },
  { id: "CONTRACTED", label: "Contracted", icon: "🤝" },
];

const VIEW_OPTIONS: { value: ManageLeadView; label: string }[] = [
  { value: "kanban", label: "Kanban" },
  { value: "table", label: "Table" },
  { value: "analytics", label: "Analytics" },
  { value: "ai", label: "AI View" },
];

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

type LeadCardProps = {
  lead: ManageLead;
  selected: boolean;
  checked: boolean;
  onCheck: (leadId: string, checked: boolean) => void;
  onSelect: (leadId: string) => void;
};

const LeadCard = ({ lead, selected, checked, onCheck, onSelect }: LeadCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <motion.article
      ref={setNodeRef}
      style={style}
      layout
      {...attributes}
      {...listeners}
      onClick={() => onSelect(lead.id)}
      className={`rounded-xl border bg-gradient-to-br from-slate-900/70 via-slate-900/80 to-black/85 p-3 text-xs transition ${
        selected ? "border-cyan-300/70" : "border-white/10"
      } ${lead.score >= 85 ? "shadow-[0_0_0_1px_rgba(56,189,248,0.65),0_0_24px_rgba(56,189,248,0.25)]" : "shadow-[0_12px_30px_rgba(2,6,23,0.85)]"} ${
        lead.score < 60 ? "opacity-60" : ""
      } ${isDragging ? "opacity-60" : ""}`}
      whileHover={{ y: -2 }}
    >
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <label className="inline-flex items-center gap-2 text-sm font-medium text-white" onClick={(event) => event.stopPropagation()}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => onCheck(lead.id, event.target.checked)}
            className="h-3.5 w-3.5 rounded border-white/20 bg-black/50"
          />
          {lead.name}
        </label>
        <span className="rounded-md border border-cyan-300/40 bg-cyan-400/15 px-2 py-0.5 text-[11px] font-semibold text-cyan-200">
          {lead.score}
        </span>
      </div>
      <p className="text-[11px] text-text-dim">{lead.company}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full border border-emerald-300/35 bg-emerald-500/15 px-1.5 py-0.5 text-[10px] text-emerald-200">
          {formatMoney(lead.budget_estimate)}
        </span>
        <span className="rounded-full border border-amber-300/35 bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-200">
          {lead.urgency}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-text-dim">
        <span>{lead.ai_analysis.deal_probability}% close chance</span>
        <span>{fromNow(lead.last_activity_at)}</span>
      </div>
    </motion.article>
  );
};

const StageColumn = ({
  stage,
  leads,
  selectedLeadId,
  checkedIds,
  onCheck,
  onSelect,
}: {
  stage: { id: ManageLeadStage; label: string; icon: string };
  leads: ManageLead[];
  selectedLeadId: string | null;
  checkedIds: string[];
  onCheck: (leadId: string, checked: boolean) => void;
  onSelect: (leadId: string) => void;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <section
      ref={setNodeRef}
      className={`rounded-2xl border border-white/10 bg-slate-950/70 p-3 transition ${
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
            <div className="rounded-xl border border-dashed border-white/10 bg-black/35 p-6 text-center text-xs text-text-dim">
              Drop leads here
            </div>
          ) : null}

          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              selected={selectedLeadId === lead.id}
              checked={checkedIds.includes(lead.id)}
              onCheck={onCheck}
              onSelect={onSelect}
            />
          ))}
        </div>
      </SortableContext>
    </section>
  );
};

export const ManageLeadsPage = () => {
  const {
    manageLeads,
    selectedManageLeadId,
    selectedManageLeadIds,
    manageLeadView,
    setManageLeads,
    setSelectedManageLeadId,
    setSelectedManageLeadIds,
    setManageLeadView,
  } = useLeadStore();

  const [search, setSearch] = useState("");
  const [onlyHot, setOnlyHot] = useState(false);
  const [insights, setInsights] = useState<ManageLeadInsights | null>(null);
  const [analytics, setAnalytics] = useState<ManageLeadAnalytics | null>(null);
  const [timeline, setTimeline] = useState<ManageLeadActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showAddRow, setShowAddRow] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvMapping, setCsvMapping] = useState<Record<string, string>>({});
  const [csvResult, setCsvResult] = useState<CSVImportResult | null>(null);
  const [newLead, setNewLead] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    stage: "NEW" as ManageLeadStage,
    budget_estimate: 0,
  });

  const selectedLead = useMemo(
    () => manageLeads.find((lead) => lead.id === selectedManageLeadId) ?? null,
    [manageLeads, selectedManageLeadId],
  );

  const loadLeads = async () => {
    const list = await leadService.listManageLeads({
      query: search || undefined,
      only_hot: onlyHot,
    });
    setManageLeads(list);
    if (!selectedManageLeadId && list.length > 0) {
      setSelectedManageLeadId(list[0].id);
    }
  };

  const loadInsights = async () => {
    const [insightsPayload, analyticsPayload] = await Promise.all([
      leadService.getManageLeadInsights(),
      leadService.getManageLeadAnalytics(),
    ]);
    setInsights(insightsPayload);
    setAnalytics(analyticsPayload);
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([loadLeads(), loadInsights()]);
      } catch {
        setError("Unable to load manage leads right now.");
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  useEffect(() => {
    if (!selectedLead) {
      setTimeline([]);
      return;
    }
    const run = async () => {
      const data = await leadService.getManageLeadTimeline(selectedLead.id);
      setTimeline(data);
    };
    void run();
  }, [selectedLead?.id]);

  const grouped = useMemo(
    () =>
      STAGES.map((stage) => ({
        ...stage,
        leads: manageLeads.filter((lead) => lead.stage === stage.id),
      })),
    [manageLeads],
  );

  const toggleChecked = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedManageLeadIds([...selectedManageLeadIds, leadId]);
      return;
    }
    setSelectedManageLeadIds(selectedManageLeadIds.filter((id) => id !== leadId));
  };

  const applyBulk = async (
    action: "MARK_CONTACTED" | "MARK_RESPONDED" | "SOFT_DELETE" | "MOVE_STAGE",
    targetStage?: ManageLeadStage,
  ) => {
    if (selectedManageLeadIds.length === 0) return;
    await leadService.bulkManageLeadAction({
      lead_ids: selectedManageLeadIds,
      action,
      target_stage: targetStage,
    });
    setSelectedManageLeadIds([]);
    await Promise.all([loadLeads(), loadInsights()]);
    if (action === "MOVE_STAGE" && targetStage === "CONTRACTED") {
      setFeedback("Moved to CRM");
    }
  };

  const handleAction = async (actionType: ManageLeadActionType, targetStage?: ManageLeadStage) => {
    if (!selectedLead) return;
    await leadService.manageLeadAction(selectedLead.id, {
      action_type: actionType,
      target_stage: targetStage,
    });
    await Promise.all([loadLeads(), loadInsights()]);
    if (actionType === "MOVE_STAGE" && targetStage === "CONTRACTED") {
      setFeedback("Moved to CRM");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const source = manageLeads.find((lead) => lead.id === activeId);
    if (!source) return;

    const targetStage = STAGES.find((item) => item.id === overId)?.id;
    if (!targetStage || targetStage === source.stage) return;

    await leadService.updateManageLead(source.id, { stage: targetStage });
    await Promise.all([loadLeads(), loadInsights()]);
    if (targetStage === "CONTRACTED") {
      setFeedback("Moved to CRM");
    }
  };

  const handleInlineField = async (
    leadId: string,
    patch: { email?: string; phone?: string; stage?: ManageLeadStage; notes?: string; budget_estimate?: number },
  ) => {
    await leadService.updateManageLead(leadId, patch);
    await Promise.all([loadLeads(), loadInsights()]);
  };

  const createLeadRow = async () => {
    if (!newLead.name.trim() || !newLead.company.trim()) return;
    await leadService.createManageLead(newLead);
    setNewLead({ name: "", company: "", email: "", phone: "", stage: "NEW", budget_estimate: 0 });
    setShowAddRow(false);
    await Promise.all([loadLeads(), loadInsights()]);
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
    await Promise.all([loadLeads(), loadInsights()]);
  };

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
            placeholder="Search by name/company/email"
            className="min-w-[220px] flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
          />
          <button onClick={() => setOnlyHot((v) => !v)} className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-text-dim">
            {onlyHot ? "Hot only: on" : "Hot only"}
          </button>
          <button onClick={() => void loadLeads()} className="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950">
            Apply
          </button>
          <label className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-text-dim">
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
          <button onClick={() => setShowAddRow((v) => !v)} className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-text-dim">
            Add Lead
          </button>
        </div>
      </header>

      {selectedManageLeadIds.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-cyan-300/35 bg-cyan-500/10 px-3 py-2 text-xs">
          <span className="text-cyan-100">{selectedManageLeadIds.length} selected</span>
          <button className="rounded border border-white/15 bg-black/40 px-2 py-1" onClick={() => void applyBulk("MARK_CONTACTED")}>
            Mark Contacted
          </button>
          <button className="rounded border border-white/15 bg-black/40 px-2 py-1" onClick={() => void applyBulk("MARK_RESPONDED")}>
            Mark Responded
          </button>
          <button className="rounded border border-white/15 bg-black/40 px-2 py-1" onClick={() => void applyBulk("MOVE_STAGE", "CONTRACTED")}>
            Move Contracted
          </button>
          <button className="rounded border border-rose-300/35 bg-rose-500/15 px-2 py-1 text-rose-100" onClick={() => void applyBulk("SOFT_DELETE")}>
            Delete to Bin
          </button>
        </div>
      ) : null}

      {feedback ? (
        <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100">✅ {feedback}</div>
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
            <button onClick={() => void importCsv()} className="rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950">
              Import CSV
            </button>
            <button onClick={() => setCsvFile(null)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-text-dim">
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
        <div className="grid gap-4 xl:grid-cols-[2.2fr_1fr]">
          <DndContext onDragEnd={(event) => void handleDragEnd(event)}>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {grouped.map((column) => (
                <StageColumn
                  key={column.id}
                  stage={column}
                  leads={column.leads}
                  selectedLeadId={selectedManageLeadId}
                  checkedIds={selectedManageLeadIds}
                  onCheck={toggleChecked}
                  onSelect={setSelectedManageLeadId}
                />
              ))}
            </div>
          </DndContext>

          <aside className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
            {selectedLead ? (
              <AnimatePresence mode="wait">
                <motion.div key={selectedLead.id} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}>
                  <h3 className="text-2xl font-semibold text-white">{selectedLead.name}</h3>
                  <p className="text-sm text-text-dim">{selectedLead.company}</p>
                  <div className="mt-3 space-y-1 text-xs text-text-dim">
                    <p>📧 {selectedLead.email ?? "N/A"}</p>
                    <p>📱 {selectedLead.phone ?? "N/A"}</p>
                    <p>Stage: {selectedLead.stage}</p>
                    <p>Score: {selectedLead.score}</p>
                    <p>Budget: {formatMoney(selectedLead.budget_estimate)}</p>
                  </div>
                  <div className="mt-3 rounded-xl border border-cyan-400/25 bg-cyan-500/5 p-3 text-xs">
                    <p className="text-cyan-100">Pain points: {selectedLead.ai_analysis.pain_points.join(", ") || "N/A"}</p>
                    <p className="text-cyan-100">Suggested pitch: {selectedLead.ai_analysis.suggested_pitch}</p>
                    <p className="text-cyan-100">Deal probability: {selectedLead.ai_analysis.deal_probability}%</p>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button className="rounded-lg border border-white/10 px-2 py-2 text-xs" onClick={() => void handleAction("SEND_FOLLOW_UP")}>Send message</button>
                    <button className="rounded-lg border border-white/10 px-2 py-2 text-xs" onClick={() => void handleAction("SCHEDULE_CALL")}>Schedule call</button>
                    <button className="rounded-lg border border-white/10 px-2 py-2 text-xs" onClick={() => void handleAction("MOVE_STAGE", "RESPONDED")}>Move responded</button>
                    <button className="rounded-lg border border-emerald-300/30 bg-emerald-500/15 px-2 py-2 text-xs text-emerald-100" onClick={() => void handleAction("MOVE_STAGE", "CONTRACTED")}>Move contracted</button>
                  </div>
                  <div className="mt-3 space-y-1 rounded-xl border border-white/10 bg-black/25 p-3 text-xs">
                    <p className="uppercase tracking-[0.16em] text-text-dim">Timeline</p>
                    {timeline.map((item) => (
                      <div key={item.id}>
                        <p className="text-white">{item.activity_type.replaceAll("_", " ")}</p>
                        <p className="text-text-dim">{item.message}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-6 text-center text-sm text-text-dim">Select a lead</div>
            )}
          </aside>
        </div>
      ) : null}

      {manageLeadView === "table" ? (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
          <div className="grid grid-cols-[40px_1.2fr_1.2fr_1.4fr_130px_80px_110px_130px_120px] border-b border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-text-dim">
            <span>[✔]</span>
            <span>Name</span>
            <span>Company</span>
            <span>Contact</span>
            <span>Stage</span>
            <span>Score</span>
            <span>Budget</span>
            <span>Last Activity</span>
            <span>Actions</span>
          </div>

          {showAddRow ? (
            <div className="grid grid-cols-[40px_1.2fr_1.2fr_1.4fr_130px_80px_110px_130px_120px] items-center border-b border-white/10 px-4 py-2 text-xs">
              <span />
              <input className="rounded border border-white/10 bg-black/30 px-2 py-1" value={newLead.name} onChange={(e) => setNewLead((prev) => ({ ...prev, name: e.target.value }))} />
              <input className="rounded border border-white/10 bg-black/30 px-2 py-1" value={newLead.company} onChange={(e) => setNewLead((prev) => ({ ...prev, company: e.target.value }))} />
              <div className="space-y-1">
                <input className="w-full rounded border border-white/10 bg-black/30 px-2 py-1" placeholder="email" value={newLead.email} onChange={(e) => setNewLead((prev) => ({ ...prev, email: e.target.value }))} />
                <input className="w-full rounded border border-white/10 bg-black/30 px-2 py-1" placeholder="phone" value={newLead.phone} onChange={(e) => setNewLead((prev) => ({ ...prev, phone: e.target.value }))} />
              </div>
              <select className="rounded border border-white/10 bg-black/30 px-2 py-1" value={newLead.stage} onChange={(e) => setNewLead((prev) => ({ ...prev, stage: e.target.value as ManageLeadStage }))}>
                {STAGES.map((stage) => (
                  <option key={stage.id} value={stage.id}>{stage.label}</option>
                ))}
              </select>
              <span className="text-text-dim">60</span>
              <input type="number" className="rounded border border-white/10 bg-black/30 px-2 py-1" value={newLead.budget_estimate} onChange={(e) => setNewLead((prev) => ({ ...prev, budget_estimate: Number(e.target.value) || 0 }))} />
              <span className="text-text-dim">now</span>
              <div className="flex gap-1">
                <button className="rounded border border-emerald-300/40 bg-emerald-500/15 px-2 py-1 text-[11px]" onClick={() => void createLeadRow()}>Save</button>
                <button className="rounded border border-white/10 px-2 py-1 text-[11px]" onClick={() => setShowAddRow(false)}>Cancel</button>
              </div>
            </div>
          ) : null}

          {manageLeads.map((lead) => (
            <div key={lead.id} className="grid grid-cols-[40px_1.2fr_1.2fr_1.4fr_130px_80px_110px_130px_120px] items-center border-b border-white/5 px-4 py-2 text-xs">
              <input type="checkbox" checked={selectedManageLeadIds.includes(lead.id)} onChange={(e) => toggleChecked(lead.id, e.target.checked)} />
              <button className="text-left text-white" onClick={() => setSelectedManageLeadId(lead.id)}>{lead.name}</button>
              <span className="text-text-dim">{lead.company}</span>
              <div className="space-y-1">
                <input
                  defaultValue={lead.email ?? ""}
                  className="w-full rounded border border-white/10 bg-black/30 px-2 py-0.5"
                  onBlur={(event) => void handleInlineField(lead.id, { email: event.target.value })}
                />
                <input
                  defaultValue={lead.phone ?? ""}
                  className="w-full rounded border border-white/10 bg-black/30 px-2 py-0.5"
                  onBlur={(event) => void handleInlineField(lead.id, { phone: event.target.value })}
                />
              </div>
              <select
                value={lead.stage}
                onChange={(event) => void handleInlineField(lead.id, { stage: event.target.value as ManageLeadStage })}
                className="rounded border border-white/10 bg-black/30 px-2 py-1"
              >
                {STAGES.map((stage) => (
                  <option key={stage.id} value={stage.id}>{stage.label}</option>
                ))}
              </select>
              <span className="text-cyan-200">{lead.score}</span>
              <input
                type="number"
                defaultValue={lead.budget_estimate}
                className="rounded border border-white/10 bg-black/30 px-2 py-1"
                onBlur={(event) => void handleInlineField(lead.id, { budget_estimate: Number(event.target.value) || 0 })}
              />
              <span className="text-text-dim">{fromNow(lead.last_activity_at)}</span>
              <div className="flex gap-1">
                <button className="rounded border border-white/10 px-2 py-1 text-[11px]" onClick={() => setSelectedManageLeadId(lead.id)}>Details</button>
                <button className="rounded border border-rose-300/30 bg-rose-500/15 px-2 py-1 text-[11px] text-rose-100" onClick={() => void leadService.softDeleteManageLead(lead.id).then(loadLeads)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {manageLeadView === "analytics" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-dim">Conversion rate</p>
            <p className="mt-1 text-4xl font-semibold text-emerald-200">{analytics?.conversion_rate ?? 0}%</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-dim">Pipeline value</p>
            <p className="mt-1 text-4xl font-semibold text-cyan-200">{formatMoney(analytics?.pipeline_value ?? 0)}</p>
          </article>
        </div>
      ) : null}

      {manageLeadView === "ai" ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {manageLeads
            .filter((lead) => lead.score >= 85)
            .map((lead) => (
              <article key={lead.id} className="rounded-2xl border border-cyan-300/35 bg-gradient-to-br from-cyan-400/10 to-violet-500/5 p-4">
                <p className="text-sm text-white">{lead.name} · {lead.company}</p>
                <p className="mt-2 text-xs text-cyan-100">{lead.ai_analysis.next_action}</p>
                <p className="mt-1 text-xs text-text-dim">{lead.ai_analysis.winning_strategy}</p>
              </article>
            ))}
        </div>
      ) : null}
    </div>
  );
};
