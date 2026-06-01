import { GlassCard } from "../../landing/components/ui/GlassCard";
import { GradientText } from "../../landing/components/ui/GradientText";

type ContactOption = {
  title: string;
  description: string;
  href: string;
  action: string;
};

const OPTIONS: ContactOption[] = [
  {
    title: "Sales and demos",
    description: "See the platform in action and discuss the right plan for your team.",
    href: "mailto:leadsgridai@gmail.com",
    action: "Email sales",
  },
  {
    title: "Product support",
    description: "Get help with onboarding, billing, or technical troubleshooting.",
    href: "mailto:leadsgridai@gmail.com",
    action: "Email support",
  },
  {
    title: "Security and privacy",
    description: "Ask about compliance, data handling, or security reviews.",
    href: "mailto:leadsgridai@gmail.com",
    action: "Contact security",
  },
];

export const ContactOptions = () => {
  return (
    <div className="flex h-full flex-col gap-6">
      <GlassCard>
        <p className="text-xs uppercase tracking-[0.3em] text-content-secondary">Start here</p>
        <h3 className="mt-3 text-2xl font-semibold text-content">
          <GradientText>We would love to hear from you</GradientText>
        </h3>
        <p className="mt-3 text-sm text-content-secondary">
          Tell us about your workflow, your lead sources, or the outcomes you want from LeadsGrid.
        </p>
      </GlassCard>
      <div className="grid gap-4">
        {OPTIONS.map((option) => (
          <GlassCard key={option.title} className="flex h-full flex-col">
            <h3 className="text-lg font-semibold text-content">{option.title}</h3>
            <p className="mt-3 text-sm text-content-secondary">{option.description}</p>
            {/* <a
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent-secondary"
              href={option.href}
            >
              {option.action}
            </a> */}
          </GlassCard>
        ))}
      </div>
    </div>
  );
};