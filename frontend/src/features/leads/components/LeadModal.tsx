import { AnimatePresence, motion } from "framer-motion";

import type { ManageLead, ManageLeadStage } from "../types/manageLead";

type LeadModalProps = {
  lead: ManageLead | null;
  open: boolean;
  variant?: "dialog" | "hover";
  position?: { x: number; y: number } | null;
  onClose: () => void;
  onDelete: () => void;
  onMoveNext: () => void;
  onMoveToContacted?: () => void;
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
  NEGOTIATION: null,
};

export const LeadModal = ({
  lead,
  open,
  variant = "dialog",
  position,
  onClose,
  onDelete,
  onMoveNext,
  onMoveToContacted,
  onSendMessage,
  onScheduleCall,
  onEdit,
  onMouseEnter,
  onMouseLeave,
}: LeadModalProps) => {
  if (!lead) return null;

  const nextStage = stageNextMap[lead.stage];
  const isHover = variant === "hover";
  const isLastStage = lead.stage === "RESPONDED";

  // Calculate position for hover modal
  const hoverStyle = position
    ? { left: Math.min(position.x + 16, window.innerWidth - 340), top: Math.min(position.y, window.innerHeight - 400) }
    : { right: 24, top: 96 };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={isHover ? "fixed z-[90]" : "fixed inset-0 z-[100] flex items-center justify-center bg-surface/80 backdrop-blur-sm px-4"}
          style={isHover ? hoverStyle : undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isHover ? undefined : onClose}
        >
          <motion.section
            className={`glass-card-lg w-full p-4 ${
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
                <h3 className="text-xl font-semibold text-content">{lead.name}</h3>
                <p className="text-sm text-content-secondary">{lead.company}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="glass-btn px-2 py-1 text-xs"
              >
                Close
              </button>
            </div>

            <div className="mt-3 grid gap-2 text-xs text-content-secondary md:grid-cols-2">
              <p>📧 {lead.email || "N/A"}</p>
              <p>📱 {lead.phone || "N/A"}</p>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="badge-info">Score {lead.score}</span>
              <span className="badge-success">Budget {formatMoney(lead.budget_estimate)}</span>
              <span className="badge-accent">Stage {lead.stage}</span>
            </div>

            <div className="glass-card-sm mt-3 p-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge-warning">
                  Pain: {lead.ai_analysis.pain_points[0] ?? "Unknown"}
                </span>
                <span className="badge-accent">
                  Fix: {lead.ai_analysis.suggested_pitch || "No suggestion"}
                </span>
                <span className="badge-success">
                  Deal: {lead.ai_analysis.deal_probability}%
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onSendMessage}
                className="glass-btn px-3 py-1.5 text-xs"
              >
                ⚡ Send Message
              </button>
              <button
                type="button"
                onClick={onScheduleCall}
                className="glass-btn px-3 py-1.5 text-xs"
              >
                📞 Call
              </button>
              <button
                type="button"
                onClick={onMoveNext}
                disabled={!nextStage}
                className={`rounded-glass-sm px-3 py-1.5 text-xs font-semibold transition ${
                  nextStage
                    ? "accent-btn"
                    : "cursor-not-allowed border border-accent/10 bg-surface-secondary/80 text-content-tertiary"
                }`}
              >
                ➡ Move Next{nextStage ? ` (${nextStage})` : " (Final Stage)"}
              </button>
              {isLastStage && onMoveToContacted ? (
                <button
                  type="button"
                  onClick={onMoveToContacted}
                  className="rounded-glass-sm bg-success px-3 py-1.5 text-xs font-semibold text-content-inverse shadow-[0_0_16px_rgba(16,185,129,0.3)] transition hover:shadow-[0_0_24px_rgba(16,185,129,0.5)]"
                >
                  ✓ Move to Negotiation
                </button>
              ) : null}
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
                className="rounded-glass-sm border border-danger/30 bg-danger-soft px-3 py-1.5 text-xs text-danger transition hover:shadow-[0_0_16px_rgba(239,68,68,0.3)]"
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
