import { motion } from "framer-motion";
import { Brain } from "lucide-react";

export const AICoreNode = ({ scale = 1, pulsing = true }: { scale?: number; pulsing?: boolean }) => {
  return (
    <motion.div
      className="relative flex h-24 w-24 items-center justify-center"
      animate={pulsing ? { scale: [1, 1.08, 1] } : {}}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      style={{ transform: `scale(${scale})` }}
    >
      {/* Outer aura rings */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/20 to-accent-secondary/10 blur-2xl animate-pulse" />
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-accent/15 to-accent-tertiary/10 blur-xl" />

      {/* Core sphere */}
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-accent/30 bg-surface-secondary/90 shadow-[0_0_40px_rgba(167,139,250,0.35)] backdrop-blur-xl">
        <Brain className="h-8 w-8 text-accent" />
      </div>

      {/* Orbiting particles */}
      <div className="absolute inset-[-8px] animate-spin-slow pointer-events-none">
        <span className="absolute top-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
      </div>
      <div className="absolute inset-[-16px] animate-spin-slow pointer-events-none" style={{ animationDirection: "reverse", animationDuration: "12s" }}>
        <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent-secondary shadow-[0_0_6px_rgba(139,92,246,0.8)]" />
      </div>
    </motion.div>
  );
};
