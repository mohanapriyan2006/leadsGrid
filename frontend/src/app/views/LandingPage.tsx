import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgRemotely from "../../assets/bg-images/remotely.svg";

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
    <div className="min-h-screen overflow-y-auto bg-surface text-content">
      {/* Background Effects + bg image */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent-secondary/8 rounded-full blur-3xl" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(45, 212, 191, 0.10) 0%, transparent 70%)' }} />
        <img src={bgRemotely} alt="" draggable={false} className="absolute bottom-0 left-1/2 h-auto w-[min(75%,520px)] -translate-x-1/2 translate-y-[8%] select-none opacity-[0.03]" style={{ filter: 'drop-shadow(0 0 60px rgba(45, 212, 191, 0.10))' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface/70 to-transparent" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-20 flex h-16 items-center gap-8 border-b border-accent/10 bg-surface/80 px-6 backdrop-blur-glass lg:px-12">
        <div className="mr-auto flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-secondary font-black text-surface shadow-glow">
            P
          </div>
          <span className="text-lg font-bold tracking-wider">PitchPilot</span>
        </div>
        <button className="text-xs font-medium uppercase tracking-wider text-content-secondary transition-colors hover:text-content">
          Home
        </button>
        <button className="text-xs font-medium uppercase tracking-wider text-content-secondary transition-colors hover:text-content">
          System
        </button>
        <button className="text-xs font-medium uppercase tracking-wider text-content-secondary transition-colors hover:text-content">
          Process
        </button>
        <button className="text-xs font-medium uppercase tracking-wider text-content-secondary transition-colors hover:text-content">
          Capital
        </button>
        <button
          onClick={enterApp}
          className="badge-accent text-xs font-semibold uppercase tracking-wider hover:bg-accent/20"
        >
          Access Engine
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-5xl px-6 pb-14 pt-16 text-center lg:px-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-success">
          <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
          Version 4.9 // Deployment Ready
        </div>

        <h1 className="mt-8 text-5xl font-bold leading-tight tracking-tight md:text-7xl">
          The Precision
          <br />
          <span className="bg-gradient-to-r from-accent via-accent-secondary to-accent-tertiary bg-clip-text text-transparent">
            Sales Engine
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base text-content-secondary">
          Autonomous client discovery and intent-based outreach. Engineered for enterprise velocity and execution quality.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={enterApp}
            className="accent-btn px-8 py-3 text-xs font-bold uppercase tracking-wider"
          >
            Initialize Deployment
          </button>
          <button className="glass-btn px-8 py-3 text-xs font-medium uppercase tracking-wider">
            Technical Specifications
          </button>
        </div>
      </section>

      {/* Demo Card */}
      <section className="mx-auto mb-16 max-w-5xl px-6 lg:px-12">
        <div className="glass-card-lg overflow-hidden">
          <div className="flex items-center gap-3 border-b border-accent/10 bg-surface-secondary/50 px-5 py-3">
            <span className="font-semibold text-content">PitchPilot</span>
            <div className="ml-auto flex gap-2 text-content-tertiary">
              <span>◉</span>
              <span>—</span>
              <span>✕</span>
            </div>
          </div>
          <div className="space-y-2 p-5">
            {MOCK_LEADS.slice(0, 3).map((lead) => (
              <div
                key={lead.id}
                className="flex items-center gap-3 rounded-xl border border-accent/10 bg-surface-secondary/40 p-3 transition-all hover:border-accent/20 hover:bg-surface-secondary/60"
              >
                <div className="flex-1">
                  <p className="text-sm text-content">{lead.content.slice(0, 52)}...</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {lead.tags.map((tag) => (
                      <Tag key={tag} label={tag} />
                    ))}
                  </div>
                </div>
                <ScoreBadge score={lead.score} />
                <button
                  onClick={enterApp}
                  className="badge-accent text-xs font-semibold uppercase tracking-wider hover:bg-accent/20"
                >
                  Engage
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto mb-16 max-w-5xl px-6 lg:px-12">
        <div className="mb-8 flex items-center justify-between">
          <span className="text-sm font-bold uppercase tracking-wider">Core Infrastructure</span>
          <span className="text-xs uppercase tracking-wider text-content-tertiary">System Capabilities</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
              className="glass-card-sm p-5 transition-all duration-300"
              style={{
                borderColor: hoveredFeature === index ? "rgba(167, 139, 250, 0.4)" : undefined,
                boxShadow: hoveredFeature === index
                  ? "0 0 24px rgba(167, 139, 250, 0.2), 0 4px 24px rgba(0, 0, 0, 0.35)"
                  : undefined,
              }}
            >
              <p
                className="text-2xl transition-colors duration-300"
                style={{ color: hoveredFeature === index ? "#a78bfa" : "#64748b" }}
              >
                {feature.icon}
              </p>
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-content-secondary">
                0{index + 1}. {feature.title.toUpperCase()}
              </p>
              <p className="mt-2 text-sm text-content-secondary">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
