import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GlowButton } from "../ui/GlowButton";
import { GradientText } from "../ui/GradientText";
import { CounterStat } from "../ui/CounterStat";

export const FinalCtaSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden py-32">
      {/* Aurora background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/8 blur-[160px]"
        />
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
          className="absolute left-[30%] top-[60%] h-[400px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-secondary/8 blur-[140px]"
        />
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
          className="absolute right-[20%] top-[30%] h-[350px] w-[450px] rounded-full bg-info/5 blur-[120px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, type: "spring" as const, stiffness: 100, damping: 20 }}
        className="relative z-10 mx-auto max-w-3xl px-6 text-center"
      >
        <h2 className="mb-6 font-display text-5xl font-bold leading-tight md:text-6xl">
          Stop Searching.{" "}
          <GradientText>Start Closing.</GradientText>
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-lg text-content-secondary">
          Join thousands of professionals who let AI find their next clients
          automatically.
        </p>

        {/* Stats row */}
        <div className="mb-10 grid grid-cols-3 gap-4">
          <CounterStat target={1248} suffix="+" className="text-2xl font-bold text-content" label="Leads Found" duration={2} />
          <CounterStat target={87} suffix="%" className="text-2xl font-bold text-content" label="Avg Score" duration={2} />
          <CounterStat target={34} suffix="%" className="text-2xl font-bold text-content" label="Conversion" duration={2} />
        </div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="inline-block"
        >
          <GlowButton
            onClick={() => navigate("/login")}
            className="!px-10 !py-5 !text-base shadow-[0_0_60px_rgba(167,139,250,0.5)] transition-shadow hover:shadow-[0_0_80px_rgba(167,139,250,0.7)]"
          >
            Get Your First Leads Now
          </GlowButton>
        </motion.div>

        <p className="mt-6 text-sm text-content-secondary">
          Free forever. No credit card required.
        </p>
      </motion.div>
    </section>
  );
};
