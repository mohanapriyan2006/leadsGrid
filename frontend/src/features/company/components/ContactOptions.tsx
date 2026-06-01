import { GlassCard } from "../../landing/components/ui/GlassCard";
import { SectionWrapper } from "../../landing/components/ui/SectionWrapper";

type ContactOption = {
  title: string;
  description: string;
  href: string;
//   action: string;
};

const OPTIONS: ContactOption[] = [
  {
    title: "Sales and demos",
    description: "See the platform in action and discuss the right plan for your team.",
    href: "mailto:leadsgridai@gmail.com",
    // action: "Email sales",
  },
  {
    title: "Product support",
    description: "Get help with onboarding, billing, or technical troubleshooting.",
    href: "mailto:leadsgridai@gmail.com",
    // action: "Email support",
  },
  {
    title: "Security and privacy",
    description: "Ask about compliance, data handling, or security reviews.",
    href: "mailto:leadsgridai@gmail.com",
    // action: "Contact security",
  },
];

export const ContactOptions = () => {
  return (
    <SectionWrapper className="py-12">
      <div className="grid gap-6 md:grid-cols-3">
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
    </SectionWrapper>
  );
};