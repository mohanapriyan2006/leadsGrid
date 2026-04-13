import { useState, useEffect, useRef } from "react";
import { Avatar } from "../../../components/ui/Avatar";
import type { ManageLead } from "../../leads/types/manageLead";

const trimOptionText = (name: string, company: string, maxLength = 50): string => {
  const fullText = `${name} - ${company}`;
  if (fullText.length <= maxLength) return fullText;
  // Reserve space for " - " and "..."
  const availableLength = maxLength - 6;
  const nameLength = Math.min(name.length, Math.floor(availableLength * 0.6));
  const companyLength = availableLength - nameLength;
  const trimmedName = name.slice(0, nameLength) + (name.length > nameLength ? "..." : "");
  const trimmedCompany = company.slice(0, companyLength) + (company.length > companyLength ? "..." : "");
  return `${trimmedName} - ${trimmedCompany}`;
};

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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (leadId: string) => {
    onLeadChange(leadId);
    setIsOpen(false);
  };

  return (
    <aside className="glass-card overflow-auto space-y-3 p-4">
      <label className="text-xs tracking-[0.1em] text-content-tertiary">
        SELECT LEAD
      </label>
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => !loading && setIsOpen(!isOpen)}
          disabled={loading}
          className="glass-input w-full text-left flex items-center justify-between"
        >
          <span className={selectedLead ? "text-content" : "text-content-tertiary"}>
            {loading
              ? "Loading leads..."
              : selectedLead
                ? trimOptionText(selectedLead.name, selectedLead.company)
                : leads.length === 0
                  ? "No leads available"
                  : "Select a lead"}
          </span>
          <svg
            className={`h-4 w-4 text-content-secondary transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full rounded-xl border border-accent/20 bg-surface-secondary shadow-lg max-h-48 overflow-auto">
            {leads.length === 0 ? (
              <div className="px-3 py-2 text-sm text-content-secondary">No leads available</div>
            ) : (
              leads.map((lead) => (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() => handleSelect(lead.id)}
                  className={`w-full px-3 py-2 text-left text-sm transition hover:bg-accent/10 ${
                    lead.id === selectedLeadId ? "bg-accent/20 text-content" : "text-content-secondary"
                  }`}
                  title={`${lead.name} - ${lead.company}`}
                >
                  {trimOptionText(lead.name, lead.company)}
                </button>
              ))
            )}
          </div>
        )}
      </div>

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
          <p className="mt-2 text-sm text-content-secondary overflow-auto">
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
