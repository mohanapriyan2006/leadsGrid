import { motion } from "framer-motion";
import type { ElementType } from "react";

type Props = {
  icon: ElementType;
  label: string;
  colorClass: string;
  glowClass: string;
};

export const PlatformIcon = ({ icon: Icon, label, colorClass, glowClass }: Props) => {
  return (
    <motion.div
      className={`relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-surface-secondary/80 shadow-glass backdrop-blur-xl will-change-transform`}
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Glow ring */}
      <div className={`absolute inset-0 rounded-2xl ${glowClass} opacity-30 blur-md`} />
      <Icon className={`relative z-10 h-7 w-7 ${colorClass}`} />
      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-content-secondary">
        {label}
      </span>
    </motion.div>
  );
};
