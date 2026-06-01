import { GlassCard } from "../../landing/components/ui/GlassCard";
import { SectionWrapper } from "../../landing/components/ui/SectionWrapper";

export const AboutStory = () => {
  return (
    <SectionWrapper className="py-12">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className="h-full">
          <h2 className="text-2xl font-semibold text-content">Why LeadsGrid exists</h2>
          <p className="mt-4 text-sm text-content-secondary">
            Most teams waste hours chasing low-quality leads across scattered sources. LeadsGrid was
            created to centralize discovery, enrich intent signals, and give sales teams a confident
            next step in minutes instead of days.
          </p>
          <p className="mt-4 text-sm text-content-secondary">
            The platform blends deterministic scoring with AI guidance, keeping humans in control while
            automation handles the heavy lifting.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-content-secondary sm:grid-cols-2">
            <div className="rounded-xl border border-content/10 bg-surface-secondary/60 px-4 py-3">
              Multi-source discovery pipeline
            </div>
            <div className="rounded-xl border border-content/10 bg-surface-secondary/60 px-4 py-3">
              Explainable scoring and insights
            </div>
            <div className="rounded-xl border border-content/10 bg-surface-secondary/60 px-4 py-3">
              Workflow-ready outreach drafts
            </div>
            <div className="rounded-xl border border-content/10 bg-surface-secondary/60 px-4 py-3">
              CRM handoff with visibility
            </div>
          </div>
        </GlassCard>
        <div className="grid gap-6">
          <GlassCard>
            <h3 className="text-lg font-semibold text-content">What makes us different</h3>
            <p className="mt-3 text-sm text-content-secondary">
              We focus on clarity: transparent scoring, explainable insights, and workflows that mirror
              real sales operations instead of black-box automation.
            </p>
          </GlassCard>
          <GlassCard>
            <h3 className="text-lg font-semibold text-content">How teams use it</h3>
            <p className="mt-3 text-sm text-content-secondary">
              Sales and growth teams run discovery, qualify intent, draft outreach, and push the best
              leads into CRM without switching tools.
            </p>
          </GlassCard>
        </div>
      </div>
    </SectionWrapper>
  );
};