import { PublicPageShell } from "../../components/shared/PublicPageShell";
import { LegalHero } from "../../features/legal/components/LegalHero";
import { TermsContent } from "../../features/legal/components/TermsContent";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const TermsPage = () => {
  return (
    <PublicPageShell navLinks={NAV_LINKS}>
      <LegalHero
        eyebrow="Terms"
        title="Clear rules for a reliable platform"
        subtitle="These terms outline how to use LeadsGrid responsibly and what to expect from the service."
        updatedAt="June 2, 2026"
      />
      <TermsContent />
    </PublicPageShell>
  );
};