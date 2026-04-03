import { AnimatePresence, motion } from "framer-motion";

import type { DealStatus } from "../../common/types/ui";
import type { Deal } from "../types/crm";

type DealModalProps = {
  deal: Deal | null;
  open: boolean;
  variant?: "hover" | "dialog";
  position?: { x: number; y: number } | null;
  onClose: () => void;
  onDelete: () => void;
  onEdit?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

const getStatusColor = (status: DealStatus) => {
  switch (status) {
    case "negotiation":
      return "text-info";
    case "contracted":
      return "text-success";
    case "in-progress":
      return "text-warning";
    case "closed":
      return "text-accent-secondary";
    default:
      return "text-content-secondary";
  }
};

const getProgress = (status: DealStatus) => {
  switch (status) {
    case "negotiation":
      return 25;
    case "contracted":
      return 50;
    case "in-progress":
      return 75;
    case "closed":
      return 100;
    default:
      return 0;
  }
};

export const DealModal = ({
  deal,
  open,
  variant = "hover",
  position,
  onClose,
  onDelete,
  onEdit,
  onMouseEnter,
  onMouseLeave,
}: DealModalProps) => {
  if (!deal) return null;

  const isHover = variant === "hover";
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1280;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 720;

  const hoverStyle = position
    ? {
        left: Math.min(position.x + 16, viewportWidth - 380),
        top: Math.min(position.y, viewportHeight - 400),
      }
    : { right: 24, top: 96 };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={
            isHover
              ? "fixed z-[90]"
              : "fixed inset-0 z-[100] flex items-center justify-center bg-surface/80 backdrop-blur-sm px-4"
          }
          style={isHover ? hoverStyle : undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isHover ? undefined : onClose}
        >
          <motion.section
            className={`glass-card-lg w-full p-4 ${isHover ? "max-w-sm" : "max-w-md"}`}
            drag
            dragMomentum={false}
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.985 }}
            transition={{ duration: 0.16 }}
            onClick={(event) => event.stopPropagation()}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <div className="flex items-start justify-between gap-3 cursor-grab active:cursor-grabbing">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-content">{deal.name}</h3>
                <p className="text-sm text-content-secondary">{deal.company}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-content-tertiary">⋮⋮ Drag</span>
                <button type="button" onClick={onClose} className="glass-btn px-2 py-1 text-xs">
                  Close
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-content-tertiary uppercase tracking-[0.1em]">Pipeline Progress</span>
                <span className={`font-semibold ${getStatusColor(deal.status)}`}>
                  {getProgress(deal.status)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-accent-secondary transition-all duration-500"
                  style={{ width: `${getProgress(deal.status)}%` }}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="badge-info">Score {deal.score}</span>
              <span className={`badge-success ${getStatusColor(deal.status)}`}>
                Status {deal.status}
              </span>
              <span className="badge-accent">Value {deal.value}</span>
            </div>

            <div className="glass-card-sm mt-4 p-3 text-xs">
              <p className="text-content-tertiary uppercase tracking-[0.08em] mb-2">Contact Info</p>
              <div className="grid gap-1 text-content-secondary">
                {deal.email && <p>📧 {deal.email}</p>}
                {deal.phone && <p>📱 {deal.phone}</p>}
                <p>📅 Last Action: {deal.lastAction}</p>
                <p>⏱️ Days in Stage: {deal.daysInStage}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="glass-card-sm p-2 text-center">
                <p className="text-[10px] text-content-tertiary uppercase tracking-[0.08em]">Deal Value</p>
                <p className="text-sm font-semibold text-success">{deal.value}</p>
              </div>
              <div className="glass-card-sm p-2 text-center">
                <p className="text-[10px] text-content-tertiary uppercase tracking-[0.08em]">Quality Score</p>
                <p className="text-sm font-semibold text-accent">{deal.score}/100</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {onEdit && (
                <button type="button" onClick={onEdit} className="glass-btn px-3 py-1.5 text-xs">
                  ✏️ Edit
                </button>
              )}
              <button
                type="button"
                onClick={onDelete}
                className="rounded-glass-sm border border-danger/30 bg-danger-soft px-3 py-1.5 text-xs text-danger transition hover:shadow-[0_0_16px_rgba(239,68,68,0.3)]"
              >
                🗑️ Delete
              </button>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
