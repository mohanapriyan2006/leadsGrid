import { GlassCard } from "../../landing/components/ui/GlassCard";
import { SectionWrapper } from "../../landing/components/ui/SectionWrapper";
import { GradientText } from "../../landing/components/ui/GradientText";
import { Mail, Globe } from "lucide-react";

type Props = {
  name: string;
  title: string;
  location: string;
  role: string;
  links: Array<{ label: string; href: string }>;
};

export const FounderCard = ({ name, title, location, role, links }: Props) => {
  const getLinkIcon = (label: string) => {
    const key = label.toLowerCase();
    if (key.includes("email")) return Mail;
    return Globe;
  };

  return (
    <SectionWrapper className="py-16">
      <GlassCard className="mx-auto max-w-4xl">
        <p className="text-xs uppercase tracking-[0.3em] text-content-secondary">Owner and builder</p>
        <h2 className="mt-3 text-2xl font-semibold text-content">
          <GradientText>{name}</GradientText>
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-content-secondary">
          <span className="rounded-full border border-content/10 bg-surface-secondary/60 px-3 py-1">{title}</span>
          <span className="rounded-full border border-content/10 bg-surface-secondary/60 px-3 py-1">{role}</span>
          <span className="rounded-full border border-content/10 bg-surface-secondary/60 px-3 py-1">{location}</span>
        </div>
        <p className="mt-4 text-sm text-content-secondary">
          LeadsGrid is an independently built SaaS product with a focus on practical, outcome-driven
          automation for sales teams.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          {links.map((link) => (
            (() => {
              const Icon = getLinkIcon(link.label);
              return (
            <a
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-2 rounded-full border border-content/10 bg-surface-secondary/50 px-3 py-1.5 text-content-secondary transition-colors hover:text-accent"
              target="_blank"
              rel="noreferrer"
            >
              <Icon className="h-4 w-4"  />
              {link.label}
            </a>
              );
            })()
          ))}
        </div>
      </GlassCard>
    </SectionWrapper>
  );
};