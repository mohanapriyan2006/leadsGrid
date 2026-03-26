import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ScoreBadge } from "../../components/ui/ScoreBadge";
import { Tag } from "../../components/ui/Tag";
import { MOCK_LEADS } from "../../features/leads/constants/mockLeads";

export const LandingPage = () => {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: "◉",
      title: "Discovery Engine",
      desc: "Multi-dimensional scanning across LinkedIn, Reddit, and X Threads to surface high-probability prospects.",
    },
    {
      icon: "⚡",
      title: "Intent Scoring",
      desc: "Neural ranking of leads based on conversion probability and firmographic alignment.",
    },
    {
      icon: "∞",
      title: "Synthesis AI",
      desc: "Automated value propositions tailored to each account's active pain points.",
    },
    {
      icon: "◈",
      title: "Pipeline CRM",
      desc: "Context-aware deal tracking with action prompts based on engagement signals.",
    },
  ];

  const enterApp = () => navigate("/dashboard");

  return (
    <div className="min-h-screen overflow-y-auto bg-[#060A10] text-[#F9FAFB]">
      <nav className="sticky top-0 z-20 flex h-14 items-center gap-8 border-b border-white/5 bg-[#060A10]/90 px-6 backdrop-blur lg:px-12">
        <div className="mr-auto flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-accentSoft to-indigo-600 font-black">K</div>
          <span className="text-sm font-bold tracking-[0.14em]">PITCHPILOT</span>
        </div>
        <button className="text-[11px] tracking-[0.12em] text-text-dim">HOME</button>
        <button className="text-[11px] tracking-[0.12em] text-text-dim">SYSTEM</button>
        <button className="text-[11px] tracking-[0.12em] text-text-dim">PROCESS</button>
        <button className="text-[11px] tracking-[0.12em] text-text-dim">CAPITAL</button>
        <button
          onClick={enterApp}
          className="rounded border border-accent/50 bg-accent/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.1em] text-accent"
        >
          ACCESS ENGINE
        </button>
      </nav>

      <section className="mx-auto max-w-5xl px-6 pb-14 pt-16 text-center lg:px-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
          VERSION 4.9 // DEPLOYMENT READY
        </div>
        <h1 className="mt-8 text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
          THE PRECISION
          <br />
          <span className="bg-gradient-to-br from-accent to-indigo-400 bg-clip-text text-transparent">SALES ENGINE</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-text-dim">
          Autonomous client discovery and intent-based outreach. Engineered for enterprise velocity and execution quality.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={enterApp}
            className="rounded bg-gradient-to-br from-accentSoft to-indigo-600 px-8 py-3 text-xs font-bold tracking-[0.12em] text-white shadow-[0_0_30px_rgba(124,58,237,0.35)]"
          >
            INITIALIZE DEPLOYMENT
          </button>
          <button className="rounded border border-white/15 px-8 py-3 text-xs tracking-[0.12em] text-text-dim">TECHNICAL SPECIFICATIONS</button>
        </div>
      </section>

      <section className="mx-auto mb-16 max-w-5xl px-6 lg:px-12">
        <div className="overflow-hidden rounded-xl border border-accent/25 bg-panel/85 shadow-aura">
          <div className="flex items-center gap-2 border-b border-white/10 bg-panelSoft/70 px-4 py-2 text-sm">
            <span className="font-bold text-white">PitchPilot</span>
            <div className="ml-auto flex gap-2 text-text-dim">
              <span>◉</span>
              <span>—</span>
              <span>✕</span>
            </div>
          </div>
          <div className="space-y-2 p-4">
            {MOCK_LEADS.slice(0, 3).map((lead) => (
              <div key={lead.id} className="flex items-center gap-3 rounded border border-white/10 bg-black/25 p-3">
                <div className="flex-1">
                  <p className="text-sm text-white">{lead.content.slice(0, 52)}...</p>
                  <div className="mt-1 flex gap-1">
                    {lead.tags.map((tag) => (
                      <Tag key={tag} label={tag} />
                    ))}
                  </div>
                </div>
                <ScoreBadge score={lead.score} />
                <button onClick={enterApp} className="rounded border border-accent/45 bg-accent/15 px-3 py-1 text-[10px] font-bold tracking-[0.1em] text-accent">
                  ENGAGE
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mb-16 max-w-5xl px-6 lg:px-12">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm font-bold tracking-[0.12em]">CORE INFRASTRUCTURE</span>
          <span className="text-[10px] tracking-[0.1em] text-text-dim">SYSTEM CAPABILITIES</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
              className="rounded-xl border bg-panel/80 p-5 transition"
              style={{
                borderColor: hoveredFeature === index ? "rgba(181,149,255,0.45)" : "rgba(255,255,255,0.08)",
                boxShadow: hoveredFeature === index ? "0 0 20px rgba(181,149,255,0.18)" : "none",
              }}
            >
              <p className="text-xl" style={{ color: hoveredFeature === index ? "#b595ff" : "#667085" }}>
                {feature.icon}
              </p>
              <p className="mt-3 text-[11px] font-bold tracking-[0.12em] text-text-dim">
                0{index + 1}. {feature.title.toUpperCase()}
              </p>
              <p className="mt-2 text-sm text-text-dim">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
