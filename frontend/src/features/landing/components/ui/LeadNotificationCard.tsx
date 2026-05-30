import { motion } from "framer-motion";
import type { SimulatedLead } from "../../types/landing";

type Props = {
  lead: SimulatedLead;
  index: number;
};

const sourceColors: Record<string, string> = {
  Reddit: "text-orange-400",
  LinkedIn: "text-blue-400",
  Google: "text-green-400",
};

const getScoreColor = (score: number): string => {
  if (score >= 90) return "text-green-400";
  if (score >= 80) return "text-yellow-400";
  return "text-orange-400";
};

export const LeadNotificationCard = ({ lead, index }: Props) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -60, scale: 0.9 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="rounded-xl border border-content/10 bg-surface-tertiary/30 p-4 backdrop-blur-xl"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />
        <span className="text-xs font-medium text-accent">New Lead Found</span>
        <span className="ml-auto text-[10px] text-content-tertiary">{lead.timestamp}</span>
      </div>
      <p className="mb-2 text-sm font-medium text-content">"{lead.title}"</p>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${sourceColors[lead.source] ?? "text-content-tertiary"}`}>
          {lead.source}
        </span>
        <span className={`text-xs font-bold ${getScoreColor(lead.score)}`}>
          Score: {lead.score}
        </span>
      </div>
    </motion.div>
  );
};
