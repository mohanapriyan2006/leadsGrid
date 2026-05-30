import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AnimatedGrid } from "../ui/AnimatedGrid";
import { GlowButton } from "../ui/GlowButton";
import { GradientText } from "../ui/GradientText";
import { LeadNotificationCard } from "../ui/LeadNotificationCard";
import { useLeadSimulation } from "../../hooks/useLeadSimulation";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export const HeroSection = () => {
  const navigate = useNavigate();
  const { leads } = useLeadSimulation(3500, 3);

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      <AnimatedGrid />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 pt-24 lg:grid-cols-2 lg:gap-16">
        {/* Left — Headline + CTA */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col justify-center"
        >
          <motion.div variants={itemVariants} className="mb-4">
            <span className="inline-block rounded-full border border-accent/30 bg-accent-soft px-4 py-1.5 text-xs font-medium text-accent">
              AI-Powered Lead Discovery
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mb-6 font-display text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl"
          >
            Find High-Intent Clients{" "}
            <GradientText className="font-display">Automatically</GradientText>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mb-10 max-w-lg text-lg leading-relaxed text-content-secondary"
          >
            LeadsGrid scans the internet, finds real buyers, scores them with AI,
            and helps you close deals faster.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
            <GlowButton onClick={() => navigate("/login")}>
              Start Free
            </GlowButton>
            <GlowButton variant="secondary" onClick={() => handleDemoClick()}>
              Watch Demo
            </GlowButton>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-8 flex items-center gap-6 text-sm text-content-tertiary"
          >
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              Free forever plan
            </span>
          </motion.div>
        </motion.div>

        {/* Right — Animated Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, x: 60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="relative hidden lg:flex lg:items-center"
        >
          <div className="w-full rounded-2xl border border-content/10 bg-surface-tertiary/40 p-6 backdrop-blur-xl">
            {/* Mock dashboard header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-green-500/60" />
              <span className="ml-3 text-xs text-content-tertiary">LeadsGrid Dashboard</span>
            </div>

            {/* Live lead notifications */}
            <div className="space-y-3">
              {leads.map((lead, idx) => (
                <LeadNotificationCard key={lead.id} lead={lead} index={idx} />
              ))}
            </div>

            {/* Bottom stats */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { label: "Leads Found", value: "1,248" },
                { label: "Avg Score", value: "87.4" },
                { label: "Conversion", value: "34%" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-content/5 bg-surface-tertiary/40 p-3 text-center"
                >
                  <p className="text-lg font-bold text-content">{stat.value}</p>
                  <p className="text-[10px] text-content-tertiary">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Glow behind dashboard */}
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-accent/20 via-transparent to-accent-secondary/20 blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
};

function handleDemoClick() {
  const demoSection = document.querySelector("#live-demo");
  demoSection?.scrollIntoView({ behavior: "smooth" });
}
