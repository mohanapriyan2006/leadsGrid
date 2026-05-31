import { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { LeadNotificationCard } from "../ui/LeadNotificationCard";
import { CounterStat } from "../ui/CounterStat";
import { useLeadSimulation } from "../../hooks/useLeadSimulation";

const springConfig = { damping: 30, stiffness: 300, mass: 0.5 };

export const HeroDashboard3D = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { leads } = useLeadSimulation(3500, 3);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-300, 300], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(x, [-300, 300], [-12, 12]), springConfig);

  const layer2X = useSpring(useTransform(x, [-300, 300], [-25, 25]), springConfig);
  const layer2Y = useSpring(useTransform(y, [-300, 300], [-25, 25]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      className="relative flex items-center justify-center w-full min-h-[520px] [perspective:1200px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Aurora glow behind dashboard */}
      <div className="absolute w-[480px] h-[480px] bg-accent/15 blur-[120px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute w-[320px] h-[320px] bg-accent-secondary/10 blur-[100px] rounded-full pointer-events-none translate-x-20 translate-y-12" />

      <motion.div
        ref={cardRef}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full max-w-xl h-[460px] rounded-2xl border border-content/10 bg-surface-secondary/80 p-6 shadow-2xl backdrop-blur-xl cursor-pointer will-change-transform"
      >
        {/* Dashboard header */}
        <div className="flex items-center justify-between border-b border-content/5 pb-4" style={{ transform: "translateZ(0px)" }}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-danger/60" />
            <div className="w-3 h-3 rounded-full bg-warning/60" />
            <div className="w-3 h-3 rounded-full bg-success/60" />
          </div>
          <div className="text-xs text-content-secondary font-mono">leadsgrid-dashboard.dev</div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 my-6 text-center" style={{ transform: "translateZ(10px)" }}>
          <div className="rounded-glass-sm border border-content/5 bg-surface/50 p-4">
            <p className="text-[10px] text-content-secondary uppercase tracking-wider">Leads Found</p>
            <h3 className="text-2xl font-bold text-content mt-1">1,248</h3>
          </div>
          <div className="rounded-glass-sm border border-content/5 bg-surface/50 p-4">
            <p className="text-[10px] text-content-secondary uppercase tracking-wider">Avg Score</p>
            <h3 className="text-2xl font-bold text-accent mt-1">87.4</h3>
          </div>
          <div className="rounded-glass-sm border border-content/5 bg-surface/50 p-4">
            <p className="text-[10px] text-content-secondary uppercase tracking-wider">Conversion</p>
            <h3 className="text-2xl font-bold text-success mt-1">34%</h3>
          </div>
        </div>

        {/* Live lead notifications */}
        <div className="space-y-2" style={{ transform: "translateZ(5px)" }}>
          {leads.slice(0, 2).map((lead, idx) => (
            <LeadNotificationCard key={lead.id} lead={lead} index={idx} />
          ))}
        </div>

        {/* Bottom counter stats */}
        <div className="mt-4 grid grid-cols-3 gap-3" style={{ transform: "translateZ(8px)" }}>
          <CounterStat target={1248} className="text-base font-bold text-content" label="Found" />
          <CounterStat target={87} suffix=".4" className="text-base font-bold text-content" label="Score" />
          <CounterStat target={34} suffix="%" className="text-base font-bold text-content" label="Conv." />
        </div>

        {/* Parallax floating layer — pops above the card */}
        <motion.div
          style={{
            x: layer2X,
            y: layer2Y,
            translateZ: 60,
            transformStyle: "preserve-3d",
          }}
          className="absolute bottom-6 right-6 bg-gradient-to-r from-accent to-accent-secondary text-content-inverse p-4 rounded-xl shadow-2xl border border-white/20 pointer-events-none w-64 will-change-transform"
        >
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[11px] font-mono text-content/80">Just Now &bull; High Intent</span>
          </div>
          <p className="text-sm font-semibold mt-2 text-content-inverse">
            "Looking for a React developer ASAP"
          </p>
          <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center text-[11px] text-content/70">
            <span>Source: Reddit</span>
            <span className="bg-white/20 px-2 py-0.5 rounded font-bold">Score: 92</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
