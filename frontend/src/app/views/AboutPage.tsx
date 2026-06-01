import { PublicPageShell } from "../../components/shared/PublicPageShell";
import { AboutHero } from "../../features/company/components/AboutHero";
import { AboutStory } from "../../features/company/components/AboutStory";
import { AboutValues } from "../../features/company/components/AboutValues";
import { FounderCard } from "../../features/company/components/FounderCard";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Contact", href: "/contact" },
];

export const AboutPage = () => {
  return (
    <PublicPageShell navLinks={NAV_LINKS}>
      <AboutHero />
      <AboutStory />
      <AboutValues />
      <FounderCard
        name="Mohanapriyan M"
        title="Founder & Developer"
        role="Full stack developer"
        location="Tamil Nadu, India"
        links={[
          { label: "Email", href: "mailto:mohanapriyan.m2006@gmail.com" },
          { label: "LinkedIn", href: "https://linkedin.com/in/mohanapriyan-m2006" },
          { label: "GitHub", href: "https://github.com/mohanapriyan2006" },
          { label: "Portfolio", href: "https://mohanapriyan.netlify.app/" },
          { label: "Website", href: "https://mohanapriyan.dev/" },
        ]}
      />
    </PublicPageShell>
  );
};