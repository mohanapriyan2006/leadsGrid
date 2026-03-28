import { AnimatePresence, motion } from "framer-motion";

import type { ManageLead, ManageLeadStage } from "../types/manageLead";

type LeadModalProps = {
  lead: ManageLead | null;
  open: boolean;
  variant?: "dialog" | "hover";
  onClose: () => void;
  onDelete: () => void;
  onMoveNext: () => void;
  onSendMessage: () => void;
  onScheduleCall: () => void;
  onEdit?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

const formatMoney = (amount: number) => `$${amount.toLocaleString()}`;

const stageNextMap: Record<ManageLeadStage, ManageLeadStage | null> = {
  NEW: "QUALIFIED",
  QUALIFIED: "CONTACTED",
  CONTACTED: "RESPONDED",
  RESPONDED: null,
  CONTRACTED: null,
};

export const LeadModal = ({
  lead,
  open,
  variant = "dialog",
  onClose,
  onDelete,
  onMoveNext,
  onSendMessage,
  onScheduleCall,
  onEdit,
  onMouseEnter,
  onMouseLeave,
}: LeadModalProps) => {
  if (!lead) return null;

  const nextStage = stageNextMap[lead.stage];
  const isHover = variant === "hover";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={isHover ? "fixed right-6 top-24 z-[90]" : "fixed inset-0 z-[100] flex items-center justify-center bg-black/65 px-4"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isHover ? undefined : onClose}
        >
          <motion.section
            className={`w-full rounded-2xl border border-white/10 bg-slate-950/95 p-4 shadow-[0_20px_55px_rgba(2,6,23,0.88)] ${
              isHover ? "max-w-sm" : "max-w-2xl"
            }`}
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.985 }}
            transition={{ duration: 0.16 }}
            onClick={(event) => event.stopPropagation()}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-white">{lead.name}</h3>
                <p className="text-sm text-text-dim">{lead.company}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-white/15 bg-black/30 px-2 py-1 text-xs text-text-dim"
              >
                Close
              </button>
            </div>

            <div className="mt-3 grid gap-2 text-xs text-text-dim md:grid-cols-2">
              <p>📧 {lead.email || "N/A"}</p>
              <p>📱 {lead.phone || "N/A"}</p>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-cyan-300/35 bg-cyan-500/15 px-2 py-1 text-cyan-100">Score {lead.score}</span>
              <span className="rounded-full border border-emerald-300/35 bg-emerald-500/15 px-2 py-1 text-emerald-100">Budget {formatMoney(lead.budget_estimate)}</span>
              <span className="rounded-full border border-white/15 bg-black/35 px-2 py-1 text-text-dim">Stage {lead.stage}</span>
            </div>

            <div className="mt-3 rounded-xl border border-cyan-300/25 bg-cyan-500/10 p-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-amber-300/30 bg-amber-500/15 px-2 py-0.5 text-amber-100">
                  Pain: {lead.ai_analysis.pain_points[0] ?? "Unknown"}
                </span>
                <span className="rounded-full border border-violet-300/30 bg-violet-500/15 px-2 py-0.5 text-violet-100">
                  Fix: {lead.ai_analysis.suggested_pitch || "No suggestion"}
                </span>
                <span className="rounded-full border border-emerald-300/30 bg-emerald-500/15 px-2 py-0.5 text-emerald-100">
                  Deal: {lead.ai_analysis.deal_probability}%
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onSendMessage}
                className="rounded-lg border border-white/15 bg-black/35 px-3 py-1.5 text-xs text-white"
              >
                ⚡ Send Message
              </button>
              <button
                type="button"
                onClick={onScheduleCall}
                className="rounded-lg border border-white/15 bg-black/35 px-3 py-1.5 text-xs text-white"
              >
                📞 Call
              </button>
              <button
                type="button"
                onClick={onMoveNext}
                disabled={!nextStage}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  nextStage
                    ? "bg-cyan-400 text-slate-950"
                    : "cursor-not-allowed border border-white/15 bg-black/35 text-text-dim"
                }`}
              >
                ➡ Move Next{nextStage ? ` (${nextStage})` : " (Final Stage)"}
              </button>
              {onEdit ? (
                <button
                  type="button"
                  onClick={onEdit}
                  className="rounded-lg border border-white/15 bg-black/35 px-3 py-1.5 text-xs text-white"
                >
                  Edit
                </button>
              ) : null}
              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg border border-rose-300/35 bg-rose-500/20 px-3 py-1.5 text-xs text-rose-100"
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
