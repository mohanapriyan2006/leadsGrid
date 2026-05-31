import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { SectionWrapper } from "../ui/SectionWrapper";
import { GradientText } from "../ui/GradientText";
import type { Testimonial } from "../../types/landing";

const TESTIMONIALS: Testimonial[] = [
  { quote: "Saved me 10+ hours/week. I close 3x more deals now.", author: "Alex M.", role: "Freelance Developer" },
  { quote: "Finally real leads, not junk. The AI scoring is insanely accurate.", author: "Sarah K.", role: "Agency Owner" },
  { quote: "Like having a full-time lead gen team for the price of lunch.", author: "David R.", role: "SaaS Founder" },
];

function TestimonialCard({ testimonial, idx }: { testimonial: Testimonial; idx: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        delay: idx * 0.15,
        type: "spring" as const,
        stiffness: 100,
        damping: 20,
      }}
      whileHover={{ scale: 1.02 }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative overflow-hidden rounded-glass border border-accent/10 bg-surface-secondary/60 p-6 h-full shadow-glass backdrop-blur-xl transition-transform duration-300"
      >
        {/* Inner spotlight */}
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 z-0 mix-blend-screen transition-opacity duration-300"
            style={{
              background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, rgba(167,139,250,0.1), transparent 80%)`,
            }}
          />
        )}

        {/* Border glow */}
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-[-1px] z-10 rounded-glass"
            style={{
              background: `radial-gradient(100px circle at ${coords.x}px ${coords.y}px, rgba(167,139,250,0.3), transparent 60%)`,
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              padding: "1px",
              borderRadius: "inherit",
            }}
          />
        )}

        <div className="relative z-10">
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
        </div>
      </div>
    </motion.div>
  );
}

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
          <TestimonialCard key={testimonial.author} testimonial={testimonial} idx={idx} />
        ))}
      </div>
    </SectionWrapper>
  );
};
