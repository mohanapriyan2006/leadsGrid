import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { ParticleCanvas } from "../ui/ParticleCanvas";
import { GlowButton } from "../ui/GlowButton";
import { GradientText } from "../ui/GradientText";
import { LeadNotificationCard } from "../ui/LeadNotificationCard";
import { TiltCard } from "../ui/TiltCard";
import { CounterStat } from "../ui/CounterStat";
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
      <ParticleCanvas />

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
            className="mt-8 flex items-center gap-6 text-sm text-content-secondary"
          >
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Free forever plan
            </span>
          </motion.div>
        </motion.div>

        {/* Right — Animated Dashboard Preview with Tilt */}
        <motion.div
          initial={{ opacity: 0, x: 60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="relative hidden lg:flex lg:items-center"
        >
          <TiltCard className="w-full">
            <div className="w-full rounded-2xl border border-content/10 bg-surface-tertiary/40 p-6 backdrop-blur-xl">
              {/* Mock dashboard header */}
              <div className="mb-6 flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-danger/60" />
                <div className="h-3 w-3 rounded-full bg-warning/60" />
                <div className="h-3 w-3 rounded-full bg-success/60" />
                <span className="ml-3 text-xs text-content-secondary">LeadsGrid Dashboard</span>
              </div>

              {/* Live lead notifications */}
              <div className="space-y-3">
                {leads.map((lead, idx) => (
                  <LeadNotificationCard key={lead.id} lead={lead} index={idx} />
                ))}
              </div>

              {/* Bottom stats with CounterStat */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <CounterStat
                  target={1248}
                  className="text-lg font-bold text-content"
                  label="Leads Found"
                />
                <CounterStat
                  target={87}
                  suffix=".4"
                  className="text-lg font-bold text-content"
                  label="Avg Score"
                />
                <CounterStat
                  target={34}
                  suffix="%"
                  className="text-lg font-bold text-content"
                  label="Conversion"
                />
              </div>
            </div>
          </TiltCard>

          {/* Glow behind dashboard */}
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-accent/20 via-transparent to-accent-secondary/20 blur-3xl" />
        </motion.div>
      </div>

      {/* Scroll down indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <button
          onClick={() => document.querySelector("#live-demo")?.scrollIntoView({ behavior: "smooth" })}
          className="flex flex-col items-center gap-1 text-content-secondary transition-colors hover:text-accent"
        >
          <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
          <ChevronDown className="h-5 w-5 animate-bounce-chevron" />
        </button>
      </motion.div>
    </section>
  );
};

function handleDemoClick() {
  const demoSection = document.querySelector("#live-demo");
  demoSection?.scrollIntoView({ behavior: "smooth" });
}
