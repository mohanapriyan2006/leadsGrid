import { useEffect, useMemo, useState } from "react";
import { DndContext, type DragEndEvent, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";

import { leadService } from "../../features/leads/services/leadService";
import type {
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
  { id: "NEW_LEADS", label: "New Leads", icon: "🧲" },
  { id: "QUALIFIED", label: "Qualified", icon: "🔍" },
  { id: "CONTACTED", label: "Contacted", icon: "💬" },
  { id: "NEGOTIATION", label: "Negotiation", icon: "🤝" },
  { id: "WON", label: "Won", icon: "💰" },
  { id: "LOST", label: "Lost", icon: "❌" },
];

const VIEW_OPTIONS: { value: ManageLeadView; label: string }[] = [
  { value: "kanban", label: "Kanban" },
  { value: "table", label: "Table" },
  { value: "analytics", label: "Analytics" },
  { value: "ai", label: "AI View" },
];

type StageColumnProps = {
  stage: ManageLeadStage;
  title: string;
  icon: string;
  leads: ManageLead[];
  selectedLeadId: string | null;
  onSelect: (leadId: string) => void;
};

const stageTone = (stage: ManageLeadStage) => {
  switch (stage) {
    case "NEW_LEADS":
      return "from-cyan-400/25 to-cyan-500/5";
    case "QUALIFIED":
      return "from-sky-400/25 to-sky-500/5";
    case "CONTACTED":
      return "from-indigo-400/25 to-indigo-500/5";
    case "NEGOTIATION":
      return "from-violet-400/25 to-violet-500/5";
    case "WON":
      return "from-emerald-400/25 to-emerald-500/5";
    case "LOST":
      return "from-rose-400/25 to-rose-500/5";
    default:
      return "from-slate-400/20 to-slate-500/5";
  }
};

const urgencyTone = (urgency: ManageLead["urgency"]) => {
  if (urgency === "high") return "bg-rose-500/20 text-rose-200 border-rose-400/40";
  if (urgency === "medium") return "bg-amber-500/20 text-amber-200 border-amber-300/40";
  return "bg-slate-500/20 text-slate-200 border-slate-300/30";
};

const sourceTone = (source: ManageLead["source"]) => {
  if (source === "linkedin") return "text-sky-300";
  if (source === "reddit") return "text-orange-300";
  return "text-fuchsia-300";
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

const StageColumn = ({
  stage,
  title,
  icon,
  leads,
  selectedLeadId,
  onSelect,
}: StageColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <section
      ref={setNodeRef}
      className={`rounded-2xl border border-white/10 bg-slate-950/70 p-3 backdrop-blur-xl transition ${
        isOver ? "border-emerald-400/70 shadow-[0_0_0_1px_rgba(16,185,129,0.45)]" : ""
      }`}
    >
      <div className={`mb-3 rounded-xl border border-white/10 bg-gradient-to-r ${stageTone(stage)} px-3 py-2`}>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
            {icon} {title}
          </h3>
          <span className="rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[11px] text-text-dim">
            {leads.length}
          </span>
        </div>
      </div>

      <SortableContext items={leads.map((lead) => lead.id)} strategy={rectSortingStrategy}>
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
              onSelect={() => onSelect(lead.id)}
            />
          ))}
        </div>
      </SortableContext>
    </section>
  );
};

