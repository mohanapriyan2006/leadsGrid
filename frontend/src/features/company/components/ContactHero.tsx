import { GradientText } from "../../landing/components/ui/GradientText";

export const ContactHero = () => {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-12 pt-8">
      <p className="text-xs uppercase tracking-[0.3em] text-content-secondary">Contact</p>
      <h1 className="mt-4 text-4xl font-semibold text-content sm:text-5xl">
        <GradientText>Let us help you move faster</GradientText>
      </h1>
      <p className="mt-5 max-w-3xl text-base text-content-secondary sm:text-lg">
        Reach out for product demos, onboarding guidance, or support. We respond within 1 to 2 business days.
      </p>
    </section>
  );
};