import type { MouseEvent } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pencil } from "lucide-react";

import { ScoreBadge } from "../../../components/ui/ScoreBadge";
import type { Deal } from "../types/crm";

type KanbanCardProps = {
  deal: Deal;
  index: number;
  onHoverStart: (dealId: string, event: MouseEvent) => void;
  onHoverEnd: (dealId: string) => void;
  onEdit?: () => void;
};

export const KanbanCard = ({
  deal,
  index,
  onHoverStart,
  onHoverEnd,
  onEdit,
}: KanbanCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: deal.id });

  const baseStyle = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      id={deal.id}
      onMouseEnter={(event) => onHoverStart(deal.id, event)}
      onMouseLeave={() => onHoverEnd(deal.id)}
      {...attributes}
      {...listeners}
      className={`glass-card-sm cursor-grab p-2.5 text-xs outline-none transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-glow active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
      style={{
        ...baseStyle,
        animation: `fadeInUp 0.35s ease-out ${index * 0.04}s both`,
      }}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-sm text-content">{deal.name}</p>
        <div className="flex items-center gap-1.5">
          {onEdit ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="rounded-glass-sm p-1 text-content-secondary transition hover:bg-accent/10 hover:text-accent"
              title="Edit deal"
            >
              <Pencil className="w-3 h-3" />
            </button>
          ) : null}
          <ScoreBadge score={deal.score} />
        </div>
      </div>
      <p className="text-[11px] text-content-secondary">{deal.company}</p>
      <p className="mt-1 text-[11px]  ">{deal.lastAction}</p>
      <p className="mt-1 text-sm font-semibold text-success">{deal.value}</p>
    </div>
  );
};
