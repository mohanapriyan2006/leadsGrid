import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [page, setPage] = useState(1);
  const [draftSelection, setDraftSelection] = useState<string[]>(selectedLeadIds);
  const PAGE_SIZE = 20;

  useEffect(() => {
    if (open) {
      setDraftSelection(selectedLeadIds);
      setSearch("");
      setPage(1);
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

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedLeads = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredLeads.slice(start, start + PAGE_SIZE);
  }, [filteredLeads, safePage]);

  const paginatedLeadIds = useMemo(() => paginatedLeads.map((lead) => lead.id), [paginatedLeads]);
  const allPaginatedSelected =
    paginatedLeadIds.length > 0 && paginatedLeadIds.every((leadId) => draftSelection.includes(leadId));

  const toggleSelectAllPaginated = () => {
    if (paginatedLeadIds.length === 0) return;

    setDraftSelection((prev) => {
      if (allPaginatedSelected) {
        return prev.filter((id) => !paginatedLeadIds.includes(id));
      }
      return Array.from(new Set([...prev, ...paginatedLeadIds]));
    });
  };

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

        <div className="flex items-center gap-3 mb-3">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search leads by title, author, or summary..."
            className="flex-1 rounded-xl border border-accent/[0.1] bg-surface/60 px-3 py-2 text-sm text-content outline-none placeholder:text-content-tertiary/70 focus:border-accent/35"
          />
          <span className="text-xs text-content-secondary whitespace-nowrap">
            {filteredLeads.length} leads
          </span>
        </div>

        <div className="max-h-[320px] space-y-2 overflow-auto pr-1">
          {filteredLeads.length === 0 ? (
            <p className="rounded-xl border border-accent/[0.08] bg-surface/40 px-3 py-4 text-sm text-content-secondary">
              No leads found for this query.
            </p>
          ) : (
            paginatedLeads.map((lead) => {
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-3 flex items-center justify-between border-t border-accent/[0.08] pt-2">
            <span className="text-[10px] text-content-secondary">
              Page {safePage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="rounded-md p-1 text-content-secondary transition hover:bg-accent/10 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <select
                value={safePage}
                onChange={(e) => setPage(Number(e.target.value))}
                className="glass-input appearance-none px-2 py-1 text-[10px] text-center cursor-pointer min-w-[50px]"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="rounded-md p-1 text-content-secondary transition hover:bg-accent/10 disabled:opacity-40"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 border-t border-accent/[0.08] pt-3">
          <span className="text-xs text-content-secondary">{draftSelection.length} selected</span>
          <button
            type="button"
            onClick={toggleSelectAllPaginated}
            disabled={paginatedLeadIds.length === 0}
            className="ml-auto rounded-lg border border-accent/[0.1] px-2.5 py-1 text-xs text-content-secondary transition hover:text-content disabled:cursor-not-allowed disabled:opacity-50"
          >
            {allPaginatedSelected ? "Unselect All" : "Select All"}
          </button>
          <button
            type="button"
            onClick={() => setDraftSelection([])}
            className="rounded-lg border border-accent/[0.1] px-2.5 py-1 text-xs text-content-secondary transition hover:text-content"
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
