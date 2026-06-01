import { GradientText } from "../../landing/components/ui/GradientText";

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  updatedAt: string;
};

export const LegalHero = ({ eyebrow, title, subtitle, updatedAt }: Props) => {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-10 pt-8">
      <p className="text-xs uppercase tracking-[0.3em] text-content-secondary">{eyebrow}</p>
      <h1 className="mt-4 text-4xl font-semibold text-content sm:text-5xl">
        <GradientText>{title}</GradientText>
      </h1>
      <p className="mt-4 max-w-3xl text-base text-content-secondary sm:text-lg">{subtitle}</p>
      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-content/10 bg-surface-secondary/60 px-4 py-2 text-xs text-content-secondary">
        Last updated: <span className="text-content">{updatedAt}</span>
      </div>
    </section>
  );
};