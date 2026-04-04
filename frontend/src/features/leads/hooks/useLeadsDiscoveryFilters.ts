import { useState } from "react";

import { LEAD_SOURCES } from "../constants/leadsPageOptions";
import type { Lead } from "../types/lead";

export const useLeadsDiscoveryFilters = () => {
  const [searchTerm, setSearchTerm] = useState("need crm automation");
  const [scoreMin, setScoreMin] = useState(70);
  const [industry, setIndustry] = useState("Software & SaaS");
  const [sources, setSources] = useState<Lead["source"][]>([...LEAD_SOURCES]);

  const toggleSource = (source: Lead["source"]) => {
    setSources((previous) => {
      if (previous.includes(source)) {
        const next = previous.filter((item) => item !== source);
        return next.length ? next : [...LEAD_SOURCES];
      }
      return [...previous, source];
    });
  };

  const clearFilters = () => {
    setScoreMin(0);
    setSources([...LEAD_SOURCES]);
  };

  return {
    searchTerm,
    setSearchTerm,
    scoreMin,
    setScoreMin,
    industry,
    setIndustry,
    sources,
    toggleSource,
    clearFilters,
  };
};
