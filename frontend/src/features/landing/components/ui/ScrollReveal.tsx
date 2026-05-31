import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  once?: boolean;
  margin?: string;
};

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (custom: { delay: number; duration: number; y: number }) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: custom.duration,
      delay: custom.delay,
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  }),
};

export const ScrollReveal = ({
  children,
  className = "",
  delay = 0,
  duration = 0.8,
  y = 30,
  once = true,
  margin = "-100px",
}: Props) => {
  return (
    <motion.div
      variants={defaultVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: margin as `${number}px` }}
      custom={{ delay, duration, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
