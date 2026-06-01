import type { ReactNode } from "react";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { ManageLeadsBoardCard } from "./ManageLeadsBoardCard";
import type { ManageLead, ManageLeadStage } from "../types/manageLead";

type ManageLeadsStageColumnProps = {
  stage: { id: ManageLeadStage; label: string; icon: React.ElementType };
  leads: ManageLead[];
  onHoverStart: (leadId: string, event: React.MouseEvent) => void;
  onHoverEnd: (leadId: string) => void;
  onAddLead: () => void;
  uploadControl: ReactNode;
  onEdit?: (leadId: string) => void;
};

export const ManageLeadsStageColumn = ({
  stage,
  leads,
  onHoverStart,
  onHoverEnd,
  onAddLead,
  uploadControl,
  onEdit,
}: ManageLeadsStageColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <section
      ref={setNodeRef}
      className={`glass-card group flex flex-col p-3 transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-glow ${
        isOver ? "border-accent/50 ring-1 ring-accent/30 shadow-glow" : ""
      }`}
    >
      <div className="mb-3 rounded-glass-sm border border-accent/15 bg-gradient-to-r from-accent/10 to-accent-secondary/5 px-3 py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-content flex items-center gap-1.5">
            <stage.icon className="w-3.5 h-3.5" /> {stage.label}
          </h3>
          <span className="badge-accent px-2 py-0.5 text-[11px]">{leads.length}</span>
        </div>
      </div>

      <SortableContext
        items={leads.map((lead) => lead.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
          {leads.length === 0 ? (
            <div className="rounded-glass-sm border border-dashed border-accent/15 bg-surface-secondary/50 p-5 text-center text-xs text-content-secondary">
              <p>No leads here yet</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                {uploadControl}
                <button
                  type="button"
                  className="glass-btn px-2 py-1 text-xs"
                  onClick={onAddLead}
                >
                  Add Lead
                </button>
              </div>
            </div>
          ) : null}

          {leads.map((lead) => (
            <ManageLeadsBoardCard
              key={lead.id}
              lead={lead}
              onHoverStart={onHoverStart}
              onHoverEnd={onHoverEnd}
              onEdit={onEdit ? () => onEdit(lead.id) : undefined}
            />
          ))}
        </div>
      </SortableContext>
    </section>
  );
};
