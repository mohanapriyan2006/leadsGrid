import { LegalSectionCard } from "./LegalSectionCard";
import { SectionWrapper } from "../../landing/components/ui/SectionWrapper";

const PRIVACY_SECTIONS = [
  {
    title: "What we collect",
    items: [
      "Account details such as name, email, and company information.",
      "Usage activity like feature access, page views, and workflow events.",
      "Lead metadata you upload or generate inside the platform.",
    ],
  },
  {
    title: "How we use data",
    items: [
      "Operate, maintain, and improve the LeadsGrid product.",
      "Personalize your workflows and surface relevant insights.",
      "Provide support, security monitoring, and incident response.",
    ],
  },
  {
    title: "Data storage",
    items: [
      "We keep data in secure, access-controlled infrastructure.",
      "Retention follows account status and applicable legal requirements.",
      "You can request export or deletion of your data at any time.",
    ],
  },
  {
    title: "Sharing",
    items: [
      "We never sell your data.",
      "Limited sharing may occur with trusted processors for hosting or email delivery.",
      "We only share when required by law or to protect user safety.",
    ],
  },
  {
    title: "Security",
    items: [
      "Role-based access controls and activity logging are enforced.",
      "Sensitive secrets are encrypted at rest and in transit.",
      "We regularly review infrastructure and application security.",
    ],
  },
  {
    title: "Your choices",
    items: [
      "Access, edit, or delete your profile information anytime.",
      "Control notification preferences and marketing emails.",
      "Reach out for data export or account closure requests.",
    ],
  },
];

export const PrivacyContent = () => {
  return (
    <SectionWrapper className="py-16">
      <div className="grid gap-6 md:grid-cols-2">
        {PRIVACY_SECTIONS.map((section) => (
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