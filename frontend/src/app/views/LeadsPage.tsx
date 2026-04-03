import { useEffect, useMemo, useState, useRef } from "react";

import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { AIMessagePanel } from "../../features/leads/components/AIMessagePanel";
import { LeadsStream } from "../../features/leads/components/LeadsStream";
import { useMessageGenerator } from "../../features/leads/hooks/useMessageGenerator";
import { useLeads } from "../../features/leads/hooks/useLeads";
import type { Lead } from "../../features/leads/types/lead";
import bgConnecting from "../../assets/bg-images/connecting-teams.svg";
import { LEAD_INDUSTRIES, LEAD_SOURCES } from "../../features/leads/constants/leadsPageOptions";
import { leadsPageCss } from "../../features/leads/constants/leadsPageStyles";
import { AIIcon, SkeletonCard, SourceIcon, initials, leadScoreStyle, useRipple } from "../../features/leads/components/leadsPagePrimitives";

/* ─────────── MAIN PAGE ─────────── */
export const LeadsPage = () => {
  const [searchTerm, setSearchTerm]   = useState("need crm automation");
  const [scoreMin, setScoreMin]       = useState(80);
  const [industry, setIndustry]       = useState("Software & SaaS");
  const [sources, setSources]         = useState<Lead["source"][]>(["linkedin", "twitter"]);
  const [tone, setTone]               = useState<"professional" | "friendly" | "direct">("professional");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const debouncedSearchTerm = useDebouncedValue(searchTerm, 550);
  const ripple = useRipple();
  const styleRef = useRef<HTMLStyleElement | null>(null);

  // inject styles once
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = leadsPageCss;
    document.head.appendChild(el);
    styleRef.current = el;
    return () => { el.remove(); };
  }, []);

  const { leads, isLoading, isFetching } = useLeads({
    query: debouncedSearchTerm,
    source: sources[0] ?? "reddit",
    limit: 12,
  });
  const { generateMessage, generatedMessage, isGenerating } = useMessageGenerator();

  const selectedLead = useMemo(
    () => leads.find((l) => l.id === selectedLeadId) ?? null,
    [leads, selectedLeadId]
  );

  useEffect(() => {
    if (!selectedLeadId && leads.length) setSelectedLeadId(leads[0].id);
  }, [leads, selectedLeadId]);

  const handleGenerateDraft = async (lead: Lead) => {
    setSelectedLeadId(lead.id);
    await generateMessage({
      lead_context: `${lead.summary}\n${lead.content}`,
      tone,
      max_words: 120,
    });
  };

  const toggleSource = (s: Lead["source"]) =>
    setSources((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const filteredLeads = leads.filter((lead) => {
    const bySource = sources.includes(lead.source);
    const byScore = lead.score >= scoreMin;
    return bySource && byScore;
  });

  return (
    <div className="leads-page">
      <div className="leads-page-bg" aria-hidden="true">
        <div className="bg-glow" />
        <img src={bgConnecting} alt="" draggable={false} style={{ filter: 'drop-shadow(0 0 60px rgba(16, 185, 129, 0.80))' }} />
        <div className="bg-fade" />
      </div>
      {/* ── Header ── */}
      <div className="lp-header">
        <div className="lp-header-left">
          <h2>
            Lead Discovery
            <span className="lp-count-badge">
              {isLoading ? "…" : `${filteredLeads.length} matches`}
            </span>
          </h2>
          <p>Showing high-intent opportunities matched to your ICP.</p>
        </div>
        <div className="lp-header-actions">
          <button className="btn btn-ghost ripple-wrap" onClick={ripple}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M6 12h12M10 18h4"/>
            </svg>
            Sort by Date
          </button>
          <button className="btn btn-primary ripple-wrap" onClick={ripple}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Export List
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="lp-filters">
        <span className="filter-label">Signal Source</span>
        {LEAD_SOURCES.map((s) => (
          <button key={s} className={`filter-chip${sources.includes(s) ? " active" : ""}`} onClick={() => toggleSource(s)}>
            <span className={`filter-chip-dot ${s}`} />
            {s === "twitter" ? "X Threads" : s.charAt(0).toUpperCase() + s.slice(1) + (s === "linkedin" ? " Posts" : " Signals")}
          </button>
        ))}

        <div className="filter-divider" />

        <div className="score-range">
          <span>Min Score</span>
          <input type="range" min={0} max={100} value={scoreMin} onChange={(e) => setScoreMin(+e.target.value)} />
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)", fontWeight: 600 }}>{scoreMin}</span>
        </div>

        <div className="filter-divider" />

        <select className="industry-select" value={industry} onChange={(e) => setIndustry(e.target.value)}>
          {LEAD_INDUSTRIES.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>

        <button className="clear-btn" onClick={() => { setScoreMin(0); setSources([...LEAD_SOURCES]); }}>
          Clear all
        </button>
      </div>

      {/* ── Main grid ── */}
      <div className="lp-grid">
        {/* ── Leads stream ── */}
        <div>
          {/* Search */}
          <div className="search-wrap">
            <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search signals or accounts…"
            />
            {isFetching && <div className="search-input-spinner" />}
          </div>

          <div className="leads-list">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              : filteredLeads.length === 0
              ? (
                <div className="empty-state">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                  <h3>No leads found</h3>
                  <p>Try adjusting your search or filters.</p>
                </div>
              )
              : filteredLeads.map((lead: Lead, idx: number) => {
                  const score  = lead.score;
                  const isHot  = score >= 90;
                  const isSel  = selectedLeadId === lead.id;
                  const source = lead.source;
                  const displayName = lead.author || lead.id;
                  const barW   = `${score}%`;
                  const delay  = `${idx * 0.07}s`;

                  return (
                    <div
                      key={lead.id}
                      className={`lead-card${isSel ? " selected" : ""}${isHot ? " hot-card" : ""}`}
                      style={{ animationDelay: delay }}
                      onClick={() => setSelectedLeadId(lead.id)}
                    >
                      {isHot && <div className="lead-card-hot-band" />}

                      {/* Top row */}
                      <div className="lead-card-top">
                        <div className="lead-avatar">{initials(displayName)}</div>
                        <div className="lead-identity">
                          <div className="lead-name">{displayName}</div>
                          <div className="lead-title">{lead.title ?? "Unknown Role"}</div>
                        </div>
                        <div className="lead-score-block">
                          {isHot && (
                            <span className="hot-signal-badge">
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4.09 12.5H11L10 22l9.91-11.5H14L13 2z"/></svg>
                              Hot Signal
                            </span>
                          )}
                          <span className="lead-score-num">{score}</span>
                          <div className="lead-score-bar-wrap">
                            <div
                              className="lead-score-bar"
                              style={leadScoreStyle(barW, score)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Signals */}
                      <div className="lead-signals">
                        <div className="signal-box">
                          <div className={`signal-source ${source}`}>
                            <SourceIcon source={source} />
                            {source === "twitter" ? "X Signal" : source.charAt(0).toUpperCase() + source.slice(1) + " Signal"}
                          </div>
                          <p className="signal-text">{lead.content}</p>
                        </div>
                        <div className="signal-box">
                          <div className="signal-source ai">
                            <AIIcon />
                            AI Take
                          </div>
                          <p className="signal-text">{lead.summary}</p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="lead-card-footer">
                        <div className="lead-meta">
                          <span className="lead-meta-item">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            {lead.timeAgo ?? "2h ago"}
                          </span>
                          {lead.location && (
                            <span className="lead-meta-item">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s-8-4.5-8-11.8a8 8 0 0116 0c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
                              {lead.location}
                            </span>
                          )}
                        </div>
                        <div className="lead-card-actions">
                          <button className="icon-btn" title="Save" onClick={(e) => e.stopPropagation()}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-4-7 4V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                          </button>
                          <button
                            className="btn btn-generate ripple-wrap"
                            onClick={(e) => { e.stopPropagation(); ripple(e); handleGenerateDraft(lead); }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                            Generate Draft
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>

        {/* ── AI Panel ── */}
        <div className="ai-panel">
          <div className="ai-panel-header">
            <div className="ai-panel-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 010 2h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 010-2h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z"/>
              </svg>
              AI Outreach
              <span className="ai-badge">GPT-4o</span>
            </div>
            <div className="tone-selector">
              {(["professional", "friendly", "direct"] as const).map((t) => (
                <button key={t} className={`tone-btn${tone === t ? " active" : ""}`} onClick={() => setTone(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Selected lead summary */}
          {selectedLead ? (
            <div className="selected-lead-summary">
              <div className="lead-avatar" style={{ width: 36, height: 36, fontSize: 13 }}>
                {initials(selectedLead.author || selectedLead.id)}
              </div>
              <div className="selected-lead-summary-info">
                <h4>{selectedLead.author || selectedLead.id}</h4>
                <p>{selectedLead.title ?? "Unknown Role"}</p>
              </div>
              <div className="selected-lead-summary-score">{selectedLead.score ?? "—"}</div>
            </div>
          ) : (
            <div style={{ color: "var(--text-dim)", fontSize: 13, textAlign: "center", padding: "10px 0" }}>
              Select a lead to generate a message
            </div>
          )}

          {/* Message area */}
          <div>
            <div className="message-area-label">Draft Message</div>
            <textarea
              className={`message-textarea${isGenerating ? " generating" : ""}`}
              value={isGenerating ? "Generating…" : (typeof generatedMessage === "string" ? generatedMessage : generatedMessage?.message ?? "")}
              onChange={() => {}}
              placeholder="Click 'Generate Draft' on a lead to create a personalized outreach message…"
              readOnly={isGenerating}
            />
          </div>

          {/* Actions */}
          <div className="ai-panel-actions">
            <button
              className="btn btn-primary ripple-wrap"
              onClick={(e) => { ripple(e); if (selectedLead) handleGenerateDraft(selectedLead); }}
              disabled={!selectedLead || isGenerating}
            >
              {isGenerating ? (
                <>
                  <div style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spinOnce 0.7s linear infinite" }} />
                  Generating…
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                  Regenerate
                </>
              )}
            </button>
            <button className="btn btn-ghost ripple-wrap" onClick={ripple} disabled={!generatedMessage}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              Copy
            </button>
            <button className="btn btn-ghost ripple-wrap" onClick={ripple} disabled={!generatedMessage}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
              </svg>
              Send
            </button>
          </div>

          {/* Insight */}
          <div className="insight-bar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
            <p>
              <strong>Insight:</strong> High-intent leads respond 3× faster to personalized outreach based on recent posts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

