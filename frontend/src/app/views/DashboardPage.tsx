import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue, animate } from "framer-motion";

// ── Animated counter hook ──────────────────────────────────────────────────
function useCounter(target: number, duration = 1.4) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration * 60);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(id); }
      else setVal(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(id);
  }, [target, duration]);
  return val;
}

// ── Animated progress bar ─────────────────────────────────────────────────
function ProgressBar({ value, color, delay = 0 }: { value: number; color: string; delay?: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(value), 400 + delay); return () => clearTimeout(t); }, [value, delay]);
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${width}%`, background: color, transition: `width 1.1s cubic-bezier(0.4,0,0.2,1) ${delay}ms` }} />
    </div>
  );
}

// ── Spark / glow dot ──────────────────────────────────────────────────────
function PulseDot({ color = "#a78bfa" }: { color?: string }) {
  return (
    <span className="pulse-dot" style={{ "--dot-color": color } as React.CSSProperties}>
      <span className="pulse-ring" />
    </span>
  );
}

// ── Metric Card ───────────────────────────────────────────────────────────
type MetricProps = { title: string; rawValue: number; displayValue: string; delta: string; icon: string; accent: string; index: number };

function MetricCard({ title, rawValue, displayValue, delta, icon, accent, index }: MetricProps) {
  const [hovered, setHovered] = useState(false);
  const count = useCounter(rawValue, 1.6);
  const shown = rawValue > 999 ? count.toLocaleString() : rawValue < 10 ? displayValue : count;

  return (
    <motion.div
      className="metric-card"
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.09, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, scale: 1.015 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <motion.div className="metric-glow" animate={{ opacity: hovered ? 0.18 : 0 }} transition={{ duration: 0.3 }} />
      <div className="metric-top">
        <span className="metric-label">{title}</span>
        <span className="metric-icon">{icon}</span>
      </div>
      <div className="metric-value">{shown}</div>
      <div className="metric-delta">{delta}</div>
      <div className="metric-bar-line" style={{ background: accent }} />
    </motion.div>
  );
}

// ── Signal Row ────────────────────────────────────────────────────────────
type Signal = { signal: string; tags: { label: string; type: string }[]; score: number; source: string; index: number };

function SignalRow({ signal, tags, score, source, index }: Signal) {
  const [engaged, setEngaged] = useState(false);
  const scoreColor = score >= 90 ? "#f59e0b" : score >= 80 ? "#fb923c" : "#94a3b8";

  return (
    <motion.div
      className="signal-row"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ backgroundColor: "rgba(139,92,246,0.07)" }}
    >
      <div className="signal-main">
        <div className="signal-text">{signal}</div>
        <div className="signal-tags">
          {tags.map(t => (
            <span key={t.label} className={`tag tag-${t.type}`}>{t.label}</span>
          ))}
        </div>
      </div>
      <div className="signal-score" style={{ color: scoreColor }}>
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 300 }}
        >{score}</motion.span>
      </div>
      <div className="signal-source">{source}</div>
      <div className="signal-action">
        <motion.button
          className={`engage-btn ${engaged ? "engaged" : ""}`}
          onClick={() => setEngaged(!engaged)}
          whileTap={{ scale: 0.93 }}
          whileHover={{ boxShadow: "0 0 18px rgba(139,92,246,0.55)" }}
        >
          {engaged ? "ENGAGED" : "ENGAGE"}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Bar Chart ─────────────────────────────────────────────────────────────
const barData = [
  { label: "4.25", value: 30 },
  { label: "1.29", value: 45 },
  { label: "8.01", value: 35 },
  { label: "1.3+", value: 50 },
  { label: "F.20", value: 40 },
  { label: "2.2+", value: 55 },
  { label: "5.07", value: 95 },
];

function LeadVelocityChart() {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 600); return () => clearTimeout(t); }, []);

  return (
    <div className="chart-wrap">
      <div className="chart-header">
        <span className="chart-title">LEAD_VELOCITY_INDEX</span>
        <span className="chart-period">PERIOD: 7_DAY_CYCLE</span>
      </div>
      <div className="chart-bars">
        {barData.map((b, i) => (
          <div key={b.label} className="bar-col">
            <motion.div
              className={`bar-fill ${i === barData.length - 1 ? "bar-active" : ""}`}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: animated ? 1 : 0 }}
              transition={{ delay: 0.7 + i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: `${b.value}%`, originY: 1 }}
            />
            <span className="bar-label">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── System Health ─────────────────────────────────────────────────────────
const healthMetrics = [
  { label: "RELEVANCE", value: 96.2, color: "#a78bfa", delay: 0 },
  { label: "SENTIMENT", value: 84.2, color: "#f59e0b", delay: 100 },
  { label: "LATENT_RISK", value: 9.4, color: "#f87171", delay: 200 },
];

function SystemHealth() {
  const [generating, setGenerating] = useState(false);
  return (
    <div className="health-wrap">
      <div className="health-header">
        <span className="chart-title">SYSTEM_HEALTH</span>
        <span className="health-sub">Core Outreach Parameters</span>
      </div>
      <div className="health-metrics">
        {healthMetrics.map(m => (
          <motion.div
            key={m.label}
            className="health-row"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + m.delay / 1000, duration: 0.45 }}
          >
            <div className="health-label-row">
              <span className="health-label">{m.label}</span>
              <span className="health-val" style={{ color: m.color }}>{m.value}%</span>
            </div>
            <ProgressBar value={m.value} color={m.color} delay={m.delay} />
          </motion.div>
        ))}
      </div>
      <motion.button
        className="gen-report-btn"
        onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 2200); }}
        whileHover={{ boxShadow: "0 0 24px rgba(139,92,246,0.4)" }}
        whileTap={{ scale: 0.97 }}
      >
        <AnimatePresence mode="wait">
          {generating ? (
            <motion.span key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              GENERATING…
            </motion.span>
          ) : (
            <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              GENERATE_REPORT
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
const metrics = [
  { title: "LEADS CAPTURED", rawValue: 1284, displayValue: "1,284", delta: "+12.4% this week", icon: "⊞", accent: "#a78bfa" },
  { title: "HIGH INTENT", rawValue: 42, displayValue: "42", delta: "ACTIVE_QUEUE", icon: "⚡", accent: "#f59e0b" },
  { title: "ENGAGEMENT", rawValue: 86, displayValue: "86", delta: "86_INDEX", icon: "◎", accent: "#34d399" },
  { title: "EFFICIENCY", rawValue: 6, displayValue: "6.4%", delta: "6PT_OPTIMIZER", icon: "↗", accent: "#60a5fa" },
];

const signals = [
  { signal: "Scaling B2B outbound workflows with AI", tags: [{ label: "URGENT", type: "urgent" }, { label: "BUDGET_CONFIRMED", type: "budget" }], score: 92, source: "/r/sales" },
  { signal: "Evaluating CRM replacements for Q3", tags: [{ label: "ENTERPRISE", type: "enterprise" }, { label: "DECISION_MAKER", type: "decision" }], score: 88, source: "LinkedIn" },
  { signal: "Seeking tool for multi-channel prospecting", tags: [{ label: "EXPANSION", type: "expansion" }], score: 74, source: "Direct" },
];

export function DashboardPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0a0a0f;
          --surface: #111118;
          --surface2: #16161f;
          --border: rgba(255,255,255,0.07);
          --text: #e2e8f0;
          --muted: #64748b;
          --dim: #94a3b8;
          --accent: #a78bfa;
          --font-mono: 'JetBrains Mono', monospace;
          --font-sans: 'Space Grotesk', sans-serif;
        }

        html, body, #root { height: 100%; background: var(--bg); color: var(--text); font-family: var(--font-sans); }

        .app-shell { display: flex; height: 100vh; overflow: hidden; background: var(--bg); }

        /* scanline overlay */
        .app-shell::before {
          content: '';
          position: fixed; inset: 0; pointer-events: none; z-index: 9999;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
        }

        /* ── Sidebar ── */
        .sidebar {
          width: 52px; flex-shrink: 0;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
          align-items: center; padding: 16px 0; gap: 4px;
        }
        .sidebar-logo {
          width: 32px; height: 32px; border-radius: 8px;
          background: var(--accent); color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-mono); font-weight: 700; font-size: 14px;
          margin-bottom: 20px;
        }
        .sidebar-nav { display: flex; flex-direction: column; gap: 4px; width: 100%; align-items: center; }
        .sidebar-bottom { margin-top: auto; width: 100%; display: flex; flex-direction: column; align-items: center; }
        .nav-item {
          width: 36px; height: 36px; border-radius: 8px;
          background: transparent; border: none; color: var(--muted);
          font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: color 0.2s;
        }
        .nav-item:hover { color: var(--text); }
        .nav-active { color: var(--accent) !important; background: rgba(167,139,250,0.12); }

        /* ── Main ── */
        .main-area { flex: 1; overflow-y: auto; display: flex; flex-direction: column; min-width: 0; }
        .main-area::-webkit-scrollbar { width: 4px; }
        .main-area::-webkit-scrollbar-track { background: transparent; }
        .main-area::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

        /* ── Topbar ── */
        .topbar {
          height: 52px; flex-shrink: 0;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; padding: 0 16px; gap: 16px;
          position: sticky; top: 0; z-index: 50;
        }
        .search-wrap { display: flex; align-items: center; gap: 8px; flex: 1; max-width: 280px; background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 0 12px; height: 32px; }
        .search-icon { color: var(--muted); font-size: 16px; }
        .search-input { background: none; border: none; outline: none; color: var(--dim); font-family: var(--font-mono); font-size: 11px; width: 100%; }
        .search-input::placeholder { color: var(--muted); }
        .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 16px; }
        .sales-engine { display: flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 10px; color: var(--muted); letter-spacing: 0.08em; }
        .topbar-icons { display: flex; gap: 4px; }
        .icon-btn { background: none; border: none; cursor: pointer; font-size: 14px; color: var(--muted); padding: 4px; border-radius: 4px; transition: color 0.2s; }
        .icon-btn:hover { color: var(--text); }
        .user-chip { display: flex; align-items: center; gap: 8px; }
        .user-info { text-align: right; }
        .user-name { display: block; font-size: 11px; font-weight: 600; color: var(--text); }
        .user-role { display: block; font-family: var(--font-mono); font-size: 9px; color: var(--accent); letter-spacing: 0.1em; }
        .user-avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #a78bfa, #60a5fa); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #fff; }

        /* ── Pulse dot ── */
        .pulse-dot { position: relative; display: inline-flex; width: 8px; height: 8px; }
        .pulse-dot::after { content: ''; position: absolute; inset: 0; border-radius: 50%; background: var(--dot-color, #4ade80); }
        .pulse-ring { position: absolute; inset: -3px; border-radius: 50%; border: 1.5px solid var(--dot-color, #4ade80); animation: pulse-anim 2s ease-out infinite; opacity: 0; }
        @keyframes pulse-anim { 0% { transform: scale(0.6); opacity: 0.8; } 100% { transform: scale(2); opacity: 0; } }

        /* ── Content ── */
        .content { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

        /* ── Metric Cards ── */
        .metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .metric-card {
          position: relative; overflow: hidden;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px; padding: 16px;
          cursor: default;
        }
        .metric-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--accent), transparent); opacity: 0.4; }
        .metric-glow { position: absolute; inset: 0; background: radial-gradient(ellipse at top left, var(--accent), transparent 60%); pointer-events: none; border-radius: 12px; }
        .metric-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
        .metric-label { font-family: var(--font-mono); font-size: 9px; color: var(--muted); letter-spacing: 0.12em; text-transform: uppercase; }
        .metric-icon { font-size: 14px; color: var(--accent); opacity: 0.7; }
        .metric-value { font-family: var(--font-mono); font-size: 32px; font-weight: 700; color: var(--text); line-height: 1; margin-bottom: 6px; }
        .metric-delta { font-family: var(--font-mono); font-size: 9px; color: var(--muted); letter-spacing: 0.1em; }
        .metric-bar-line { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; opacity: 0.6; }

        /* ── Signal Stream ── */
        .signal-panel { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
        .signal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 16px 20px 12px; border-bottom: 1px solid var(--border); }
        .signal-title-block { }
        .signal-title { font-family: var(--font-mono); font-size: 12px; font-weight: 600; color: var(--text); letter-spacing: 0.08em; }
        .signal-subtitle { font-family: var(--font-mono); font-size: 9px; color: var(--muted); margin-top: 2px; letter-spacing: 0.1em; display: flex; align-items: center; gap: 6px; }
        .signal-actions { display: flex; gap: 6px; }
        .hdr-btn { background: var(--surface2); border: 1px solid var(--border); color: var(--dim); font-family: var(--font-mono); font-size: 9px; padding: 5px 10px; border-radius: 6px; cursor: pointer; letter-spacing: 0.08em; transition: all 0.2s; }
        .hdr-btn:hover { border-color: var(--accent); color: var(--accent); }
        .signal-table-head { display: grid; grid-template-columns: 1fr 80px 100px 100px; padding: 8px 20px; border-bottom: 1px solid var(--border); }
        .th { font-family: var(--font-mono); font-size: 8px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; }
        .signal-row { display: grid; grid-template-columns: 1fr 80px 100px 100px; padding: 12px 20px; border-bottom: 1px solid var(--border); align-items: center; transition: background 0.2s; cursor: default; }
        .signal-row:last-child { border-bottom: none; }
        .signal-text { font-size: 12px; font-weight: 500; color: var(--text); margin-bottom: 5px; }
        .signal-tags { display: flex; gap: 4px; flex-wrap: wrap; }
        .tag { font-family: var(--font-mono); font-size: 8px; padding: 2px 6px; border-radius: 3px; letter-spacing: 0.08em; border: 1px solid; }
        .tag-urgent { color: #f87171; border-color: rgba(248,113,113,0.3); background: rgba(248,113,113,0.08); }
        .tag-budget { color: #4ade80; border-color: rgba(74,222,128,0.3); background: rgba(74,222,128,0.08); }
        .tag-enterprise { color: #60a5fa; border-color: rgba(96,165,250,0.3); background: rgba(96,165,250,0.08); }
        .tag-decision { color: #f59e0b; border-color: rgba(245,158,11,0.3); background: rgba(245,158,11,0.08); }
        .tag-expansion { color: #a78bfa; border-color: rgba(167,139,250,0.3); background: rgba(167,139,250,0.08); }
        .signal-score { font-family: var(--font-mono); font-size: 18px; font-weight: 700; }
        .signal-source { font-family: var(--font-mono); font-size: 10px; color: var(--muted); }
        .engage-btn {
          background: transparent; border: 1px solid rgba(139,92,246,0.5); color: #a78bfa;
          font-family: var(--font-mono); font-size: 9px; padding: 6px 12px; border-radius: 6px;
          cursor: pointer; letter-spacing: 0.1em; transition: all 0.2s;
        }
        .engage-btn:hover { background: rgba(139,92,246,0.15); border-color: #a78bfa; }
        .engaged { background: rgba(74,222,128,0.1) !important; border-color: #4ade80 !important; color: #4ade80 !important; }

        /* ── Bottom row ── */
        .bottom-row { display: grid; grid-template-columns: 1fr 320px; gap: 12px; }
        .chart-panel, .health-panel { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }

        /* ── Chart ── */
        .chart-wrap { height: 100%; display: flex; flex-direction: column; }
        .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .chart-title { font-family: var(--font-mono); font-size: 10px; font-weight: 600; color: var(--dim); letter-spacing: 0.12em; }
        .chart-period { font-family: var(--font-mono); font-size: 9px; color: var(--muted); }
        .chart-bars { display: flex; align-items: flex-end; gap: 8px; height: 120px; flex: 1; }
        .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end; }
        .bar-fill { width: 100%; border-radius: 3px 3px 0 0; background: rgba(100,116,139,0.35); min-height: 4px; }
        .bar-active { background: linear-gradient(180deg, #a78bfa 0%, rgba(139,92,246,0.6) 100%) !important; box-shadow: 0 0 20px rgba(167,139,250,0.5); }
        .bar-label { font-family: var(--font-mono); font-size: 8px; color: var(--muted); }

        /* ── Health ── */
        .health-wrap { display: flex; flex-direction: column; height: 100%; }
        .health-header { margin-bottom: 14px; }
        .health-sub { font-family: var(--font-mono); font-size: 8px; color: var(--muted); margin-top: 3px; letter-spacing: 0.1em; }
        .health-metrics { flex: 1; display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
        .health-row { display: flex; flex-direction: column; gap: 5px; }
        .health-label-row { display: flex; justify-content: space-between; align-items: center; }
        .health-label { font-family: var(--font-mono); font-size: 9px; color: var(--muted); letter-spacing: 0.1em; }
        .health-val { font-family: var(--font-mono); font-size: 10px; font-weight: 600; }
        .progress-track { height: 3px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 2px; }

        /* ── Gen button ── */
        .gen-report-btn {
          width: 100%; background: rgba(139,92,246,0.12); border: 1px solid rgba(139,92,246,0.4);
          color: #a78bfa; font-family: var(--font-mono); font-size: 10px; padding: 9px;
          border-radius: 8px; cursor: pointer; letter-spacing: 0.1em; transition: all 0.2s;
        }
        .gen-report-btn:hover { background: rgba(139,92,246,0.2); }

        /* ── FAB ── */
        .fab {
          position: fixed; bottom: 24px; right: 24px;
          width: 40px; height: 40px; border-radius: 10px;
          background: var(--accent); border: none; color: white;
          font-size: 20px; font-weight: 300; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(167,139,250,0.5);
        }

        @media (max-width: 1100px) {
          .metrics-row { grid-template-columns: repeat(2, 1fr); }
          .bottom-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 700px) {
          .metrics-row { grid-template-columns: 1fr 1fr; }
          .signal-table-head, .signal-row { grid-template-columns: 1fr 60px; }
          .signal-source, .signal-action { display: none; }
        }
      `}</style>

      <div className="app-shell">
        <div className="main-area">
          <div className="content">
            {/* Metric Cards */}
            <div className="metrics-row">
              {metrics.map((m, i) => <MetricCard key={m.title} {...m} index={i} />)}
            </div>

            {/* Signal Stream */}
            <motion.div
              className="signal-panel"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="signal-header">
                <div className="signal-title-block">
                  <div className="signal-title">SIGNAL_STREAM <span style={{ color: "var(--muted)", fontWeight: 400 }}>|</span></div>
                  <div className="signal-subtitle">
                    <PulseDot color="#4ade80" />
                    REAL-TIME INTENT ANALYSIS ENABLED
                  </div>
                </div>
                <div className="signal-actions">
                  <button className="hdr-btn">FILTER</button>
                  <button className="hdr-btn">EXPORT</button>
                </div>
              </div>
              <div className="signal-table-head">
                <span className="th">OPPORTUNITY SIGNAL</span>
                <span className="th">SCORE</span>
                <span className="th">SOURCE</span>
                <span className="th">ACTION</span>
              </div>
              {signals.map((s, i) => <SignalRow key={s.signal} {...s} index={i} />)}
            </motion.div>

            {/* Bottom Row */}
            <div className="bottom-row">
              <motion.div
                className="chart-panel"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                <LeadVelocityChart />
              </motion.div>
              <motion.div
                className="health-panel"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
              >
                <SystemHealth />
              </motion.div>
            </div>
          </div>
        </div>

        {/* FAB */}
        <motion.button
          className="fab"
          whileHover={{ scale: 1.12, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1, type: "spring", stiffness: 260 }}
        >
          +
        </motion.button>
      </div>
    </>
  );
}