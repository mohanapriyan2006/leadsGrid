import { motion } from "framer-motion";
import type { ReactNode } from "react";

type GlowButtonVariant = "primary" | "secondary";

type Props = {
  children: ReactNode;
  variant?: GlowButtonVariant;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
};

const variantStyles: Record<GlowButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-accent to-accent-secondary text-white shadow-[0_0_30px_rgba(167,139,250,0.4)]",
  secondary:
    "bg-white/5 border border-white/10 text-white backdrop-blur-sm hover:bg-white/10",
};

export const GlowButton = ({ children, variant = "primary", className = "", onClick, disabled }: Props) => {
  return (
    <motion.button
      whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(167,139,250,0.6)" }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative rounded-xl px-7 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer disabled:opacity-50 ${variantStyles[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
};
