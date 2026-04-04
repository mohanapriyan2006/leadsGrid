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
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`relative mx-auto max-w-7xl px-6 py-24 ${className}`}
    >
      {children}
    </motion.section>
  );
};
