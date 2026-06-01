import { PublicPageShell } from "../../components/shared/PublicPageShell";
import { ContactHero } from "../../features/company/components/ContactHero";
import { ContactSection } from "../../features/company/components/ContactSection";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/#pricing" },
];

export const ContactPage = () => {
  return (
    <PublicPageShell navLinks={NAV_LINKS}>
      <ContactHero />
      <ContactSection />
    </PublicPageShell>
  );
};