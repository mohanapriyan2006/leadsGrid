import { Globe, Brain, MessageSquare, Sparkles } from "lucide-react";
import { SectionWrapper } from "../ui/SectionWrapper";
import { GradientText } from "../ui/GradientText";
import { GlassCard } from "../ui/GlassCard";
import { ScrollReveal } from "../ui/ScrollReveal";
import { AICoreNode } from "../ui/AICoreNode";

const STEPS = [
  {
    step: "01",
    title: "Discover",
    description: "AI aggregates signals from Reddit, LinkedIn, Google, and high-intent communities.",
    icon: Globe,
    detail: "Source coverage is configurable and expands as your workflow grows.",
  },
  {
    step: "02",
    title: "Analyze",
    description: "Intent is scored with transparent signals, so you always know why a lead is hot.",
    icon: Brain,
    detail: "Keep humans in the loop with approvals and quality gates.",
  },
  {
    step: "03",
    title: "Convert",
    description: "Ready-to-contact outreach drafts land directly in your pipeline.",
    icon: MessageSquare,
    detail: "Move the best leads into CRM with clear next steps.",
  },
];

const PLATFORM_TAGS = ["Reddit", "LinkedIn", "Google", "X", "GitHub", "Indie Hackers"];

export const HowItWorksSection = () => {
  return (
    <SectionWrapper id="how-it-works" className="overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-24 top-12 h-64 w-64 rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-accent-secondary/10 blur-[140px]" />
      </div>

      <div className="relative z-10 mb-16 text-center">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.3em] text-content-secondary">How it works</p>
          <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
            A modern pipeline from signal to <GradientText>closed deals</GradientText>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-content-secondary">
            LeadsGrid keeps discovery, intent scoring, and outreach execution in a single guided flow.
          </p>
        </ScrollReveal>
      </div>

      <div className="relative z-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative space-y-6">
          <div className="absolute left-5 top-3 hidden h-[calc(100%-24px)] w-px bg-gradient-to-b from-accent/60 via-accent/20 to-transparent md:block" />
          {STEPS.map((step, index) => (
            <ScrollReveal key={step.title} delay={index * 0.08} y={40}>
              <GlassCard className="relative md:pl-16">
                <div className="absolute left-4 top-6 hidden h-10 w-10 items-center justify-center rounded-full border border-accent/30 bg-accent-soft text-xs font-semibold text-accent md:flex">
                  {step.step}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-content/10 bg-surface-secondary/60 text-accent shadow-[0_0_24px_rgba(167,139,250,0.2)]">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-content">{step.title}</h3>
                    <p className="mt-1 text-sm text-content-secondary">{step.description}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-content-secondary">{step.detail}</p>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>

        <div className="space-y-6">
          <ScrollReveal delay={0.1}>
            <GlassCard className="relative overflow-hidden">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/15 blur-[80px]" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-content-secondary">Signal hub</p>
                  <h3 className="mt-3 text-xl font-semibold text-content">
                    Unified intent engine
                  </h3>
                </div>
                <div className="rounded-full border border-accent/30 bg-accent-soft px-3 py-1 text-xs text-accent">
                  Live
                </div>
              </div>
              <p className="mt-4 text-sm text-content-secondary">
                Every signal flows into one explainable score so you always know what to prioritize.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {PLATFORM_TAGS.map((platform) => (
                  <span
                    key={platform}
                    className="rounded-full border border-content/10 bg-surface-secondary/60 px-3 py-1 text-xs text-content-secondary"
                  >
                    {platform}
                  </span>
                ))}
              </div>
              <div className="mt-8 flex items-center gap-4">
                <AICoreNode pulsing={false} />
                <div>
                  <p className="text-sm font-semibold text-content">AI-guided qualification</p>
                  <p className="text-xs text-content-secondary">Deterministic + AI signals, combined.</p>
                </div>
              </div>
            </GlassCard>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <GlassCard className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-content/10 bg-surface-secondary/60 text-accent">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-content">Outcome-ready workflows</h4>
                <p className="mt-2 text-sm text-content-secondary">
                  Move from insights to outreach in one flow. Nothing gets lost, and every action has
                  context.
                </p>
              </div>
            </GlassCard>
          </ScrollReveal>
        </div>
      </div>
    </SectionWrapper>
  );
};
