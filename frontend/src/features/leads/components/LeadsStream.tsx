import { motion } from "framer-motion";

import type { Lead } from "../types/lead";
import { LeadCard } from "./LeadCard";

type LeadsStreamProps = {
  leads: Lead[];
  isLoading: boolean;
  isFetching: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedLeadId: string | null;
  onSelectLead: (lead: Lead) => void;
  onGenerateDraft: (lead: Lead) => void;
};

const fallbackLeads: Lead[] = [
  {
    id: "seed-1",
    source: "reddit",
    author: "sarah-ops",
    company: "Outbound Ops Team",
    permalink: null,
    content: "Need help automating outbound",
    summary: "Scaling from 20 to 80 outbound messages and quality dropped.",
    score: 92,
    tags: ["high-intent", "automate", "outbound"],
    intent_label: "high-intent",
    created_at: new Date().toISOString(),
  },
  {
    id: "seed-2",
    source: "twitter",
    author: "growth-team",
    company: "Growth Team",
    permalink: null,
    content: "Frustrated with CRM",
    summary: "Current CRM workflow has manual updates and no scoring layer.",
    score: 84,
    tags: ["crm", "workflow"],
    intent_label: "qualified",
    created_at: new Date().toISOString(),
  },
];

export const LeadsStream = ({
  leads,
  isLoading,
  isFetching,
  searchTerm,
  onSearchChange,
  selectedLeadId,
  onSelectLead,
  onGenerateDraft,
}: LeadsStreamProps) => {
  const leadItems = leads.length ? leads : fallbackLeads;

  return (
    <div className="space-y-4">
      <div className="glass-card p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search intent signals..."
            className="glass-input md:max-w-lg"
          />
          <p className="text-xs uppercase tracking-[0.2em]  text-content-tertiaryy">
            {isFetching ? "refreshing" : "live intent stream"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-40 animate-pulse glass-card" />
          <div className="h-40 animate-pulse glass-card" />
        </div>
      ) : (
        <div className="space-y-3">
          {leadItems.map((lead, index) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <LeadCard
                lead={lead}
                isSelected={selectedLeadId === lead.id}
                onSelect={onSelectLead}
                onGenerateDraft={onGenerateDraft}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
