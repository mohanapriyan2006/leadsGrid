import { useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

export const TiltCard = ({
  children,
  className = "",
  glare = true,
  maxTilt = 12,
}: {
  children: ReactNode;
  className?: string;
  glare?: boolean;
  maxTilt?: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({ transform: "", glareOpacity: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * maxTilt;
    const rotateY = (x - 0.5) * maxTilt;
    setStyle({
      transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`,
      glareOpacity: glare ? Math.max(0, 0.15 - Math.abs(x - 0.5) * 0.2 - Math.abs(y - 0.5) * 0.2) : 0,
    });
  };

  const handleMouseLeave = () => {
    setStyle({ transform: "", glareOpacity: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: style.transform, transformStyle: "preserve-3d" }}
      className={`relative ${className}`}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
      {glare && (
        <div
          className="pointer-events-none absolute inset-0 rounded-inherit"
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3), transparent 60%)`,
            opacity: style.glareOpacity,
            mixBlendMode: "overlay",
          }}
        />
      )}
    </motion.div>
  );
};
