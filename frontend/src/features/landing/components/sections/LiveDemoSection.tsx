import { motion, AnimatePresence } from "framer-motion";
import { SectionWrapper } from "../ui/SectionWrapper";
import { GradientText } from "../ui/GradientText";
import { LeadNotificationCard } from "../ui/LeadNotificationCard";
import { MarqueeBand } from "../ui/MarqueeBand";
import { CounterStat } from "../ui/CounterStat";
import { useLeadSimulation } from "../../hooks/useLeadSimulation";

const FLOATING_DOTS = [
  { size: 6, x: "15%", y: "20%", delay: 0, duration: 5 },
  { size: 4, x: "80%", y: "30%", delay: 1, duration: 7 },
  { size: 5, x: "70%", y: "70%", delay: 0.5, duration: 6 },
  { size: 3, x: "25%", y: "75%", delay: 1.5, duration: 8 },
  { size: 4, x: "50%", y: "15%", delay: 2, duration: 6.5 },
  { size: 3, x: "85%", y: "55%", delay: 0.8, duration: 7.5 },
];

const containerSpring = { type: "spring" as const, stiffness: 100, damping: 20 };

export const LiveDemoSection = () => {
  const { leads, totalDiscovered } = useLeadSimulation(2500, 5);

  return (
    <SectionWrapper id="live-demo">
      {/* Floating accent particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {FLOATING_DOTS.map((dot, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-accent/20"
            style={{
              width: dot.size,
              height: dot.size,
              left: dot.x,
              top: dot.y,
            }}
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{
              duration: dot.duration,
              delay: dot.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="mb-12 text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ ...containerSpring, duration: 0.5 }}
          className="mb-4 inline-block rounded-full border border-accent-secondary/30 bg-accent-secondary/10 px-4 py-1.5 text-xs font-medium text-accent-secondary"
        >
          Live Demo
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...containerSpring, delay: 0.1 }}
          className="mb-4 font-display text-4xl font-bold md:text-5xl"
        >
          Real-time Lead Discovery.{" "}
          <GradientText>No Manual Searching.</GradientText>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...containerSpring, delay: 0.2 }}
          className="mx-auto max-w-2xl text-lg text-content-secondary"
        >
          Watch AI discover high-intent leads across the internet — in real time.
        </motion.p>
      </div>

      {/* Trust marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ ...containerSpring, delay: 0.3 }}
      >
        <MarqueeBand speed={40} className="mb-12 border-y border-content/5 py-4">
          {["Reddit", "LinkedIn", "Google", "Twitter/X", "Quora", "GitHub", "Product Hunt", "Indie Hackers"].map((source) => (
            <span key={source} className="text-sm font-medium text-content-secondary whitespace-nowrap flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {source}
            </span>
          ))}
        </MarqueeBand>
      </motion.div>

      <div className="mx-auto max-w-xl">
        {/* Live counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...containerSpring, delay: 0.4 }}
          className="mb-6 text-center"
        >
          <CounterStat
            target={1248 + totalDiscovered}
            className="text-3xl font-bold text-content"
            label="leads discovered today"
            duration={1.5}
          />
        </motion.div>

        {/* Streaming lead cards */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {leads.map((lead, idx) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 120, damping: 18, delay: idx * 0.05 }}
              >
                <LeadNotificationCard lead={lead} index={idx} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </SectionWrapper>
  );
};
