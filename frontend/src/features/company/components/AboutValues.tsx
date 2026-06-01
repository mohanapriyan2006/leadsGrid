import { GlassCard } from "../../landing/components/ui/GlassCard";
import { SectionWrapper } from "../../landing/components/ui/SectionWrapper";

const VALUES = [
  {
    title: "Signal over noise",
    description: "We help teams focus on high-intent prospects instead of noisy, low-quality lists.",
  },
  {
    title: "Human-in-the-loop",
    description: "Automation supports decision-making while humans stay in control.",
  },
  {
    title: "Execution ready",
    description: "Every insight connects to a next step so teams can move instantly.",
  },
];

export const AboutValues = () => {
  return (
    <SectionWrapper className="py-12">
      <div className="grid gap-6 md:grid-cols-3">
        {VALUES.map((value) => (
          <GlassCard key={value.title} className="h-full">
            <h3 className="text-lg font-semibold text-content">{value.title}</h3>
            <p className="mt-3 text-sm text-content-secondary">{value.description}</p>
          </GlassCard>
        ))}
      </div>
    </SectionWrapper>
  );
};