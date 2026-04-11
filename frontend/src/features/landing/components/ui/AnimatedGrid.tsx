import { motion } from "framer-motion";

export const AnimatedGrid = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Animated grid lines */}
      <div className="absolute inset-0 opacity-[0.07]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(167,139,250,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(167,139,250,0.3) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Floating glow orbs */}
      <motion.div
        animate={{ x: [0, 100, 0], y: [0, -50, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-accent/20 blur-[100px]"
      />
      <motion.div
        animate={{ x: [0, -80, 0], y: [0, 60, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-1/4 top-1/3 h-96 w-96 rounded-full bg-accent-secondary/15 blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, 50, 0], y: [0, -30, 0], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 left-1/3 h-60 w-60 rounded-full bg-accent/15 blur-[80px]"
      />
    </div>
  );
};
