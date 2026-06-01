import type { MouseEvent } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";

import { formatMoney, fromNow } from "../constants/manageLeads";
import type { ManageLead } from "../types/manageLead";

type ManageLeadsBoardCardProps = {
  lead: ManageLead;
  onHoverStart: (leadId: string, event: MouseEvent) => void;
  onHoverEnd: (leadId: string) => void;
  onEdit?: () => void;
};

export const ManageLeadsBoardCard = ({
  lead,
  onHoverStart,
  onHoverEnd,
  onEdit,
}: ManageLeadsBoardCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lead.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <motion.article
      ref={setNodeRef}
      style={style}
      layout
      {...attributes}
      {...listeners}
      onMouseEnter={(event) => onHoverStart(lead.id, event)}
      onMouseLeave={() => onHoverEnd(lead.id)}
      className={`glass-card-sm cursor-grab p-3 text-xs transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-glow active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-content">{lead.name}</p>
        {onEdit ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="rounded-glass-sm p-1 text-content-secondary transition hover:bg-accent/10 hover:text-accent"
            title="Edit lead"
          >
            <Pencil className="w-3 h-3" />
          </button>
        ) : null}
      </div>
      <p className="text-[11px] text-content-secondary">{lead.company}</p>
      <div className="mt-3 flex items-center gap-2 text-[11px]  ">
        <span>Score {lead.score}</span>
        <span>|</span>
        <span>{formatMoney(lead.budget_estimate)}</span>
        <span>|</span>
        <span>{fromNow(lead.last_activity_at)}</span>
      </div>
    </motion.article>
  );
};
