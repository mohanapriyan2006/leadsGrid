import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

type Props = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export const SectionWrapper = ({ children, className = "", id }: Props) => {
  const { ref, isInView } = useScrollAnimation();

  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 60, scale: 0.98 }}
      animate={
        isInView
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 60, scale: 0.98 }
      }
      transition={{ type: "spring", stiffness: 90, damping: 18, mass: 0.7 }}
      className={`relative mx-auto max-w-7xl px-6 py-24 ${className}`}
    >
      {children}
    </motion.section>
  );
};
