import type { DealStatus } from "../../common/types/ui";
import type { CRMStage } from "../types/crm";

export const CRM_STAGES: CRMStage[] = [
  "NEGOTIATION",
  "CONTRACTED",
  "IN_PROGRESS",
  "CLOSED",
];

export const STAGE_TO_STATUS: Record<CRMStage, DealStatus> = {
  NEGOTIATION: "negotiation",
  CONTRACTED: "contracted",
  IN_PROGRESS: "in-progress",
  CLOSED: "closed",
};

export const STATUS_TO_STAGE: Record<DealStatus, CRMStage> = {
  negotiation: "NEGOTIATION",
  contracted: "CONTRACTED",
  "in-progress": "IN_PROGRESS",
  closed: "CLOSED",
};

export const STATUS_COLUMNS: DealStatus[] = [
  "negotiation",
  "contracted",
  "in-progress",
  "closed",
];

export const parseCurrency = (value: string) =>
  Number(value.replace(/[$,]/g, "") || "0");

export const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

export const getStatusLabelColor = (status: DealStatus) => {
  switch (status) {
    case "negotiation":
      return "from-info/30 via-info/10 to-transparent text-info";
    case "contracted":
      return "from-success/30 via-success/10 to-transparent text-success";
    case "in-progress":
      return "from-warning/30 via-warning/10 to-transparent text-warning";
    case "closed":
      return "from-accent-secondary/30 via-accent-secondary/10 to-transparent text-accent-secondary";
    default:
      return "from-content-tertiary/30 via-content-tertiary/10 to-transparent text-content-secondary";
  }
};
