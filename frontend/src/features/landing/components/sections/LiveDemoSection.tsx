import { motion, AnimatePresence } from "framer-motion";
import { SectionWrapper } from "../ui/SectionWrapper";
import { GradientText } from "../ui/GradientText";
import { LeadNotificationCard } from "../ui/LeadNotificationCard";
import { MarqueeBand } from "../ui/MarqueeBand";
import { CounterStat } from "../ui/CounterStat";
import { useLeadSimulation } from "../../hooks/useLeadSimulation";

export const LiveDemoSection = () => {
  const { leads, totalDiscovered } = useLeadSimulation(2500, 5);

  return (
    <SectionWrapper id="live-demo">
      <div className="mb-12 text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-4 inline-block rounded-full border border-accent-secondary/30 bg-accent-secondary/10 px-4 py-1.5 text-xs font-medium text-accent-secondary"
        >
          Live Demo
        </motion.span>
        <h2 className="mb-4 font-display text-4xl font-bold md:text-5xl">
          Real-time Lead Discovery.{" "}
          <GradientText>No Manual Searching.</GradientText>
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-content-secondary">
          Watch AI discover high-intent leads across the internet — in real time.
        </p>
      </div>

      {/* Trust marquee */}
      <MarqueeBand speed={40} className="mb-12 border-y border-content/5 py-4">
        {["Reddit", "LinkedIn", "Google", "Twitter/X", "Quora", "GitHub", "Product Hunt", "Indie Hackers"].map((source) => (
          <span key={source} className="text-sm font-medium text-content-secondary whitespace-nowrap flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {source}
          </span>
        ))}
      </MarqueeBand>

      <div className="mx-auto max-w-xl">
        {/* Live counter */}
        <div className="mb-6 text-center">
          <CounterStat
            target={1248 + totalDiscovered}
            className="text-3xl font-bold text-content"
            label="leads discovered today"
            duration={1.5}
          />
        </div>

        {/* Streaming lead cards */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {leads.map((lead, idx) => (
              <LeadNotificationCard key={lead.id} lead={lead} index={idx} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </SectionWrapper>
  );
};
