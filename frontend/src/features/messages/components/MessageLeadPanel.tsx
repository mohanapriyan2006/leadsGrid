import { Avatar } from "../../../components/ui/Avatar";
import type { ManageLead } from "../../leads/types/manageLead";

type MessageLeadPanelProps = {
  contextPreviewLimit: number;
  loading: boolean;
  leads: ManageLead[];
  selectedLeadId: string | null;
  selectedLead: ManageLead | null;
  leadContext: string;
  trimmedContent: string;
  contextExpanded: boolean;
  isGenerating: boolean;
  onLeadChange: (leadId: string) => void;
  onToggleContext: () => void;
  onOpenDetails: () => void;
  onGenerate: () => void;
};

export const MessageLeadPanel = ({
  contextPreviewLimit,
  loading,
  leads,
  selectedLeadId,
  selectedLead,
  leadContext,
  trimmedContent,
  contextExpanded,
  isGenerating,
  onLeadChange,
  onToggleContext,
  onOpenDetails,
  onGenerate,
}: MessageLeadPanelProps) => {
  return (
    <aside className="glass-card space-y-3 p-4">
      <label className="text-xs tracking-[0.1em] text-content-tertiary" htmlFor="lead-select">
        SELECT LEAD
      </label>
      <select
        id="lead-select"
        value={selectedLeadId || ""}
        onChange={(event) => onLeadChange(event.target.value)}
        className="glass-input"
        disabled={loading}
      >
        {loading ? (
          <option className="bg-surface-tertiary text-content">Loading leads...</option>
        ) : leads.length === 0 ? (
          <option className="bg-surface-tertiary text-content">No leads available</option>
        ) : (
          leads.map((lead) => (
            <option key={lead.id} value={lead.id} className="bg-surface-tertiary text-content">
              {lead.name} - {lead.company}
            </option>
          ))
        )}
      </select>

      {selectedLead ? (
        <div className="glass-card-sm p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs tracking-[0.1em] text-content-tertiary">CLIENT CONTEXT</p>
            <button
              type="button"
              onClick={onOpenDetails}
              className="glass-btn px-2 py-1 text-[10px] uppercase tracking-[0.08em]"
            >
              Details
            </button>
          </div>
          <div className="flex gap-3">
            <Avatar initials={selectedLead.name.slice(0, 2).toUpperCase()} size={40} />
            <div>
              <p className="text-sm font-semibold text-content">{selectedLead.name}</p>
              <p className="text-xs text-content-tertiary">{selectedLead.company}</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-content-secondary">
            {contextExpanded ? leadContext : trimmedContent}
          </p>
          {leadContext.length > contextPreviewLimit ? (
            <button
              type="button"
              onClick={onToggleContext}
              className="mt-1 text-xs font-semibold text-accent hover:text-accent-secondary"
            >
              {contextExpanded ? "View less" : "View more"}
            </button>
          ) : null}
          <div className="mt-2 space-y-1 text-xs">
            <p className="text-accent">Stage: {selectedLead.stage}</p>
            <p className="text-content-tertiary">Score: {selectedLead.score}/100</p>
          </div>
        </div>
      ) : (
        <div className="glass-card-sm p-3 text-center text-content-secondary">No lead selected</div>
      )}

      <button
        type="button"
        onClick={onGenerate}
        disabled={isGenerating}
        className="accent-btn w-full text-xs font-bold tracking-[0.1em] disabled:opacity-60"
      >
        {isGenerating ? "GENERATING..." : "GENERATE DRAFT"}
      </button>
    </aside>
  );
};
