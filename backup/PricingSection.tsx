import { useRef, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { SectionWrapper } from "../ui/SectionWrapper";
import { GradientText } from "../ui/GradientText";
import { GlowButton } from "../ui/GlowButton";
import {
  PLAN_ORDER,
  PRICING_PLANS,
  formatInr,
  monthlyEquivalentFromYearly,
  type PlanFamily,
  type PricingPlanDefinition,
} from "../../../common/constants/pricingPlans";

export const PricingSection = () => {
  const navigate = useNavigate();
  const [family, setFamily] = useState<PlanFamily>("single");
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const visiblePlans = useMemo(
    () => PLAN_ORDER[family].map((key) => PRICING_PLANS[key]),
    [family],
  );

  const formatPriceBlock = (monthlyPrice: number | null, yearlyPrice: number | null) => {
    if (monthlyPrice === null || yearlyPrice === null) {
      return {
        headline: "Custom",
        subline: "Contact us for pricing",
      };
    }

    if (cycle === "monthly") {
      return {
        headline: `${formatInr(monthlyPrice)}/mo`,
        subline: "Billed monthly",
      };
    }

    const monthlyEquivalent = monthlyEquivalentFromYearly(yearlyPrice);
    return {
      headline: `${formatInr(monthlyEquivalent)}/mo`,
      subline: `${formatInr(yearlyPrice)} billed yearly`,
    };
  };

  const handlePrimaryCta = () => {
    navigate("/login");
  };

  return (
    <SectionWrapper id="pricing">
      <div className="mb-10 text-center">
        <h2 className="mb-4 font-display text-4xl font-bold md:text-5xl">
          Simple <GradientText>Pricing</GradientText>
        </h2>
        <p className="mx-auto max-w-3xl text-base text-content-secondary md:text-lg">
          Pick your lane, switch billing cadence instantly, and compare real limits without opening extra screens.
        </p>
      </div>

      <div className="mx-auto mb-8 flex max-w-5xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex w-full rounded-glass-sm border border-accent/20 bg-surface-secondary/70 p-1 md:w-auto">
          {(["single", "organisation"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFamily(option)}
              className={`flex-1 rounded-glass-sm px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition md:flex-initial ${family === option
                  ? "bg-accent-soft text-content shadow-glow"
                  : "text-content-secondary hover:text-content"
                }`}
            >
              {option === "single" ? "Single User" : "Organisation"}
            </button>
          ))}
        </div>

        <div className="inline-flex w-full rounded-glass-sm border border-accent/20 bg-surface-secondary/70 p-1 md:w-auto">
          {(["monthly", "yearly"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCycle(option)}
              className={`flex-1 rounded-glass-sm px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition md:flex-initial ${cycle === option
                  ? "bg-accent-soft text-content shadow-glow"
                  : "text-content-secondary hover:text-content"
                }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        {visiblePlans.map((plan, idx) => {
          const priceBlock = formatPriceBlock(plan.monthlyPriceInr, plan.yearlyPriceInr);

          return (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                delay: idx * 0.12,
                type: "spring" as const,
                stiffness: 100,
                damping: 20,
              }}
              className="group relative"
            >
              <div
                className={`pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-br from-accent/35 via-info/10 to-accent-secondary/30 blur-2xl transition-opacity duration-500 ${plan.highlighted ? "opacity-70" : "opacity-0 group-hover:opacity-70"
                  }`}
              />

              <PricingCardInner
                plan={plan}
                priceBlock={priceBlock}
                isExpanded={expandedCard === plan.key}
                onToggle={() => setExpandedCard((c) => (c === plan.key ? null : plan.key))}
              />
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
};

function PricingCardInner({
  plan,
  priceBlock,
  isExpanded,
  onToggle,
}: {
  plan: PricingPlanDefinition;
  priceBlock: { headline: string; subline: string };
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const isFlipped = isExpanded;

  return (
    <div
      ref={cardRef}
      className="relative h-[450px] [perspective:2000px]"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mouse spotlight border glow */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-[-1px] z-20 rounded-2xl"
          style={{
            background: `radial-gradient(140px circle at ${coords.x}px ${coords.y}px, rgba(167,139,250,0.35), transparent 60%)`,
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: "1px",
            borderRadius: "inherit",
          }}
        />
      )}

      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0, rotateZ: isFlipped ? 1.2 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="relative h-full w-full rounded-2xl [transform-style:preserve-3d]"
        style={{ cursor: isHovered ? "pointer" : "default" }}
        onClick={() => {
          if (window.innerWidth < 768) onToggle();
        }}
      >
        {/* Front face */}
        <div
          className={`absolute inset-0 rounded-2xl border p-6 backdrop-blur-xl [backface-visibility:hidden] ${plan.highlighted
              ? "border-accent/50 bg-surface-secondary/85 shadow-[0_0_40px_rgba(167,139,250,0.24)]"
              : "border-accent/20 bg-surface-secondary/70"
            }`}
        >
          {/* Inner spotlight */}
          {isHovered && (
            <div
              className="pointer-events-none absolute inset-0 z-0 rounded-2xl mix-blend-screen"
              style={{
                background: `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, rgba(167,139,250,0.1), transparent 80%)`,
              }}
            />
          )}

          {plan.highlighted && (
            <span className="absolute z-10 -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-accent to-accent-secondary px-4 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-content-inverse animate-glow-pulse">
              Most Popular
            </span>
          )}

          <div className="relative z-10">
            <div className="mb-5">
              <h3 className="font-display text-2xl font-bold text-content">{plan.name}</h3>
              <p className="mt-1 text-sm text-content-secondary">{plan.tagline}</p>
            </div>

            <div className="mb-5 rounded-glass-sm border border-accent/20 bg-surface/50 px-3 py-3">
              <p className="text-2xl font-bold text-content">{priceBlock.headline}</p>
              <p className="text-xs text-content-secondary">{priceBlock.subline}</p>
            </div>

            <ul className="space-y-2">
              {plan.compactHighlights.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-content-secondary">
                  <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full border border-accent/30 bg-accent-soft text-[10px] text-accent">
                    <Check className="w-3 h-3" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-5 rounded-glass-sm border border-accent/15 bg-surface/30 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-content-secondary">
              Hover to spin for full details
            </div>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              className="mt-4 w-full text-xs font-semibold uppercase tracking-[0.1em] text-accent md:hidden"
            >
              {isFlipped ? "Back to summary" : "Spin card"}
            </button>
          </div>
        </div>

        {/* Back face */}
        <div className="absolute inset-0 rounded-2xl border border-accent/30 bg-surface-secondary/90 p-6 shadow-[0_0_36px_rgba(99,102,241,0.25)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="relative z-10 h-full flex flex-col">
            <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-content-secondary">Full plan details</p>
            <h4 className="font-display text-2xl font-bold text-content">{plan.name}</h4>
            <p className="mb-4 text-sm text-content-secondary">{priceBlock.headline} · {priceBlock.subline}</p>

            <div className="mb-5 flex-1 overflow-auto rounded-glass-sm border border-accent/15 bg-surface/40 px-3 py-3">
              <ul className="space-y-1.5">
                {plan.fullHighlights.map((highlight) => (
                  <li key={highlight} className="text-xs text-content-secondary">{highlight}</li>
                ))}
              </ul>
            </div>

            <GlowButton variant="primary" onClick={() => navigate("/login")} className="w-full">
              {plan.ctaLabel}
            </GlowButton>

            {plan.fairUsage ? (
              <p className="mt-2 text-center text-[11px] text-content-secondary">Fair usage policy applies.</p>
            ) : null}

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              className="mt-3 w-full text-xs font-semibold uppercase tracking-[0.1em] text-accent md:hidden"
            >
              Back to front
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
