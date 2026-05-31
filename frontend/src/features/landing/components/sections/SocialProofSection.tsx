import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { SectionWrapper } from "../ui/SectionWrapper";
import { GlassCard } from "../ui/GlassCard";
import { GradientText } from "../ui/GradientText";
import type { Testimonial } from "../../types/landing";

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Saved me 10+ hours/week. I close 3x more deals now.",
    author: "Alex M.",
    role: "Freelance Developer",
  },
  {
    quote: "Finally real leads, not junk. The AI scoring is insanely accurate.",
    author: "Sarah K.",
    role: "Agency Owner",
  },
  {
    quote: "Like having a full-time lead gen team for the price of lunch.",
    author: "David R.",
    role: "SaaS Founder",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.15 },
  }),
};

export const SocialProofSection = () => {
  return (
    <SectionWrapper>
      <div className="mb-16 text-center">
        <h2 className="mb-4 font-display text-4xl font-bold md:text-5xl">
          Loved by <GradientText>Early Users</GradientText>
        </h2>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((testimonial, idx) => (
          <motion.div
            key={testimonial.author}
            custom={idx}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <GlassCard className="h-full">
              {/* Star rating */}
              <div className="mb-4 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <motion.div
                    key={s}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.15 + s * 0.08 }}
                  >
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  </motion.div>
                ))}
              </div>
              <p className="mb-6 text-sm leading-relaxed text-content-secondary">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-secondary text-xs font-bold text-content-inverse">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-content">{testimonial.author}</p>
                  <p className="text-xs text-content-secondary">{testimonial.role}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};
