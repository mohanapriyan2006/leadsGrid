import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import type { ElementType } from "react";

type Props = {
  title: string;
  description: string;
  icon: ElementType;
  scoreAnimation?: boolean;
  className?: string;
};

export const BentoGridCard = ({
  title,
  description,
  icon: Icon,
  scoreAnimation = false,
  className = "",
}: Props) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [score, setScore] = useState(0);
  const isInView = useInView(cardRef, { once: true, margin: "-60px" });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    if (!scoreAnimation || !isHovered) return;
    let current = 0;
    const target = 92;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.round(eased * target);
      setScore(current);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isHovered, scoreAnimation]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, type: "spring" as const, stiffness: 100, damping: 20 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-glass border border-accent/10 bg-surface-secondary/60 p-6 flex flex-col justify-between group transition-transform duration-300 transform-gpu hover:scale-[1.01] will-change-transform ${className}`}
    >
      {/* Inner spotlight overlay */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 z-0 mix-blend-screen transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, rgba(167, 139, 250, 0.12), transparent 80%)`,
          }}
        />
      )}

      {/* Border glow tracing */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-[-1px] z-10 rounded-glass"
          style={{
            background: `radial-gradient(120px circle at ${coords.x}px ${coords.y}px, rgba(167, 139, 250, 0.35), transparent 60%)`,
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: "1px",
            borderRadius: "inherit",
          }}
        />
      )}

      <div className="relative z-10">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-content/10 bg-surface-tertiary/50 text-accent shadow-[0_0_20px_rgba(167,139,250,0.1)] transition-shadow group-hover:shadow-[0_0_24px_rgba(167,139,250,0.25)]">
          <Icon className="w-5 h-5" />
        </div>

        <h3 className="mb-2 text-lg font-bold text-content tracking-tight">{title}</h3>
        <p className="text-sm leading-relaxed text-content-secondary">{description}</p>

        {scoreAnimation && (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs text-content-secondary uppercase tracking-wider">AI Score</span>
            <span className="text-xl font-bold text-accent tabular-nums">
              {scoreAnimation && isHovered ? score : 0}
            </span>
            <span className="text-xs text-content-tertiary">/ 100</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
