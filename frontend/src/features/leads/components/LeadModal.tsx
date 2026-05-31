import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Mail, Smartphone, Tag, Star, MapPin, Globe, Map, Pencil, Zap, Phone, ArrowRight, Check } from "lucide-react";

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
  onNotesUpdate?: (notes: string) => void;
  disableAutoPopup?: boolean;
};

const formatMoney = (amount: number) => `$${amount.toLocaleString()}`;

const stageNextMap: Record<ManageLeadStage, ManageLeadStage | null> = {
  NEW: "QUALIFIED",
  QUALIFIED: "CONTACTED",
  CONTACTED: "RESPONDED",
  RESPONDED: null,
  NEGOTIATION: null,
  CONTRACTED: null,
  IN_PROGRESS: null,
  CLOSED: null,
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
  onNotesUpdate,
  disableAutoPopup,
}: LeadModalProps) => {
  if (!lead) return null;

  const nextStage = stageNextMap[lead.stage];
  const isHover = variant === "hover";
  const isLastStage = lead.stage === "RESPONDED";

  // Notes state
  const [notes, setNotes] = useState(lead.notes || "");
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Update notes when lead changes
  useEffect(() => {
    setNotes(lead.notes || "");
  }, [lead.notes, lead.id]);

  // Save notes
  const handleSaveNotes = () => {
    onNotesUpdate?.(notes);
    setIsEditingNotes(false);
  };

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
            {/* Draggable header area */}
            <div
              className={`flex items-start justify-between gap-3 cursor-grab active:cursor-grabbing`}
            >
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-content">{lead.name}</h3>
                <p className="text-sm text-content-secondary">{lead.company}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px]  ">⋮⋮ Drag</span>
                <button
                  type="button"
                  onClick={onClose}
                  className="glass-btn px-2 py-1 text-xs"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="mt-3 grid gap-2 text-xs text-content-secondary md:grid-cols-2">
              <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {lead.email || "N/A"}</p>
              <p className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5" /> {lead.phone || "N/A"}</p>
              {lead.category && <p className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Category: {lead.category}</p>}
              {lead.rating && <p className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> Rating: {lead.rating} ({lead.review_count ?? 0} reviews)</p>}
              {lead.address && <p className="md:col-span-2 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {lead.address}</p>}
              {lead.website_url && (
                <p className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <a href={lead.website_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                    Website
                  </a>
                </p>
              )}
              {lead.google_maps_url && (
                <p className="flex items-center gap-1.5">
                  <Map className="w-3.5 h-3.5" />
                  <a href={lead.google_maps_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                    Google Maps
                  </a>
                </p>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs ">
              <span className="badge-info">Score {lead.score}</span>
              <span className="badge-success">Budget {formatMoney(lead.budget_estimate)}</span>
              <span className="badge-accent">Stage {lead.stage}</span>
            </div>

            <div className="glass-card-sm mt-3 p-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge-warning">
                  Pain: {lead.ai_analysis.pain_points[0] ?? "Unknown"}
                </span>
                {lead.ai_analysis.decision_maker ? (
                  <span className="badge-info">Decision: {lead.ai_analysis.decision_maker}</span>
                ) : null}
                {lead.ai_analysis.qualification_status ? (
                  <span className="badge-success">{lead.ai_analysis.qualification_status}</span>
                ) : null}
                {(lead.ai_analysis.buying_signals ?? []).slice(0, 3).map((signal) => (
                  <span key={signal} className="badge-warning">
                    {signal}
                  </span>
                ))}
                <span className="badge-accent">
                  Fix: {lead.ai_analysis.suggested_pitch || "No suggestion"}
                </span>
                <span className="badge-success">
                  Deal: {lead.ai_analysis.deal_probability}%
                </span>
              </div>
            </div>

            {/* Notes Section */}
            <div className="glass-card-sm mt-3 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold   uppercase tracking-[0.08em]">Notes</span>
                {!isEditingNotes ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingNotes(true)}
                    className="text-[10px] text-accent hover:text-accent-secondary"
                  >
                    <Pencil className="w-3.5 h-3.5 inline mr-1" /> Edit
                  </button>
                ) : (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      className="text-[10px] text-success hover:text-success"
                    >
                      <Check className="w-3.5 h-3.5 inline mr-1" /> Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNotes(lead.notes || "");
                        setIsEditingNotes(false);
                      }}
                      className="text-[10px] text-danger hover:text-danger"
                    >
                      <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Cancel</span>
                    </button>
                  </div>
                )}
              </div>
              {isEditingNotes ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this lead..."
                  className="glass-input w-full min-h-[80px] p-2 text-xs resize-y"
                />
              ) : (
                <p className="text-xs max-h-40 overflow-y-auto text-content-secondary whitespace-pre-wrap">
                  {notes || "No notes added yet."}
                </p>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onSendMessage}
                className="glass-btn px-3 py-1.5 text-xs"
              >
                <Zap className="w-3.5 h-3.5 inline mr-1" /> Send Message
              </button>
              <button
                type="button"
                onClick={onScheduleCall}
                className="glass-btn px-3 py-1.5 text-xs"
              >
                <Phone className="w-3.5 h-3.5 inline mr-1" /> Call
              </button>
              <button
                type="button"
                onClick={onMoveNext}
                disabled={!nextStage}
                className={`rounded-glass-sm px-3 py-1.5 text-xs font-semibold transition ${
                  nextStage
                    ? "accent-btn"
                    : "cursor-not-allowed border border-accent/10 bg-surface-secondary/80  "
                }`}
              >
                <ArrowRight className="w-3.5 h-3.5 inline mr-1" /> Move Next{nextStage ? ` (${nextStage})` : " (Final Stage)"}
              </button>
              {isLastStage && onMoveToContacted ? (
                <button
                  type="button"
                  onClick={onMoveToContacted}
                  className="rounded-glass-sm bg-success px-3 py-1.5 text-xs font-semibold text-content-inverse shadow-[0_0_16px_rgba(16,185,129,0.3)] transition hover:shadow-[0_0_24px_rgba(16,185,129,0.5)]"
                >
                  <Check className="w-3.5 h-3.5 inline mr-1" /> Move to Negotiation
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
