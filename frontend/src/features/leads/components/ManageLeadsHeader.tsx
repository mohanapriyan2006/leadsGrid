import type { ReactNode } from "react";

import type { ManageLeadInsights, ManageLeadView } from "../types/manageLead";

import { VIEW_OPTIONS } from "../constants/manageLeads";

type ManageLeadsHeaderProps = {
  manageLeadView: ManageLeadView;
  insights: ManageLeadInsights | null;
  search: string;
  onlyHot: boolean;
  disableDetailsPopup: boolean;
  utilityControl?: ReactNode;
  uploadControl: ReactNode;
  onViewChange: (view: ManageLeadView) => void;
  onSearchChange: (value: string) => void;
  onToggleOnlyHot: () => void;
  onTogglePopup: () => void;
  onToggleAddLead: () => void;
};

export const ManageLeadsHeader = ({
  manageLeadView,
  insights,
  search,
  onlyHot,
  disableDetailsPopup,
  utilityControl,
  uploadControl,
  onViewChange,
  onSearchChange,
  onToggleOnlyHot,
  onTogglePopup,
  onToggleAddLead,
}: ManageLeadsHeaderProps) => {
  return (
    <header className="glass-card-lg p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="bg-gradient-to-r from-content via-accent to-accent-secondary bg-clip-text text-3xl font-semibold text-transparent">
            Manage Leads
          </h2>
          <p className="mt-1 text-sm text-content-secondary">
            Not a CRM. A lead conversion engine.
          </p>
        </div>
        <div className="flex items-center gap-2 md:flex-row flex-col">
          {utilityControl}

          <div className="glass-card-sm  gap-1 inline-flex p-1 text-[11px]">
            {VIEW_OPTIONS.map((view) => (
              <button
                key={view.value}
                type="button"
                onClick={() => onViewChange(view.value)}
                className={`rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-all duration-200 ${
                  manageLeadView === view.value
                    ? "bg-gradient-to-r from-accent to-accent-secondary text-content-inverse shadow-glow"
                    : "border border-accent/10 bg-surface-secondary/80 text-content hover:border-accent/30 hover:text-content-secondary"
                }  ${view.value === "analytics" ? "relative p-4 animate-pulseGlow  " : ""}  `}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="glass-card-sm p-3">
          <p className="text-[11px] uppercase tracking-[0.18em]  text-content-tertiaryy">
            Hot leads
          </p>
          <p className="text-2xl font-semibold text-danger">
            {insights?.hot_leads_need_reply ?? 0}
          </p>
        </div>
        <div className="glass-card-sm p-3">
          <p className="text-[11px] uppercase tracking-[0.18em]  text-content-tertiaryy">
            Going cold
          </p>
          <p className="text-2xl font-semibold text-warning">
            {insights?.leads_going_cold ?? 0}
          </p>
        </div>
        <div className="glass-card-sm p-3">
          <p className="text-[11px] uppercase tracking-[0.18em]  text-content-tertiaryy">
            Likely to close
          </p>
          <p className="text-2xl font-semibold text-success">
            {insights?.leads_likely_to_close ?? 0}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name/company/email/phone"
          className="glass-input min-w-[220px] flex-1"
        />
        <button
          type="button"
          onClick={onToggleOnlyHot}
          className="glass-btn text-xs"
        >
          {onlyHot ? "Hot only: on" : "Hot only"}
        </button>
        <button
          type="button"
          onClick={onTogglePopup}
          className={`glass-btn text-xs ${disableDetailsPopup ? "text-danger" : "text-success"}`}
          title={
            disableDetailsPopup
              ? "Click to enable details popup"
              : "Click to disable details popup"
          }
        >
          {disableDetailsPopup ? "🚫 Popups Off" : "✓ Popups On"}
        </button>
        {uploadControl}
        <button
          type="button"
          onClick={onToggleAddLead}
          className="glass-btn text-xs"
        >
          Add Lead
        </button>
      </div>
    </header>
  );
};
