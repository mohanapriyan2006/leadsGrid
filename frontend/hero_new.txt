import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { GlowButton } from "../ui/GlowButton";
import { GradientText } from "../ui/GradientText";
import { HeroDashboard3D } from "./HeroDashboard3D";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, type: "spring" as const, stiffness: 100, damping: 20 },
  },
};

export const HeroSection = () => {
  const navigate = useNavigate();

  const handleDemoClick = () => {
    document.querySelector("#live-demo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      {/* Aurora background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-accent/8 blur-[140px] rounded-full" />
        <div className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] bg-accent-secondary/8 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] left-[30%] w-[400px] h-[400px] bg-info/5 blur-[100px] rounded-full" />
      </div>

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
            <GlowButton variant="secondary" onClick={handleDemoClick}>
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

        {/* Right — 3D Dashboard */}
        <motion.div
          initial={{ opacity: 0, x: 60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
          className="relative hidden lg:flex lg:items-center"
        >
          <HeroDashboard3D />
        </motion.div>
      </div>

      {/* Scroll down indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
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
