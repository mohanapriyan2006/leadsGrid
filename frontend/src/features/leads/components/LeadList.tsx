import { motion } from "framer-motion";

import type { Lead } from "../types/lead";
import { LeadCard } from "./LeadCard";

type LeadListProps = {
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
    permalink: null,
    content: "Frustrated with CRM",
    summary: "Current CRM workflow has manual updates and no scoring layer.",
    score: 84,
    tags: ["crm", "workflow"],
    intent_label: "qualified",
    created_at: new Date().toISOString(),
  },
];

export const LeadList = ({
  leads,
  isLoading,
  isFetching,
  searchTerm,
  onSearchChange,
  selectedLeadId,
  onSelectLead,
  onGenerateDraft,
}: LeadListProps) => {
  const leadItems = leads.length ? leads : fallbackLeads;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-panel/60 p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search intent signals..."
            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-accent md:max-w-lg"
          />
          <p className="text-xs uppercase tracking-[0.2em] text-text-dim">
            {isFetching ? "refreshing" : "live intent stream"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-40 animate-pulse rounded-xl border border-white/10 bg-panel/60" />
          <div className="h-40 animate-pulse rounded-xl border border-white/10 bg-panel/60" />
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
