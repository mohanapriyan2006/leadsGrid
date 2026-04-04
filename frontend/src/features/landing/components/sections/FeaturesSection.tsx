import { motion } from "framer-motion";
import { SectionWrapper } from "../ui/SectionWrapper";
import { GlassCard } from "../ui/GlassCard";
import { GradientText } from "../ui/GradientText";
import type { FeatureItem } from "../../types/landing";

const FEATURES: FeatureItem[] = [
  {
    icon: "⚡",
    title: "AI Lead Scoring",
    description: "Know which leads will convert before messaging.",
  },
  {
    icon: "🔍",
    title: "Multi-Source Discovery",
    description: "Reddit, Google, LinkedIn — all in one.",
  },
  {
    icon: "🤖",
    title: "Agent Mode",
    description: "Let AI find, analyze, and prepare outreach.",
  },
  {
    icon: "📊",
    title: "Smart CRM",
    description: "Track leads in a clean pipeline.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.12, ease: "easeOut" },
  }),
};

export const FeaturesSection = () => {
  return (
    <SectionWrapper id="features">
      <div className="mb-16 text-center">
        <h2 className="mb-4 font-display text-4xl font-bold md:text-5xl">
          Powerful <GradientText>Features</GradientText>
        </h2>
        <p className="mx-auto max-w-lg text-lg text-white/50">
          Everything you need to find and close high-intent clients
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
        {FEATURES.map((feature, idx) => (
          <motion.div
            key={feature.title}
            custom={idx}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            <GlassCard hoverTilt className="group h-full">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-2xl transition-shadow group-hover:shadow-[0_0_20px_rgba(167,139,250,0.3)]">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-white/50">{feature.description}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};
