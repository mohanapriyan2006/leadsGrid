export type SimulatedLead = {
  id: number;
  title: string;
  source: string;
  score: number;
  timestamp: string;
};

export type PricingTier = {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
};

export type FeatureItem = {
  icon: string;
  title: string;
  description: string;
};

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
};

export type HowItWorksStep = {
  step: number;
  title: string;
  description: string;
  icon: string;
};
