import { useRef } from "react";
import { useInView } from "framer-motion";

export const useScrollAnimation = (once = true, margin = "-100px") => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: margin as `${number}px` });

  return { ref, isInView };
};
