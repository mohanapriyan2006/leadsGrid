import { Zap, Search, Bot, BarChart3 } from "lucide-react";
import { SectionWrapper } from "../ui/SectionWrapper";
import { GradientText } from "../ui/GradientText";
import { BentoGridCard } from "../ui/BentoGridCard";

export const FeaturesSection = () => {
  return (
    <SectionWrapper id="features">
      <div className="mb-16 text-center">
        <h2 className="mb-4 font-display text-4xl font-bold md:text-5xl">
          Powerful <GradientText>Features</GradientText>
        </h2>
        <p className="mx-auto max-w-lg text-lg text-content-secondary">
          Everything you need to find and close high-intent clients
        </p>
      </div>

      {/* Asymmetrical Bento Grid */}
      <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
        {/* Row 1: Large + Small */}
        <BentoGridCard
          title="AI Lead Scoring"
          description="Know which leads will convert before you ever send a message. Our AI analyzes intent signals, engagement history, and source quality to surface only the hottest prospects."
          icon={Zap}
          scoreAnimation
          className="md:col-span-2 md:row-span-1 min-h-[260px]"
        />
        <BentoGridCard
          title="Multi-Source Discovery"
          description="Reddit, Google, LinkedIn — all in one unified pipeline."
          icon={Search}
          className="min-h-[260px]"
        />

        {/* Row 2: Small + Large */}
        <BentoGridCard
          title="Agent Mode"
          description="Let AI find, analyze, and prepare outreach sequences on autopilot."
          icon={Bot}
          className="min-h-[260px]"
        />
        <BentoGridCard
          title="Smart CRM"
          description="Track every lead through a clean, Kanban-style pipeline with automated follow-up reminders, stage transitions, and conversion analytics built right in."
          icon={BarChart3}
          className="md:col-span-2 md:row-span-1 min-h-[260px]"
        />
      </div>
    </SectionWrapper>
  );
};
