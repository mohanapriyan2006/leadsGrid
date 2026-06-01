import { GradientText } from "../../landing/components/ui/GradientText";

export const AboutHero = () => {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-12 pt-8">
      <p className="text-xs uppercase tracking-[0.3em] text-content-secondary">About LeadsGrid</p>
      <h1 className="mt-4 text-4xl font-semibold text-content sm:text-5xl">
        Built to turn intent signals into real pipeline
      </h1>
      <p className="mt-5 max-w-3xl text-base text-content-secondary sm:text-lg">
        LeadsGrid is a focused SaaS platform that unifies lead discovery, AI-driven qualification, and
        outreach planning so teams can move faster without losing control of quality.
      </p>
      <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-content/10 bg-surface-secondary/60 px-4 py-2 text-xs text-content-secondary">
        Product philosophy: <GradientText>signal over noise, speed with guardrails</GradientText>
      </div>
    </section>
  );
};