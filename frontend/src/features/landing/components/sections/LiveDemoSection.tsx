import { motion, AnimatePresence } from "framer-motion";
import { SectionWrapper } from "../ui/SectionWrapper";
import { GradientText } from "../ui/GradientText";
import { LeadNotificationCard } from "../ui/LeadNotificationCard";
import { useLeadSimulation } from "../../hooks/useLeadSimulation";

export const LiveDemoSection = () => {
  const { leads, totalDiscovered } = useLeadSimulation(2500, 5);

  return (
    <SectionWrapper id="live-demo">
      <div className="mb-12 text-center">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
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

      <div className="mx-auto max-w-xl">
        {/* Live counter */}
        <div className="mb-6 text-center">
          <motion.span
            key={totalDiscovered}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-bold text-content"
          >
            {(1248 + totalDiscovered).toLocaleString()}
          </motion.span>
          <p className="text-sm  ">leads discovered today</p>
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
