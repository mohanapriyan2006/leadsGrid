import { motion } from "framer-motion";

import type { Lead } from "../types/lead";

type LeadCardProps = {
  lead: Lead;
  isSelected: boolean;
  onSelect: (lead: Lead) => void;
  onGenerateDraft: (lead: Lead) => void;
};

export const LeadCard = ({ lead, isSelected, onSelect, onGenerateDraft }: LeadCardProps) => {
  const isHighIntent = lead.score >= 85;
  const leadDecision = lead.decision_maker || lead.ai_analysis?.intent.decision_maker;
  const leadPainPoint = lead.pain_point || lead.ai_analysis?.intent.pain_point;
  const leadStatus = lead.status;
  const leadSignals = (lead.buying_signals || []).slice(0, 3);

  return (
    <motion.article
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={`glass-card p-4 ${
        isHighIntent
          ? "animate-pulseGlow border-accent/50"
          : ""
      } ${isSelected ? "ring-1 ring-accent shadow-glow" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em]  ">{lead.source} · {lead.author}</p>
          <p className="mt-2 text-sm text-content">{lead.summary}</p>
        </div>
        <div className="text-right">
          <p className="text-xs  ">Intent</p>
          <p className="text-2xl font-bold text-highlight">{lead.score}</p>
          <p className="text-[11px] text-accent">{lead.intent_label}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {lead.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-accent/10 bg-accent-soft/50 px-2 py-1 text-[11px] text-content-secondary">
            {tag}
          </span>
        ))}
        {leadDecision ? (
          <span className="rounded-full border border-info/30 bg-info-soft/60 px-2 py-1 text-[11px] text-content-secondary">
            Decision: {leadDecision}
          </span>
        ) : null}
        {leadStatus ? (
          <span className="rounded-full border border-success/30 bg-success-soft/60 px-2 py-1 text-[11px] text-content-secondary">
            {leadStatus}
          </span>
        ) : null}
        {leadSignals.map((signal) => (
          <span key={signal} className="rounded-full border border-warning/30 bg-warning-soft/60 px-2 py-1 text-[11px] text-content-secondary">
            {signal}
          </span>
        ))}
      </div>
      {leadPainPoint ? (
        <p className="mt-2 text-xs text-content-secondary">Pain: {leadPainPoint}</p>
      ) : null}
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          className="glass-btn px-3 py-2 text-xs"
          onClick={() => onSelect(lead)}
        >
          View Context
        </button>
        <button
          type="button"
          className="accent-btn px-3 py-2 text-xs font-semibold"
          onClick={() => onGenerateDraft(lead)}
        >
          Generate Draft
        </button>
      </div>
    </motion.article>
  );
};
