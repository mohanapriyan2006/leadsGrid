import { LegalSectionCard } from "./LegalSectionCard";
import { SectionWrapper } from "../../landing/components/ui/SectionWrapper";

const TERMS_SECTIONS = [
  {
    title: "Using the service",
    items: [
      "You must provide accurate account information and keep it updated.",
      "You are responsible for all activity performed under your account.",
      "Do not misuse the platform or attempt to access restricted data.",
    ],
  },
  {
    title: "Acceptable use",
    items: [
      "Do not send spam, abusive outreach, or harmful content.",
      "Respect applicable privacy and outreach regulations.",
      "Follow fair usage limits on your subscription tier.",
    ],
  },
  {
    title: "Subscriptions",
    items: [
      "Paid plans renew automatically unless cancelled before renewal.",
      "You can change or cancel your plan from your account settings.",
      "Credits, usage, and limits reset on the billing cycle.",
    ],
  },
  {
    title: "Data responsibility",
    items: [
      "You own the data you bring into LeadsGrid.",
      "You grant LeadsGrid permission to process data to provide the service.",
      "You are responsible for obtaining necessary permissions from your leads.",
    ],
  },
  {
    title: "Availability",
    items: [
      "We strive for high uptime but cannot guarantee uninterrupted service.",
      "Planned maintenance windows will be announced when possible.",
      "We may update features to improve security and performance.",
    ],
  },
  {
    title: "Termination",
    items: [
      "You may close your account at any time.",
      "We may suspend accounts for policy violations or abuse.",
      "Upon termination, your data will be handled per the privacy policy.",
    ],
  },
];

export const TermsContent = () => {
  return (
    <SectionWrapper className="py-16">
      <div className="grid gap-6 md:grid-cols-2">
        {TERMS_SECTIONS.map((section) => (
          <LegalSectionCard key={section.title} title={section.title}>
            <ul className="list-disc space-y-2 pl-4">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </LegalSectionCard>
        ))}
      </div>
    </SectionWrapper>
  );
};