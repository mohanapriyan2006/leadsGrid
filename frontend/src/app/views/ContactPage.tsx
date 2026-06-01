import { PublicPageShell } from "../../components/shared/PublicPageShell";
import { ContactHero } from "../../features/company/components/ContactHero";
import { ContactOptions } from "../../features/company/components/ContactOptions";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/#pricing" },
];

export const ContactPage = () => {
  return (
    <PublicPageShell navLinks={NAV_LINKS}>
      <ContactHero />
      <ContactOptions />
    </PublicPageShell>
  );
};