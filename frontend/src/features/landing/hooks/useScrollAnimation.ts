import { useRef } from "react";
import { useInView } from "framer-motion";

export const useScrollAnimation = (once = true, margin = "-120px") => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once,
    margin: margin as `${number}px`,
    amount: 0.2,
  });

  return { ref, isInView };
};
