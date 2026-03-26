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

  return (
    <motion.article
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={`rounded-xl border bg-panel/70 p-4 backdrop-blur ${
        isHighIntent
          ? "animate-pulseGlow border-accent/50"
          : "border-white/10"
      } ${isSelected ? "ring-1 ring-accent" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-text-dim">{lead.source} · {lead.author}</p>
          <p className="mt-2 text-sm text-white">{lead.summary}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-dim">Intent</p>
          <p className="text-2xl font-bold text-highlight">{lead.score}</p>
          <p className="text-[11px] text-accent">{lead.intent_label}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {lead.tags.map((tag) => (
          <span key={tag} className="rounded border border-white/10 px-2 py-1 text-[11px] text-text-dim">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          className="rounded border border-white/10 px-3 py-2 text-xs text-text-dim transition hover:border-white/30 hover:text-white"
          onClick={() => onSelect(lead)}
        >
          View Context
        </button>
        <button
          type="button"
          className="rounded bg-accent px-3 py-2 text-xs font-semibold text-ink transition hover:bg-accent/90"
          onClick={() => onGenerateDraft(lead)}
        >
          Generate Draft
        </button>
      </div>
    </motion.article>
  );
};
