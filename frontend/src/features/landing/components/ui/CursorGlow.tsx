import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export const CursorGlow = () => {
  const [enabled, setEnabled] = useState(false);

  const x = useMotionValue(-500);
  const y = useMotionValue(-500);

  const springX = useSpring(x, { damping: 50, stiffness: 150, mass: 0.8 });
  const springY = useSpring(y, { damping: 50, stiffness: 150, mass: 0.8 });

  useEffect(() => {
    // Disable on touch devices
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;
    setEnabled(true);

    const handleMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[1]"
      style={{ x: springX, y: springY }}
    >
      <div
        className="absolute h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/6 blur-[120px]"
        style={{ willChange: "transform" }}
      />
    </motion.div>
  );
};
