import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { SectionWrapper } from "../ui/SectionWrapper";
import { GradientText } from "../ui/GradientText";
import { GlowButton } from "../ui/GlowButton";
import { GradientBorderCard } from "../ui/GradientBorderCard";
import {
  PLAN_ORDER,
  PRICING_PLANS,
  PRICING_ENABLED,
  formatInr,
  monthlyEquivalentFromYearly,
  type PlanFamily,
  type PricingPlanDefinition,
  type PricingPlanKey,
} from "../../../common/constants/pricingPlans";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.12 },
  }),
};

const isOrgPricingEnabled = false;

type PricingPlansDisplayProps = {
  className?: string;
  activePlanKey?: string;
  onPlanSelect?: (planKey: PricingPlanKey) => void;
  compact?: boolean;
};

export const PricingPlansDisplay = ({
  className = "",
  activePlanKey,
  onPlanSelect,
  compact = false,
}: PricingPlansDisplayProps) => {
  const [family, setFamily] = useState<PlanFamily>("single");
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const visiblePlans = useMemo(
    () => PLAN_ORDER[family].map((key) => PRICING_PLANS[key]),
    [family],
  );

  const formatPriceBlock = (monthlyPrice: number | null, yearlyPrice: number | null) => {
    if (monthlyPrice === null || yearlyPrice === null) {
      return { headline: "Custom", subline: "Contact us for pricing" };
    }
    if (cycle === "monthly") {
      return { headline: `${formatInr(monthlyPrice)}/mo`, subline: "Billed monthly" };
    }
    const monthlyEquivalent = monthlyEquivalentFromYearly(yearlyPrice);
    return { headline: `${formatInr(monthlyEquivalent)}/mo`, subline: `${formatInr(yearlyPrice)} billed yearly` };
  };

  return (
    <div className={className}>
      <div className="mx-auto mb-6 flex max-w-5xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex w-full rounded-glass-sm border border-accent/20 bg-surface-secondary/70 p-1 md:w-auto">
          {(["single", "organisation"] as const).map((option) => {
            const isDisabled = option === "organisation" && !isOrgPricingEnabled;
            return (
              <button
                key={option}
                type="button"
                disabled={isDisabled}
                onClick={() => !isDisabled && setFamily(option)}
                className={`flex-1 rounded-glass-sm px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition md:flex-initial ${family === option && !isDisabled
                    ? "bg-accent-soft text-content shadow-glow"
                    : isDisabled
                      ? "cursor-not-allowed text-content-secondary/40"
                      : "text-content-secondary hover:text-content"
                  }`}
              >
                <span className="flex items-center gap-1.5">
                  {option === "single" ? "Single User" : "Organisation"}
                  {isDisabled && (
                    <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[9px] font-bold normal-case tracking-normal text-accent">
                      Upcoming
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {PRICING_ENABLED && (
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
        )}
      </div>

      <div className={`mx-auto grid ${compact ? "w-full gap-3 sm:grid-cols-3" : "max-w-5xl gap-6 md:grid-cols-3"}`}>
        {visiblePlans.map((plan, idx) => {
          const priceBlock = formatPriceBlock(plan.monthlyPriceInr, plan.yearlyPriceInr);
          const isActive = activePlanKey === plan.key;

          return (
            <motion.div
              key={plan.key}
              custom={idx}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              whileHover={{ y: -4 }}
              className="group relative"
            >
              <div
                className={`pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-br from-accent/35 via-info/10 to-accent-secondary/30 blur-2xl transition-opacity duration-500 ${plan.highlighted ? "opacity-70" : "opacity-0 group-hover:opacity-70"
                  }`}
              />
              {isActive && (
                <div className="absolute -inset-1 z-10 rounded-3xl border-2 border-success/60 pointer-events-none" />
              )}
              <div className={`relative [perspective:2000px] ${compact ? "h-[300px]" : "h-[450px]"}`}>
                <PricingCardInner
                  plan={plan}
                  priceBlock={priceBlock}
                  compact={compact}
                  onCtaClick={onPlanSelect ? () => onPlanSelect(plan.key) : undefined}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export const PricingSection = () => {
  const navigate = useNavigate();

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

      <PricingPlansDisplay />
    </SectionWrapper>
  );
};

function PricingCardInner({
  plan,
  priceBlock,
  onCtaClick,
  compact = false,
}: {
  plan: PricingPlanDefinition;
  priceBlock: { headline: string; subline: string };
  onCtaClick?: (planKey: string) => void;
  compact?: boolean;
}) {
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const isFlipped = expandedCard === plan.key;

  return (
    <div className={`relative [perspective:2000px] ${compact ? "h-[300px]" : "h-[450px]"}`}>
      <div
        className={`relative h-full w-full rounded-2xl transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped
            ? "[transform:rotateY(180deg)_rotateZ(1.2deg)]"
            : "md:group-hover:[transform:rotateY(180deg)_rotateZ(1.2deg)]"
          }`}
      >
        <div
          className={`absolute inset-0 overflow-hidden rounded-2xl border backdrop-blur-xl [backface-visibility:hidden] ${plan.highlighted
              ? "border-accent/50 bg-surface-secondary/85 shadow-[0_0_40px_rgba(167,139,250,0.24)]"
              : "border-accent/20 bg-surface-secondary/70"
            } ${compact ? "p-4" : "p-6"}`}
        >
          {plan.highlighted && (
            <span className={`absolute z-10 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-accent to-accent-secondary font-bold uppercase tracking-[0.1em] text-content-inverse animate-glow-pulse ${compact ? "-top-2 px-2 py-0.5 text-[9px]" : "-top-3 px-4 py-1 text-[10px]"}`}>
              Most Popular
            </span>
          )}

          <div className={compact ? "mb-2" : "mb-5"}>
            <h3 className={`font-display font-bold text-content ${compact ? "text-lg" : "text-2xl"}`}>{plan.name}</h3>
            <p className={`text-content-secondary ${compact ? "mt-0.5 text-[11px]" : "mt-1 text-sm"}`}>{plan.tagline}</p>
          </div>

          <div className={`rounded-glass-sm border border-accent/20 bg-surface/50 px-3 ${compact ? "mb-2 py-1.5" : "mb-5 py-3"}`}>
            {PRICING_ENABLED ? (
              <>
                <p className={`font-bold text-content ${compact ? "text-lg" : "text-2xl"}`}>{priceBlock.headline}</p>
                <p className="text-xs text-content-secondary">{priceBlock.subline}</p>
              </>
            ) : (
              <div className={`flex items-center justify-center font-bold text-content ${compact ? "text-lg" : "text-2xl"}`}>
                <span className="rounded-full bg-accent/15 px-3 py-1 text-sm font-bold uppercase tracking-wider text-accent border border-accent/20">
                  Comming Soon
                </span>
              </div>
            )}
          </div>

          <ul className={`${compact ? "space-y-1" : "space-y-2"}`}>
            {plan.compactHighlights.slice(0, compact ? 4 : undefined).map((feature) => (
              <li key={feature} className={`flex items-center gap-2 text-content-secondary ${compact ? "text-[11px]" : "text-sm"}`}>
                <span className={`inline-flex items-center justify-center rounded-full border border-accent/30 bg-accent-soft text-accent ${compact ? "mt-0.5 h-3.5 w-3.5 text-[8px]" : "mt-0.5 h-4 w-4 text-[10px]"}`}>
                  <Check className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
                </span>
                {feature}
              </li>
            ))}
          </ul>

          {!compact && (
            <div className="mt-5 rounded-glass-sm border border-accent/15 bg-surface/30 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-content-secondary">
              Hover to spin for full details
            </div>
          )}

          <button
            type="button"
            onClick={() => setExpandedCard((current) => (current === plan.key ? null : plan.key))}
            className="mt-4 w-full text-xs font-semibold uppercase tracking-[0.1em] text-accent md:hidden"
          >
            {isFlipped ? "Back to summary" : "Spin card"}
          </button>
        </div>

        <div className={`absolute inset-0 overflow-hidden rounded-2xl border border-accent/30 bg-surface-secondary/90 shadow-[0_0_36px_rgba(99,102,241,0.25)] [backface-visibility:hidden] [transform:rotateY(180deg)] ${compact ? "p-4" : "p-6"}`}>
          <p className={`uppercase tracking-[0.12em] text-content-secondary ${compact ? "mb-1 text-[10px]" : "mb-2 text-[11px]"}`}>Full plan details</p>
          <h4 className={`font-display font-bold text-content ${compact ? "text-lg" : "text-2xl"}`}>{plan.name}</h4>
          {PRICING_ENABLED && (
            <p className={`text-content-secondary ${compact ? "mb-2 text-[11px]" : "mb-4 text-sm"}`}>{priceBlock.headline} · {priceBlock.subline}</p>
          )}
          {!PRICING_ENABLED && (
            <div className={`${compact ? "mb-2" : "mb-4"}`}>
              <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent border border-accent/20">
                Soon
              </span>
            </div>
          )}

          <div className={`overflow-auto rounded-glass-sm border border-accent/15 bg-surface/40 px-3 py-3 ${compact ? "mb-2 max-h-[120px]" : "mb-5 max-h-[280px]"}`}>
            <ul className="space-y-1.5">
              {plan.fullHighlights.map((highlight) => (
                <li key={highlight} className={`text-content-secondary ${compact ? "text-[10px]" : "text-xs"}`}>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          <GlowButton
            variant="primary"
            onClick={() => {
              if (onCtaClick) {
                onCtaClick(plan.key);
              } else {
                navigate("/login");
              }
            }}
            className="w-full"
          >
            {PRICING_ENABLED ? plan.ctaLabel : "Try Beta Version"}
          </GlowButton>

          {plan.fairUsage ? (
            <p className={`text-center text-content-secondary ${compact ? "mt-1 text-[10px]" : "mt-2 text-[11px]"}`}>Fair usage policy applies.</p>
          ) : null}

          <button
            type="button"
            onClick={() => setExpandedCard(null)}
            className="mt-3 w-full text-xs font-semibold uppercase tracking-[0.1em] text-accent md:hidden"
          >
            Back to front
          </button>
        </div>
      </div>
    </div>
  );
}
