import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { SectionWrapper } from "../ui/SectionWrapper";
import { GradientText } from "../ui/GradientText";

const WITHOUT = [
  "Manual searching for hours",
  "Low-quality, irrelevant leads",
  "No intent filtering",
  "Wasted outreach effort",
];

const WITH = [
  "AI finds real buyers automatically",
  "High-intent leads only",
  "Automated workflow end-to-end",
  "Close deals 5x faster",
];

function ComparisonCard({
  title,
  items,
  icon: Icon,
  iconBg,
  iconColor,
  borderColor,
  glowColor,
  direction,
}: {
  title: string;
  items: string[];
  icon: typeof X;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  glowColor: string;
  direction: number;
}) {
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
      initial={{ opacity: 0, x: direction * 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, type: "spring" as const, stiffness: 100, damping: 20 }}
      whileHover={{ scale: 1.01 }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative overflow-hidden rounded-2xl border ${borderColor} p-8 shadow-[0_0_40px_${glowColor}] transition-shadow duration-300`}
        style={{ background: `rgba(${borderColor.includes('danger') ? '239,68,68' : '16,185,129'},0.03)` }}
      >
        {/* Inner spotlight */}
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 z-0 mix-blend-screen"
            style={{
              background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, rgba(${borderColor.includes('danger') ? '239,68,68' : '16,185,129'},0.08), transparent 80%)`,
            }}
          />
        )}

        <div className="relative z-10">
          <h3 className={`mb-6 font-display text-xl font-bold ${iconColor}`}>{title}</h3>
          <ul className="space-y-4">
            {items.map((item, idx) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: direction * -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: idx * 0.1,
                  type: "spring" as const,
                  stiffness: 100,
                  damping: 20,
                }}
                className="flex items-center gap-3 text-sm text-content-secondary transition-colors hover:text-content"
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${iconBg} text-xs ${iconColor}`}>
                  <Icon className="w-3 h-3" />
                </span>
                {item}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

export const WhyLeadsGridSection = () => {
  return (
    <SectionWrapper>
      <div className="mb-16 text-center">
        <h2 className="mb-4 font-display text-4xl font-bold md:text-5xl">
          Why <GradientText>LeadsGrid</GradientText>?
        </h2>
      </div>

      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
        <ComparisonCard
          title="Without LeadsGrid"
          items={WITHOUT}
          icon={X}
          iconBg="bg-danger/20"
          iconColor="text-danger"
          borderColor="border-danger/10"
          glowColor="rgba(239,68,68,0.06)"
          direction={-1}
        />
        <ComparisonCard
          title="With LeadsGrid"
          items={WITH}
          icon={Check}
          iconBg="bg-success/20"
          iconColor="text-success"
          borderColor="border-success/10"
          glowColor="rgba(16,185,129,0.06)"
          direction={1}
        />
      </div>
    </SectionWrapper>
  );
};
