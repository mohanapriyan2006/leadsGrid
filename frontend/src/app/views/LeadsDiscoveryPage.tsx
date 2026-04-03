import { useEffect, useMemo, useState } from "react";

import bgConnecting from "../../assets/bg-images/connecting-teams.svg";
import { PageBackground } from "../../components/ui/PageBackground";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import {
  LEAD_INDUSTRIES,
  LEAD_SOURCES,
} from "../../features/leads/constants/leadsPageOptions";
import { AIIcon, SourceIcon, initials } from "../../features/leads/components/leadsPagePrimitives";
import { useMessageGenerator } from "../../features/leads/hooks/useMessageGenerator";
import { useLeads } from "../../features/leads/hooks/useLeads";
import type { Lead } from "../../features/leads/types/lead";

const scoreColor = (score: number) => {
  if (score >= 90) return "#f59e0b";
  if (score >= 80) return "#a78bfa";
  return "#64748b";
};

export const LeadsDiscoveryPage = () => {
  const [searchTerm, setSearchTerm] = useState("need crm automation");
  const [scoreMin, setScoreMin] = useState(80);
  const [industry, setIndustry] = useState("Software & SaaS");
  const [sources, setSources] = useState<Lead["source"][]>(["linkedin", "twitter"]);
  const [tone, setTone] = useState<"professional" | "friendly" | "direct">("professional");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const debouncedSearchTerm = useDebouncedValue(searchTerm, 550);

  const { leads, isLoading, isFetching } = useLeads({
    query: debouncedSearchTerm,
    source: sources[0] ?? "reddit",
    limit: 12,
  });

  const { generateMessage, generatedMessage, isGenerating } = useMessageGenerator();

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) ?? null,
    [leads, selectedLeadId],
  );

  useEffect(() => {
    if (!selectedLeadId && leads.length > 0) {
      setSelectedLeadId(leads[0].id);
    }
  }, [leads, selectedLeadId]);

  const handleGenerateDraft = async (lead: Lead) => {
    setSelectedLeadId(lead.id);
    await generateMessage({
      lead_context: `${lead.summary}\n${lead.content}`,
      tone,
      max_words: 120,
    });
  };

  const toggleSource = (source: Lead["source"]) => {
    setSources((previous) =>
      previous.includes(source)
        ? previous.filter((item) => item !== source)
        : [...previous, source],
    );
  };

  const filteredLeads = leads.filter((lead) => {
    const bySource = sources.includes(lead.source);
    const byScore = lead.score >= scoreMin;
    return bySource && byScore;
  });

  const draftText = isGenerating
    ? "Generating..."
    : typeof generatedMessage === "string"
      ? generatedMessage
      : generatedMessage?.message ?? "";

  const handleCopyDraft = async () => {
    if (!draftText) return;
    try {
      await navigator.clipboard.writeText(draftText);
    } catch {
      // no-op
    }
  };

  const handleSendDraft = () => {
    if (!selectedLead?.email || !draftText) return;
    const subject = encodeURIComponent(`Follow up from ${selectedLead.author}`);
    const body = encodeURIComponent(draftText);
    window.location.href = `mailto:${selectedLead.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="page-with-bg">
      <PageBackground image={bgConnecting} tint="rgba(77, 255, 207, 0.42)" />

      <div className="h-[calc(100vh-100px)] overflow-auto space-y-4 p-6">
        <header className="glass-card p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="bg-gradient-to-r from-content via-accent to-accent-secondary bg-clip-text text-3xl font-semibold text-transparent">
                Lead Discovery
                <span className="ml-3 inline-block rounded-full border border-accent/20 bg-surface-secondary/80 px-3 py-1 align-middle text-xs text-content-secondary">
                  {isLoading ? "..." : `${filteredLeads.length} matches`}
                </span>
              </h2>
              <p className="mt-1 text-sm text-content-secondary">
                Showing high-intent opportunities matched to your ICP.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button type="button" className="glass-btn px-3 py-2 text-xs uppercase tracking-[0.08em]">
                Sort by Date
              </button>
              <button type="button" className="accent-btn px-3 py-2 text-xs uppercase tracking-[0.08em]">
                Export List
              </button>
            </div>
          </div>
        </header>

        <section className="glass-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[11px] uppercase tracking-[0.12em] text-content-tertiary">
              Signal Source
            </span>

            {LEAD_SOURCES.map((source) => {
              const active = sources.includes(source);
              return (
                <button
                  key={source}
                  type="button"
                  onClick={() => toggleSource(source)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    active
                      ? "border-accent/40 bg-accent-soft text-content"
                      : "border-accent/10 bg-surface-secondary/80 text-content-secondary hover:border-accent/30"
                  }`}
                >
                  {source === "twitter"
                    ? "X Threads"
                    : `${source.charAt(0).toUpperCase()}${source.slice(1)}${source === "linkedin" ? " Posts" : " Signals"}`}
                </button>
              );
            })}

            <div className="mx-1 h-5 w-px bg-accent/20" />

            <div className="flex items-center gap-2 rounded-full border border-accent/10 bg-surface-secondary/80 px-3 py-1">
              <span className="text-xs text-content-secondary">Min Score</span>
              <input
                type="range"
                min={0}
                max={100}
                value={scoreMin}
                onChange={(event) => setScoreMin(Number(event.target.value))}
                className="w-24 accent-accent"
              />
              <span className="text-xs font-semibold text-content">{scoreMin}</span>
            </div>

            <div className="mx-1 h-5 w-px bg-accent/20" />

            <select
              className="glass-input w-52 text-sm"
              value={industry}
              onChange={(event) => setIndustry(event.target.value)}
            >
              {LEAD_INDUSTRIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                setScoreMin(0);
                setSources([...LEAD_SOURCES]);
              }}
              className="ml-auto text-xs text-content-tertiary transition hover:text-content-secondary"
            >
              Clear all
            </button>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
          <section className="space-y-3">
            <div className="relative">
              <input
                className="glass-input w-full pl-10"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search signals or accounts..."
              />
              <svg
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              {isFetching ? (
                <div className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
              ) : null}
            </div>

            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="glass-card animate-pulse p-4">
                    <div className="mb-3 h-4 w-1/3 rounded bg-surface-secondary" />
                    <div className="mb-2 h-3 w-2/3 rounded bg-surface-secondary" />
                    <div className="h-16 rounded bg-surface-secondary" />
                  </div>
                ))
              ) : filteredLeads.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <h3 className="text-base font-semibold text-content">No leads found</h3>
                  <p className="mt-2 text-sm text-content-secondary">Try adjusting your search or filters.</p>
                </div>
              ) : (
                filteredLeads.map((lead, index) => {
                  const isHot = lead.score >= 90;
                  const isSelected = selectedLeadId === lead.id;
                  const displayName = lead.author || lead.id;

                  return (
                    <article
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className={`relative cursor-pointer overflow-hidden rounded-2xl border p-4 transition hover:-translate-y-0.5 ${
                        isSelected
                          ? "border-accent/40 bg-surface-secondary/90 shadow-glow"
                          : "border-accent/10 bg-surface-secondary/70 hover:border-accent/30"
                      }`}
                      style={{ animationDelay: `${index * 70}ms` }}
                    >
                      {isHot ? <span className="absolute inset-y-0 right-0 w-1 bg-warning/70" /> : null}

                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-sm font-semibold text-content-secondary">
                            {initials(displayName)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-content">{displayName}</p>
                            <p className="truncate text-xs text-content-secondary">{lead.title ?? "Unknown Role"}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          {isHot ? (
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-warning">
                              Hot Signal
                            </p>
                          ) : null}
                          <p className="text-xl font-bold text-content">{lead.score}</p>
                          <div className="mt-1 h-1 w-20 rounded bg-surface">
                            <div
                              className="h-1 rounded"
                              style={{ width: `${lead.score}%`, backgroundColor: scoreColor(lead.score) }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mb-3 grid gap-2 md:grid-cols-2">
                        <div className="rounded-xl border border-accent/10 bg-surface/60 p-3">
                          <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-content-tertiary">
                            <SourceIcon source={lead.source} />
                            {lead.source === "twitter"
                              ? "X Signal"
                              : `${lead.source.charAt(0).toUpperCase()}${lead.source.slice(1)} Signal`}
                          </p>
                          <p className="line-clamp-3 text-xs text-content-secondary">{lead.content}</p>
                        </div>

                        <div className="rounded-xl border border-accent/10 bg-surface/60 p-3">
                          <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-accent">
                            <AIIcon />
                            AI Take
                          </p>
                          <p className="line-clamp-3 text-xs text-content-secondary">{lead.summary}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3 text-xs text-content-tertiary">
                          <span>{lead.timeAgo ?? "2h ago"}</span>
                          {lead.location ? <span>{lead.location}</span> : null}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="glass-btn px-2 py-1 text-[11px]"
                            onClick={(event) => {
                              event.stopPropagation();
                            }}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="accent-btn px-2.5 py-1 text-[11px]"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleGenerateDraft(lead);
                            }}
                          >
                            Generate Draft
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          <aside className="glass-card h-fit space-y-4 p-5 xl:sticky xl:top-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-content">
                <AIIcon />
                AI Outreach
                <span className="rounded bg-gradient-to-r from-accent to-accent-secondary px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-content-inverse">
                  GPT-4o
                </span>
              </div>

              <div className="flex gap-1">
                {(["professional", "friendly", "direct"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTone(item)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] uppercase ${
                      tone === item
                        ? "border-accent/40 bg-accent-soft text-content"
                        : "border-accent/10 text-content-secondary hover:border-accent/30"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {selectedLead ? (
              <div className="glass-card-sm flex items-center gap-3 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-xs font-semibold text-content-secondary">
                  {initials(selectedLead.author || selectedLead.id)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-content">{selectedLead.author || selectedLead.id}</p>
                  <p className="truncate text-xs text-content-secondary">{selectedLead.title ?? "Unknown Role"}</p>
                </div>
                <span className="ml-auto text-lg font-bold text-content">{selectedLead.score}</span>
              </div>
            ) : (
              <p className="text-center text-xs text-content-tertiary">Select a lead to generate a message.</p>
            )}

            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-content-tertiary">Draft Message</p>
              <textarea
                className={`glass-input min-h-[180px] w-full resize-y p-3 text-sm leading-6 ${isGenerating ? "opacity-80" : ""}`}
                value={draftText}
                onChange={() => {}}
                placeholder="Click Generate Draft on a lead to create personalized outreach..."
                readOnly
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                className="accent-btn px-2 py-2 text-xs"
                onClick={() => {
                  if (selectedLead) {
                    void handleGenerateDraft(selectedLead);
                  }
                }}
                disabled={!selectedLead || isGenerating}
              >
                {isGenerating ? "Generating..." : "Regenerate"}
              </button>
              <button
                type="button"
                className="glass-btn px-2 py-2 text-xs"
                onClick={() => {
                  void handleCopyDraft();
                }}
                disabled={!draftText}
              >
                Copy
              </button>
              <button
                type="button"
                className="glass-btn px-2 py-2 text-xs"
                onClick={handleSendDraft}
                disabled={!draftText || !selectedLead?.email}
              >
                Send
              </button>
            </div>

            <div className="rounded-xl border border-accent/20 bg-accent-soft px-3 py-2 text-xs text-content-secondary">
              <strong className="text-accent">Insight:</strong> High-intent leads respond faster to personalized outreach based on recent posts.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

