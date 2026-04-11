import { useMemo } from "react";

import type { ManageLead } from "../../types/manageLead";
import { leadsPredictionService } from "../services/leadsPredictionService";

export const useLeadPredictions = (leads: ManageLead[]) => {
  const prediction = useMemo(() => leadsPredictionService.buildPrediction(leads), [leads]);

  return {
    prediction,
  };
};
