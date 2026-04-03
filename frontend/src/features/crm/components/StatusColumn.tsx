import type { ReactNode } from "react";

import { useDroppable } from "@dnd-kit/core";

import { getStatusLabelColor } from "../constants/crm";
import type { Deal } from "../types/crm";
import type { DealStatus } from "../../common/types/ui";

type StatusColumnHeaderProps = {
  status: DealStatus;
  columnDeals: Deal[];
};

type DroppableStatusColumnProps = {
  status: DealStatus;
  columnDeals: Deal[];
  children: ReactNode;
};

const StatusColumnHeader = ({ status, columnDeals }: StatusColumnHeaderProps) => {
  return (
    <div
      className={`mb-3 flex items-center justify-between rounded-xl bg-gradient-to-r px-3 py-2 text-xs font-semibold tracking-[0.16em] ${getStatusLabelColor(
        status,
      )}`}
    >
      <h3>{status.toUpperCase()}</h3>
      <span className="rounded-full bg-surface/60 px-2 py-0.5 text-[11px] text-content">
        {columnDeals.length}
      </span>
    </div>
  );
};

export const DroppableStatusColumn = ({
  status,
  columnDeals,
  children,
}: DroppableStatusColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      className={`glass-card group flex flex-col p-3 transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-glow ${
        isOver ? "border-accent/50 ring-1 ring-accent/30 shadow-glow" : ""
      }`}
    >
      <StatusColumnHeader status={status} columnDeals={columnDeals} />
      {children}
    </section>
  );
};
