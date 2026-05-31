import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, Brain, MessageSquare } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GradientText } from "../ui/GradientText";
import { AICoreNode } from "../ui/AICoreNode";

gsap.registerPlugin(ScrollTrigger);

const PLATFORMS = [
  { label: "Reddit", initial: "R", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-400/20", pos: { x: -280, y: -120 } },
  { label: "LinkedIn", initial: "in", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-400/20", pos: { x: 280, y: -120 } },
  { label: "Google", initial: "G", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-400/20", pos: { x: -280, y: 120 } },
  { label: "Twitter/X", initial: "X", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-400/20", pos: { x: 280, y: 120 } },
];

const STEPS = [
  { step: 1, title: "Discover", description: "AI scans Reddit, LinkedIn, Google & more", icon: Globe },
  { step: 2, title: "Analyze", description: "AI detects real buying intent signals", icon: Brain },
  { step: 3, title: "Convert", description: "Get ready-to-contact high-score leads", icon: MessageSquare },
];

export const HowItWorksSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement[]>([]);
  const coreRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const beamsRef = useRef<SVGSVGElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useGSAP(() => {
    if (isMobile || !sectionRef.current || !viewportRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=250%",
          pin: viewportRef.current,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

      // Phase 1: Icons fade in from edges (0-20%)
      iconsRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { opacity: 0, scale: 0.6, x: PLATFORMS[i].pos.x, y: PLATFORMS[i].pos.y });
        tl.to(el, { opacity: 1, scale: 1, duration: 0.2 }, i * 0.02);
      });

      // Phase 2: Icons converge to center (20-55%)
      iconsRef.current.forEach((el) => {
        if (!el) return;
        tl.to(el, { x: 0, y: 0, duration: 0.35, ease: "power2.inOut" }, 0.2);
      });

      // Beams draw in (35-55%)
      if (beamsRef.current) {
        const paths = beamsRef.current.querySelectorAll("path");
        paths.forEach((path) => {
          const len = (path as SVGPathElement).getTotalLength?.() || 200;
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
          tl.to(path, { strokeDashoffset: 0, duration: 0.2 }, 0.35);
        });
      }

      // Phase 3: Icons fade, core pulses (55-70%)
      iconsRef.current.forEach((el) => {
        if (!el) return;
        tl.to(el, { opacity: 0, scale: 0.5, duration: 0.1 }, 0.55);
      });

      if (coreRef.current) {
        tl.to(coreRef.current, { scale: 1.3, duration: 0.15, ease: "power2.out" }, 0.55);
        tl.to(coreRef.current, { scale: 1, duration: 0.1, ease: "power2.in" }, 0.7);
      }

      // Phase 4: Step cards reveal (70-100%)
      if (stepsRef.current) {
        const cards = stepsRef.current.children;
        gsap.set(cards, { opacity: 0, y: 60, scale: 0.9 });
        Array.from(cards).forEach((card, i) => {
          tl.to(card, { opacity: 1, y: 0, scale: 1, duration: 0.1, ease: "power2.out" }, 0.7 + i * 0.05);
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, { scope: sectionRef, dependencies: [isMobile] });

  // Mobile static fallback
  if (isMobile) {
    return (
      <section id="how-it-works" className="relative mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-display text-3xl font-bold">
            How <GradientText>It Works</GradientText>
          </h2>
          <p className="mx-auto max-w-lg text-base text-content-secondary">
            Three simple steps to automated lead generation
          </p>
        </div>
        <div className="grid gap-6">
          {STEPS.map((step) => (
            <div key={step.step} className="rounded-glass border border-accent/10 bg-surface-secondary/60 p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/30 bg-accent-soft text-accent">
                  <step.icon className="w-4 h-4" />
                </div>
                <h3 className="font-display text-lg font-bold text-content">{step.title}</h3>
              </div>
              <p className="text-sm text-content-secondary">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} id="how-it-works" className="relative min-h-[350vh]">
      <div ref={viewportRef} className="relative flex h-screen items-center justify-center overflow-hidden">
        {/* Background title */}
        <div className="absolute top-12 left-0 right-0 text-center">
          <h2 className="mb-2 font-display text-4xl font-bold md:text-5xl">
            How <GradientText>It Works</GradientText>
          </h2>
          <p className="mx-auto max-w-lg text-lg text-content-secondary">
            AI aggregates leads from every corner of the internet
          </p>
        </div>

        {/* Platform icons (animated by GSAP) */}
        {PLATFORMS.map((p, i) => (
          <div
            key={p.label}
            ref={(el) => { if (el) iconsRef.current[i] = el; }}
            className={`absolute flex h-14 w-14 items-center justify-center rounded-xl border ${p.border} ${p.bg} backdrop-blur-xl will-change-transform`}
          >
            <span className={`text-lg font-bold ${p.color}`}>{p.initial}</span>
          </div>
        ))}

        {/* Connector beams SVG */}
        <svg ref={beamsRef} className="absolute inset-0 pointer-events-none" viewBox="-400 -250 800 500">
          {PLATFORMS.map((p, i) => (
            <path
              key={p.label}
              d={`M ${p.pos.x} ${p.pos.y} Q ${p.pos.x * 0.3} ${p.pos.y * 0.3} 0 0`}
              fill="none"
              stroke="url(#beamGradient)"
              strokeWidth="1.5"
              opacity="0.6"
            />
          ))}
          <defs>
            <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(167,139,250,0.4)" />
              <stop offset="100%" stopColor="rgba(99,102,241,0.1)" />
            </linearGradient>
          </defs>
        </svg>

        {/* AI Core node */}
        <div ref={coreRef} className="absolute will-change-transform">
          <AICoreNode pulsing={false} />
        </div>

        {/* Step cards (animated by GSAP) */}
        <div ref={stepsRef} className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-6 opacity-0">
          {STEPS.map((step) => (
            <div
              key={step.step}
              className="w-56 rounded-glass border border-accent/10 bg-surface-secondary/70 p-5 text-center shadow-glass backdrop-blur-xl"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent-soft text-accent">
                <step.icon className="w-5 h-5" />
              </div>
              <h3 className="mb-1 font-display text-base font-bold text-content">{step.title}</h3>
              <p className="text-xs text-content-secondary leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