const LeadCard = ({
  lead,
  selected,
  onSelect,
}: {
  lead: ManageLead;
  selected: boolean;
  onSelect: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const highIntent = lead.score >= 85;
  const lowQuality = lead.score < 60;

  return (
    <motion.article
      ref={setNodeRef}
      style={style}
      layout
      {...attributes}
      {...listeners}
      onClick={onSelect}
      className={`cursor-grab rounded-xl border bg-gradient-to-br from-slate-900/70 via-slate-900/80 to-black/85 p-3 text-xs shadow-[0_14px_30px_rgba(2,6,23,0.85)] transition active:cursor-grabbing ${
        selected ? "border-cyan-300/70" : "border-white/10"
      } ${highIntent ? "shadow-[0_0_0_1px_rgba(96,165,250,0.65),0_0_20px_rgba(96,165,250,0.25)]" : ""} ${
        lowQuality ? "opacity-60" : ""
      } ${isDragging ? "opacity-60" : ""}`}
      whileHover={{ y: -2 }}
    >
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-white">{lead.name}</p>
          <p className="text-[11px] text-text-dim">{lead.company}</p>
        </div>
        <span className="rounded-md border border-cyan-300/40 bg-cyan-400/15 px-2 py-0.5 text-[11px] font-semibold text-cyan-200">
          {lead.score}
        </span>
      </div>

      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
        <span className={`text-[11px] font-medium uppercase tracking-[0.14em] ${sourceTone(lead.source)}`}>
          {lead.source}
        </span>
        <span className={`rounded-full border px-1.5 py-0.5 text-[10px] ${urgencyTone(lead.urgency)}`}>
          {lead.urgency}
        </span>
        <span className="rounded-full border border-emerald-400/35 bg-emerald-400/15 px-1.5 py-0.5 text-[10px] text-emerald-200">
          {formatMoney(lead.budget_estimate)}
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-text-dim">
        <span>{lead.ai_analysis.deal_probability}% close chance</span>
        <span>{fromNow(lead.last_activity_at)}</span>
      </div>
    </motion.article>
  );
};

export const ManageLeadsPage = () => {
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
  const [onlyCold, setOnlyCold] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [insights, setInsights] = useState<ManageLeadInsights | null>(null);
  const [analytics, setAnalytics] = useState<ManageLeadAnalytics | null>(null);
  const [timeline, setTimeline] = useState<ManageLeadActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedLead = useMemo(
    () => manageLeads.find((lead) => lead.id === selectedManageLeadId) ?? null,
    [manageLeads, selectedManageLeadId],
  );

  const loadLeads = async () => {
    const list = await leadService.listManageLeads({
      query: search || undefined,
      min_score: minScore,
      only_hot: onlyHot,
      only_cold: onlyCold,
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
      try {
        const data = await leadService.getManageLeadTimeline(selectedLead.id);
        setTimeline(data);
      } catch {
        setTimeline([]);
      }
    };

    void run();
  }, [selectedLead?.id]);

  const stageGroups = useMemo(() => {
    return STAGES.map((stage) => ({
      ...stage,
      leads: manageLeads.filter((lead) => lead.stage === stage.id),
    }));
  }, [manageLeads]);

  const handleAction = async (actionType: ManageLeadActionType, targetStage?: ManageLeadStage) => {
    if (!selectedLead) return;

    const updated = await leadService.manageLeadAction(selectedLead.id, {
      action_type: actionType,
      target_stage: targetStage,
    });

    setManageLeads(
      manageLeads.map((lead) => (lead.id === updated.id ? updated : lead)),
    );
    setSelectedManageLeadId(updated.id);

    const [nextInsights, nextAnalytics, nextTimeline] = await Promise.all([
      leadService.getManageLeadInsights(),
      leadService.getManageLeadAnalytics(),
      leadService.getManageLeadTimeline(updated.id),
    ]);
    setInsights(nextInsights);
    setAnalytics(nextAnalytics);
    setTimeline(nextTimeline);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeLead = manageLeads.find((lead) => lead.id === activeId);
    if (!activeLead) return;

    const targetStage = STAGES.find((stage) => stage.id === overId)?.id
      ?? manageLeads.find((lead) => lead.id === overId)?.stage;

    if (!targetStage) return;

    if (targetStage === activeLead.stage) {
      const sourceItems = manageLeads.filter((lead) => lead.stage === activeLead.stage);
      const oldIndex = sourceItems.findIndex((lead) => lead.id === activeId);
      const newIndex = sourceItems.findIndex((lead) => lead.id === overId);
      if (oldIndex === -1 || newIndex === -1) return;

      const reorderedSource = arrayMove(sourceItems, oldIndex, newIndex);
      const withoutStage = manageLeads.filter((lead) => lead.stage !== activeLead.stage);
      setManageLeads([...withoutStage, ...reorderedSource]);
      return;
    }

    const optimistic = manageLeads.map((lead) =>
      lead.id === activeLead.id ? { ...lead, stage: targetStage } : lead,
    );
    setManageLeads(optimistic);

    try {
      const updated = await leadService.updateManageLead(activeLead.id, { stage: targetStage });
      setManageLeads(
        optimistic.map((lead) => (lead.id === updated.id ? updated : lead)),
      );
      const nextInsights = await leadService.getManageLeadInsights();
      setInsights(nextInsights);
    } catch {
      setManageLeads(manageLeads);
    }
  };

  const runAutomations = async () => {
    await leadService.runManageLeadAutomation();
    await Promise.all([loadLeads(), loadInsights()]);
  };

  const totalPipeline = useMemo(
    () =>
      manageLeads
        .filter((lead) => !["WON", "LOST"].includes(lead.stage))
        .reduce((acc, lead) => acc + lead.budget_estimate, 0),
    [manageLeads],
  );

  if (loading) {
    return <div className="rounded-2xl border border-white/10 bg-black/30 p-8 text-sm text-text-dim">Loading Manage Leads dashboard...</div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-rose-400/40 bg-rose-950/30 p-4 text-sm text-rose-100">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-transparent to-cyan-500/10 p-4 shadow-[0_15px_40px_rgba(2,6,23,0.8)] backdrop-blur-xl">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="bg-gradient-to-r from-white via-cyan-100 to-violet-100 bg-clip-text text-3xl font-semibold text-transparent">
              Manage Leads
            </h2>
            <p className="text-sm text-text-dim">
              AI + Visual Pipeline + Action System to guide every deal to close.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {VIEW_OPTIONS.map((view) => (
              <button
                key={view.value}
                onClick={() => setManageLeadView(view.value)}
                className={`rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition ${
                  manageLeadView === view.value
                    ? "bg-gradient-to-r from-cyan-400 to-violet-400 text-slate-950"
                    : "border border-white/10 bg-black/30 text-text-dim hover:text-white"
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/35 p-3 text-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-dim">🔥 Hot Leads</p>
            <p className="mt-1 text-2xl font-semibold text-cyan-200">{insights?.hot_leads_need_reply ?? 0}</p>
            <p className="text-xs text-text-dim">Need reply today</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/35 p-3 text-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-dim">⚠️ Going Cold</p>
            <p className="mt-1 text-2xl font-semibold text-amber-200">{insights?.leads_going_cold ?? 0}</p>
            <p className="text-xs text-text-dim">Require re-engagement</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/35 p-3 text-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-dim">💰 Likely To Close</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-200">{insights?.leads_likely_to_close ?? 0}</p>
            <p className="text-xs text-text-dim">High conversion probability</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, company or context"
            className="min-w-[220px] flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/60"
          />
          <label className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-text-dim">
            Min score: {minScore}
            <input
              type="range"
              min={0}
              max={100}
              value={minScore}
              onChange={(event) => setMinScore(Number(event.target.value))}
              className="ml-2 align-middle"
            />
          </label>
          <button
            onClick={() => setOnlyHot((value) => !value)}
            className={`rounded-xl px-3 py-2 text-xs ${onlyHot ? "bg-cyan-500/20 text-cyan-100" : "border border-white/10 bg-black/40 text-text-dim"}`}
          >
            Hot only
          </button>
          <button
            onClick={() => setOnlyCold((value) => !value)}
            className={`rounded-xl px-3 py-2 text-xs ${onlyCold ? "bg-amber-500/20 text-amber-100" : "border border-white/10 bg-black/40 text-text-dim"}`}
          >
            Going cold
          </button>
          <button
            onClick={() => void loadLeads()}
            className="rounded-xl bg-gradient-to-r from-cyan-400 to-violet-400 px-3 py-2 text-xs font-semibold text-slate-950"
          >
            Apply filters
          </button>
          <button
            onClick={() => void runAutomations()}
            className="rounded-xl border border-emerald-300/30 bg-emerald-500/15 px-3 py-2 text-xs text-emerald-100"
          >
            Run automations
          </button>
        </div>
      </header>

      {manageLeadView === "kanban" ? (
        <div className="grid gap-4 xl:grid-cols-[2.2fr_1fr]">
          <DndContext onDragEnd={(event) => void handleDragEnd(event)}>
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {stageGroups.map((column) => (
                <StageColumn
                  key={column.id}
                  stage={column.id}
                  title={column.label}
                  icon={column.icon}
                  leads={column.leads}
                  selectedLeadId={selectedManageLeadId}
                  onSelect={setSelectedManageLeadId}
                />
              ))}
            </div>
          </DndContext>

          <aside className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 shadow-[0_18px_45px_rgba(2,6,23,0.9)] backdrop-blur-xl">
            {selectedLead ? (
              <AnimatePresence mode="wait">
                <motion.div key={selectedLead.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <div className="mb-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-text-dim">Lead details</p>
                    <h3 className="text-2xl font-semibold text-white">{selectedLead.name}</h3>
                    <p className="text-sm text-text-dim">{selectedLead.company}</p>
                  </div>

                  <div className="space-y-2 rounded-xl border border-white/10 bg-black/30 p-3 text-xs">
                    <p className="text-text-dim">👤 Basic Info</p>
                    <p>Email: {selectedLead.email ?? "N/A"}</p>
                    <p>Phone: {selectedLead.phone ?? "N/A"}</p>
                    <p>Source: <span className="uppercase">{selectedLead.source}</span></p>
                    <p>Budget: {formatMoney(selectedLead.budget_estimate)}</p>
                    <p>Urgency: {selectedLead.urgency}</p>
                  </div>

                  <div className="mt-3 space-y-2 rounded-xl border border-cyan-400/25 bg-cyan-400/5 p-3 text-xs">
                    <p className="text-cyan-200">🧠 AI Analysis</p>
                    <p>Intent score: {selectedLead.ai_analysis.intent_score}</p>
                    <p>Deal probability: {selectedLead.ai_analysis.deal_probability}%</p>
                    <p>Time to close: {selectedLead.ai_analysis.expected_close_days} days</p>
                    <p>Ghost detection: {selectedLead.ai_analysis.ghost_probability}%</p>
                    <p>Best portfolio match: {selectedLead.ai_analysis.portfolio_match}</p>
                    <p>Suggested pitch: {selectedLead.ai_analysis.suggested_pitch}</p>
                    <p>Winning strategy: {selectedLead.ai_analysis.winning_strategy}</p>
                    <div>
                      <p className="mb-1 text-cyan-100">Pain points</p>
                      <ul className="list-disc pl-4 text-text-dim">
                        {selectedLead.ai_analysis.pain_points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => void handleAction("SEND_FOLLOW_UP")}
                      className="rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-xs text-white transition hover:border-cyan-300/50"
                    >
                      Send follow-up
                    </button>
                    <button
                      onClick={() => void handleAction("PROPOSE_PRICING")}
                      className="rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-xs text-white transition hover:border-cyan-300/50"
                    >
                      Propose pricing
                    </button>
                    <button
                      onClick={() => void handleAction("SCHEDULE_CALL")}
                      className="rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-xs text-white transition hover:border-cyan-300/50"
                    >
                      Schedule call
                    </button>
                    <button
                      onClick={() => void handleAction("MOVE_STAGE", "WON")}
                      className="rounded-lg border border-emerald-300/40 bg-emerald-500/15 px-2 py-2 text-xs text-emerald-100"
                    >
                      Move to won
                    </button>
                  </div>

                  <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
                    <p className="mb-2 text-xs uppercase tracking-[0.16em] text-text-dim">Activity timeline</p>
                    <div className="max-h-52 space-y-2 overflow-auto pr-1">
                      {timeline.map((item) => (
                        <div key={item.id} className="rounded-lg border border-white/10 bg-black/30 p-2 text-xs">
                          <p className="font-medium text-white">{item.activity_type.replaceAll("_", " ")}</p>
                          <p className="text-text-dim">{item.message}</p>
                          <p className="mt-1 text-[10px] text-text-dim">{new Date(item.created_at).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-6 text-center text-sm text-text-dim">
                Select a lead to see AI insights and actions.
              </div>
            )}
          </aside>
        </div>
      ) : null}

      {manageLeadView === "table" ? (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl">
          <div className="grid grid-cols-[1.6fr_1.3fr_100px_110px_130px_100px] border-b border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-text-dim">
            <span>Name / Company</span>
            <span>Stage</span>
            <span>Score</span>
            <span>Urgency</span>
            <span>Budget</span>
            <span>Source</span>
          </div>
          {manageLeads.map((lead) => (
            <div key={lead.id} className="grid grid-cols-[1.6fr_1.3fr_100px_110px_130px_100px] items-center border-b border-white/5 px-4 py-3 text-sm">
              <span>
                <p className="text-white">{lead.name}</p>
                <p className="text-xs text-text-dim">{lead.company}</p>
              </span>
              <span className="text-text-dim">{lead.stage}</span>
              <span className="text-cyan-200">{lead.score}</span>
              <span className="text-text-dim">{lead.urgency}</span>
              <span className="text-emerald-200">{formatMoney(lead.budget_estimate)}</span>
              <span className="uppercase text-text-dim">{lead.source}</span>
            </div>
          ))}
        </div>
      ) : null}

      {manageLeadView === "analytics" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-dim">Conversion rate</p>
            <p className="mt-1 text-4xl font-semibold text-emerald-200">{analytics?.conversion_rate ?? 0}%</p>
            <p className="text-sm text-text-dim">Won / total lead flow</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-dim">Revenue pipeline</p>
            <p className="mt-1 text-4xl font-semibold text-cyan-200">{formatMoney(analytics?.pipeline_value ?? totalPipeline)}</p>
            <p className="text-sm text-text-dim">Open opportunities value</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-black/35 p-4 md:col-span-2">
            <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-text-dim">Stage drop-offs</p>
            <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
              {STAGES.map((stage) => (
                <div key={stage.id} className="rounded-xl border border-white/10 bg-black/30 p-3 text-center">
                  <p className="text-xs text-text-dim">{stage.label}</p>
                  <p className="mt-1 text-2xl text-white">{analytics?.stage_drop_offs?.[stage.id] ?? 0}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      ) : null}

      {manageLeadView === "ai" ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {manageLeads
            .filter((lead) => lead.score >= 85)
            .sort((a, b) => b.ai_analysis.deal_probability - a.ai_analysis.deal_probability)
            .map((lead) => (
              <motion.article
                key={lead.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-cyan-300/35 bg-gradient-to-br from-cyan-400/10 to-violet-500/5 p-4 shadow-[0_0_0_1px_rgba(125,211,252,0.3),0_0_35px_rgba(56,189,248,0.15)]"
              >
                <p className="text-sm text-white">{lead.name} · {lead.company}</p>
                <p className="mt-1 text-xs text-text-dim">Quick close mode</p>
                <p className="mt-3 text-xs text-cyan-100">{lead.ai_analysis.next_action}</p>
                <p className="mt-1 text-xs text-text-dim">{lead.ai_analysis.suggested_pitch}</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-cyan-200">{lead.ai_analysis.deal_probability}% close chance</span>
                  <span className="text-emerald-200">{lead.ai_analysis.expected_close_days}d ETA</span>
                </div>
              </motion.article>
            ))}
        </div>
      ) : null}
    </div>
  );
};
