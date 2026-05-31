import React from "react";
import { motion } from "framer-motion";
import { Globe, Brain, MessageSquare } from "lucide-react";
import { SectionWrapper } from "../ui/SectionWrapper";
import { GradientText } from "../ui/GradientText";
import type { HowItWorksStep } from "../../types/landing";

const STEPS: (HowItWorksStep & { icon: React.ElementType })[] = [
  {
    step: 1,
    title: "Discover",
    description: "AI scans Reddit, LinkedIn, Google",
    icon: Globe,
  },
  {
    step: 2,
    title: "Analyze",
    description: "AI detects real buying intent",
    icon: Brain,
  },
  {
    step: 3,
    title: "Convert",
    description: "Get ready-to-contact leads",
    icon: MessageSquare,
  },
];

const stepVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.2, ease: "easeOut" as const },
  }),
};

export const HowItWorksSection = () => {
  return (
    <SectionWrapper id="how-it-works">
      <div className="mb-16 text-center">
        <h2 className="mb-4 font-display text-4xl font-bold md:text-5xl">
          How <GradientText>It Works</GradientText>
        </h2>
        <p className="mx-auto max-w-lg text-lg text-content-secondary">
          Three simple steps to automated lead generation
        </p>
      </div>

      <div className="relative mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
        {/* Connector line */}
        <div className="absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 md:block">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        </div>

        {STEPS.map((step, idx) => (
          <motion.div
            key={step.step}
            custom={idx}
            variants={stepVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="relative flex flex-col items-center text-center"
          >
            {/* Step number ring */}
            <motion.div
              whileHover={{ scale: 1.1, boxShadow: "0 0 40px rgba(167,139,250,0.5)" }}
              className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-accent/30 bg-accent-soft text-3xl shadow-[0_0_20px_rgba(167,139,250,0.2)]"
            >
              <step.icon className="w-6 h-6 text-accent" />
              <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-accent to-accent-secondary text-[10px] font-bold text-content-inverse">
                {step.step}
              </span>
            </motion.div>

            <h3 className="mb-2 font-display text-xl font-bold text-content">
              {step.title}
            </h3>
            <p className="text-sm text-content-secondary">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};
