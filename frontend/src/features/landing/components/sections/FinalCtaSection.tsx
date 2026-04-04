import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GlowButton } from "../ui/GlowButton";
import { GradientText } from "../ui/GradientText";

export const FinalCtaSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden py-32">
      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[150px]" />
        <div className="absolute left-1/3 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-secondary/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative z-10 mx-auto max-w-3xl px-6 text-center"
      >
        <h2 className="mb-6 font-display text-5xl font-bold leading-tight md:text-6xl">
          Stop Searching.{" "}
          <GradientText>Start Closing.</GradientText>
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-lg text-white/50">
          Join thousands of professionals who let AI find their next clients
          automatically.
        </p>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="inline-block"
        >
          <GlowButton
            onClick={() => navigate("/login")}
            className="!px-10 !py-5 !text-base shadow-[0_0_60px_rgba(167,139,250,0.5)]"
          >
            Get Your First Leads Now
          </GlowButton>
        </motion.div>

        <p className="mt-6 text-sm text-white/30">
          Free forever. No credit card required.
        </p>
      </motion.div>
    </section>
  );
};
