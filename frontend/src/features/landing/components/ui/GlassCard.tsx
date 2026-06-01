import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  hoverGlow?: boolean;
  hoverTilt?: boolean;
};

export const GlassCard = ({
  children,
  className = "",
  hoverGlow = true,
  hoverTilt = false,
}: Props) => {
  return (
    <motion.div
      whileHover={
        hoverTilt
          ? { scale: 1.03, rotateX: 2, rotateY: 2, boxShadow: "0 0 40px rgba(167,139,250,0.35)" }
          : hoverGlow
            ? { boxShadow: "0 0 40px rgba(167,139,250,0.35)" }
            : undefined
      }
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`rounded-2xl border border-content/10 bg-surface-tertiary/30 p-6 backdrop-blur-xl shadow-[0_0px_10px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.04)] ${className}`}
    >
      {children}
    </motion.div>
  );
};
