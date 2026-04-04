import { useEffect, useMemo, useState } from "react";

import type { Lead } from "../../leads/types/lead";

type AttachLeadsModalProps = {
  open: boolean;
  leads: Lead[];
  selectedLeadIds: string[];
  onClose: () => void;
  onApply: (leadIds: string[]) => void;
};

const shortTitle = (lead: Lead): string => {
  const base = (lead.title || lead.author || lead.summary || "Untitled lead").trim();
  if (base.length <= 36) return base;
  return `${base.slice(0, 33)}...`;
};

export const AttachLeadsModal = ({
  open,
  leads,
  selectedLeadIds,
  onClose,
  onApply,
}: AttachLeadsModalProps) => {
  const [search, setSearch] = useState("");
  const [draftSelection, setDraftSelection] = useState<string[]>(selectedLeadIds);

  useEffect(() => {
    if (open) {
      setDraftSelection(selectedLeadIds);
      setSearch("");
    }
  }, [open, selectedLeadIds]);

  const filteredLeads = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return leads;

    return leads.filter((lead) => {
      const text = `${lead.author} ${lead.title || ""} ${lead.summary}`.toLowerCase();
      return text.includes(keyword);
    });
  }, [leads, search]);

  const toggleLead = (leadId: string) => {
    setDraftSelection((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId],
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-accent/[0.12] bg-surface-secondary p-4 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-content">Attach Leads</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-accent/[0.1] px-2 py-1 text-xs text-content-secondary transition hover:text-content"
          >
            Close
          </button>
        </div>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search leads by title, author, or summary..."
          className="mb-3 w-full rounded-xl border border-accent/[0.1] bg-surface/60 px-3 py-2 text-sm text-content outline-none placeholder:text-content-tertiary/70 focus:border-accent/35"
        />

        <div className="max-h-[320px] space-y-2 overflow-auto pr-1">
          {filteredLeads.length === 0 ? (
            <p className="rounded-xl border border-accent/[0.08] bg-surface/40 px-3 py-4 text-sm text-content-secondary">
              No leads found for this query.
            </p>
          ) : (
            filteredLeads.map((lead) => {
              const selected = draftSelection.includes(lead.id);
              return (
                <label
                  key={lead.id}
                  className={`flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 transition ${
                    selected
                      ? "border-accent/35 bg-accent/[0.08]"
                      : "border-accent/[0.08] bg-surface/45 hover:border-accent/20"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleLead(lead.id)}
                    className="mt-0.5 h-4 w-4 accent-accent"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-content" title={lead.title || lead.author}>
                      {shortTitle(lead)}
                    </p>
                    <p className="truncate text-xs text-content-secondary">{lead.author} • score {lead.score}</p>
                  </div>
                </label>
              );
            })
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-accent/[0.08] pt-3">
          <span className="text-xs text-content-secondary">{draftSelection.length} selected</span>
          <button
            type="button"
            onClick={() => setDraftSelection([])}
            className="ml-auto rounded-lg border border-accent/[0.1] px-2.5 py-1 text-xs text-content-secondary transition hover:text-content"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(draftSelection);
              onClose();
            }}
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-content-inverse transition hover:bg-accent-secondary"
          >
            Attach Selected
          </button>
        </div>
      </div>
    </div>
  );
};
