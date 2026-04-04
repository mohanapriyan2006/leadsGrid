import { Navbar } from "../../features/landing/components/layout/Navbar";
import { Footer } from "../../features/landing/components/layout/Footer";
import { HeroSection } from "../../features/landing/components/sections/HeroSection";
import { LiveDemoSection } from "../../features/landing/components/sections/LiveDemoSection";
import { HowItWorksSection } from "../../features/landing/components/sections/HowItWorksSection";
import { FeaturesSection } from "../../features/landing/components/sections/FeaturesSection";
import { WhyLeadsGridSection } from "../../features/landing/components/sections/WhyLeadsGridSection";
import { TryAiSection } from "../../features/landing/components/sections/TryAiSection";
import { SocialProofSection } from "../../features/landing/components/sections/SocialProofSection";
import { PricingSection } from "../../features/landing/components/sections/PricingSection";
import { FinalCtaSection } from "../../features/landing/components/sections/FinalCtaSection";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-surface text-white">
      <Navbar />
      <HeroSection />
      <LiveDemoSection />
      <HowItWorksSection />
      <FeaturesSection />
      <WhyLeadsGridSection />
      <TryAiSection />
      <SocialProofSection />
      <PricingSection />
      <FinalCtaSection />
      <Footer />
    </div>
  );
};
