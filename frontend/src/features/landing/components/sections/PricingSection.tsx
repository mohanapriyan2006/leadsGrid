import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { SectionWrapper } from "../ui/SectionWrapper";
import { GradientText } from "../ui/GradientText";
import { GlowButton } from "../ui/GlowButton";
import type { PricingTier } from "../../types/landing";

const TIERS: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    description: "Get started with basic CRM",
    features: ["Basic lead management", "Manual lead entry", "Simple CRM pipeline", "Community support"],
    highlighted: false,
    cta: "Start Free",
  },
  {
    name: "Pro",
    price: "$29",
    description: "AI-powered lead discovery",
    features: [
      "Everything in Free",
      "AI lead scoring",
      "Multi-source discovery",
      "50 leads/month",
      "Priority support",
    ],
    highlighted: true,
    cta: "Start Pro Trial",
  },
  {
    name: "Scale",
    price: "$79",
    description: "Full automation for teams",
    features: [
      "Everything in Pro",
      "Unlimited leads",
      "Agent Mode (auto-outreach)",
      "Team collaboration",
      "Custom integrations",
      "Dedicated support",
    ],
    highlighted: false,
    cta: "Contact Sales",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.12 },
  }),
};

export const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <SectionWrapper id="pricing">
      <div className="mb-16 text-center">
        <h2 className="mb-4 font-display text-4xl font-bold md:text-5xl">
          Simple <GradientText>Pricing</GradientText>
        </h2>
        <p className="mx-auto max-w-lg text-lg text-white/50">
          Start free, scale as you grow
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        {TIERS.map((tier, idx) => (
          <motion.div
            key={tier.name}
            custom={idx}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className={`relative rounded-2xl border p-8 backdrop-blur-xl ${
              tier.highlighted
                ? "border-accent/40 bg-white/[0.06] shadow-[0_0_40px_rgba(167,139,250,0.2)]"
                : "border-white/10 bg-white/[0.03]"
            }`}
          >
            {tier.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-accent to-accent-secondary px-4 py-1 text-xs font-bold text-white">
                Most Popular
              </span>
            )}

            <h3 className="mb-1 font-display text-xl font-bold text-white">{tier.name}</h3>
            <p className="mb-4 text-sm text-white/40">{tier.description}</p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-white">{tier.price}</span>
              <span className="text-sm text-white/40">/month</span>
            </div>

            <ul className="mb-8 space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-white/60">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[10px] text-accent">
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <GlowButton
              variant={tier.highlighted ? "primary" : "secondary"}
              onClick={() => navigate("/login")}
              className="w-full"
            >
              {tier.cta}
            </GlowButton>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};
