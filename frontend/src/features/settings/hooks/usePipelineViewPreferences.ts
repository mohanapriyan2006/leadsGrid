import { useEffect, useMemo, useState } from "react";

import type { ManageLeadStage } from "../../leads/types/manageLead";
import { settingsService } from "../services/settingsService";

const CRM_STATUS_ORDER = ["negotiation", "contracted", "in-progress", "closed"] as const;
const CRM_DEFAULT_LABELS: Record<(typeof CRM_STATUS_ORDER)[number], string> = {
  negotiation: "Negotiation",
  contracted: "Contracted",
  "in-progress": "In Progress",
  closed: "Closed",
};

type ManageStageLabelMap = Record<ManageLeadStage, string>;

const MANAGE_DEFAULT_LABELS: ManageStageLabelMap = {
  NEW: "New",
  QUALIFIED: "Qualified",
  CONTACTED: "Contacted",
  RESPONDED: "Responded",
  NEGOTIATION: "Negotiation",
  CONTRACTED: "Contracted",
  IN_PROGRESS: "In Progress",
  CLOSED: "Closed",
};

export const usePipelineViewPreferences = () => {
  const [manageStageLabelMap, setManageStageLabelMap] =
    useState<ManageStageLabelMap>(MANAGE_DEFAULT_LABELS);
  const [preferredExportFields, setPreferredExportFields] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const settings = await settingsService.load();
      setManageStageLabelMap(settings.workspace.stageLabelMap);
      setPreferredExportFields(settings.workspace.preferredExportFields);
    };

    void load();
  }, []);

  const crmStatusLabelMap = useMemo(() => {
    const labelMap = {
      ...CRM_DEFAULT_LABELS,
      negotiation: manageStageLabelMap.NEGOTIATION,
      contracted: manageStageLabelMap.CONTRACTED,
      "in-progress": manageStageLabelMap.IN_PROGRESS,
      closed: manageStageLabelMap.CLOSED,
    };
    return labelMap;
  }, [manageStageLabelMap]);

  return {
    preferredExportFields,
    crmStatusLabelMap,
    manageStageLabelMap,
  };
};
