import { PublicPageShell } from "../../components/shared/PublicPageShell";
import { LegalHero } from "../../features/legal/components/LegalHero";
import { PrivacyContent } from "../../features/legal/components/PrivacyContent";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const PrivacyPage = () => {
  return (
    <PublicPageShell navLinks={NAV_LINKS}>
      <LegalHero
        eyebrow="Privacy"
        title="Your data, protected"
        subtitle="This privacy policy explains what data we collect, how we use it, and the controls you have as a LeadsGrid customer."
        updatedAt="June 2, 2026"
      />
      <PrivacyContent />
    </PublicPageShell>
  );
};