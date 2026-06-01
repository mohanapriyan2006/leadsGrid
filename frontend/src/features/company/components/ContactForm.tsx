import { GlassCard } from "../../landing/components/ui/GlassCard";
import { GlowButton } from "../../landing/components/ui/GlowButton";

export const ContactForm = () => {
  return (
    <GlassCard className="h-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-content">Send a quick note</h3>
          <p className="mt-2 text-sm text-content-secondary">
            Share a short message and we will follow up with the right next steps.
          </p>
        </div>
        <span className="rounded-full border border-content/10 bg-surface-secondary/60 px-3 py-1 text-xs text-content-secondary">
          Typical reply: 1 to 2 days
        </span>
      </div>

      <form className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-content-secondary">
            Name
            <input
              type="text"
              name="name"
              placeholder="Your name"
              className="mt-2 w-full rounded-xl border border-content/10 bg-surface-secondary/60 px-4 py-3 text-sm text-content placeholder:text-content-tertiary focus:border-accent/60 focus:outline-none"
            />
          </label>
          <label className="text-sm text-content-secondary">
            Email
            <input
              type="email"
              name="email"
              placeholder="you@company.com"
              className="mt-2 w-full rounded-xl border border-content/10 bg-surface-secondary/60 px-4 py-3 text-sm text-content placeholder:text-content-tertiary focus:border-accent/60 focus:outline-none"
            />
          </label>
        </div>
        <label className="text-sm text-content-secondary">
          Message
          <textarea
            name="message"
            rows={4}
            placeholder="Tell us what you need help with."
            className="mt-2 w-full resize-none rounded-xl border border-content/10 bg-surface-secondary/60 px-4 py-3 text-sm text-content placeholder:text-content-tertiary focus:border-accent/60 focus:outline-none"
          />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-content-secondary">
            By submitting, you agree to our privacy policy.
          </p>
          <GlowButton className="text-xs">Send message</GlowButton>
        </div>
      </form>
    </GlassCard>
  );
};