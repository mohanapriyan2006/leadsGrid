import { useEffect, useMemo, useState } from "react";

import bgConnecting from "../../assets/bg-images/connecting-teams.svg";
import { FullscreenToggleButton } from "../../components/ui/FullscreenToggleButton";
import { PageBackground } from "../../components/ui/PageBackground";
import { LeadsDiscoveryDraftPanel } from "../../features/leads/components/LeadsDiscoveryDraftPanel";
import { LeadsDiscoveryFilters } from "../../features/leads/components/LeadsDiscoveryFilters";
import { LeadsDiscoveryResultCard } from "../../features/leads/components/LeadsDiscoveryResultCard";
import { LeadsDiscoverySearchBar } from "../../features/leads/components/LeadsDiscoverySearchBar";
import { useLeadsDiscoveryFilters } from "../../features/leads/hooks/useLeadsDiscoveryFilters";
import { useMessageGenerator } from "../../features/leads/hooks/useMessageGenerator";
import { useLeads } from "../../features/leads/hooks/useLeads";
import { leadService } from "../../features/leads/services/leadService";
import type { Lead } from "../../features/leads/types/lead";
import type { ToneType } from "../../features/common/types/ui";

export const LeadsDiscoveryPage = () => {
  const {
    searchTerm,
    setSearchTerm,
    scoreMin,
    setScoreMin,
    industry,
    setIndustry,
    sources,
    toggleSource,
    clearFilters,
  } = useLeadsDiscoveryFilters();

  const [tone, setTone] = useState<ToneType>("professional");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"score" | "recent">("score");
  const [draftError, setDraftError] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [savingLeadId, setSavingLeadId] = useState<string | null>(null);
  const [submittedQuery, setSubmittedQuery] = useState("");

  const { leads, isLoading, isFetching, error } = useLeads({
    query: submittedQuery,
    selectedSources: sources,
    limit: 16,
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

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => lead.score >= scoreMin);
  }, [leads, scoreMin]);

  const sortedLeads = useMemo(() => {
    const next = [...filteredLeads];
    if (sortBy === "score") {
      next.sort((a, b) => b.score - a.score);
      return next;
    }

    next.sort((a, b) => {
      const aTime = new Date(a.created_at || 0).getTime();
      const bTime = new Date(b.created_at || 0).getTime();
      return bTime - aTime;
    });
    return next;
  }, [filteredLeads, sortBy]);

  const hasSearched = submittedQuery.trim().length > 2;
  const hiddenByFilters = hasSearched && leads.length > 0 && filteredLeads.length === 0;
  const averageScore =
    sortedLeads.length > 0
      ? Math.round(sortedLeads.reduce((sum, lead) => sum + lead.score, 0) / sortedLeads.length)
      : 0;
  const hotLeadCount = sortedLeads.filter((lead) => lead.score >= 80).length;

  const draftText = isGenerating
    ? "Generating..."
    : typeof generatedMessage === "string"
      ? generatedMessage
      : generatedMessage?.message ?? "";

  const handleGenerateDraft = async (lead: Lead) => {
    setSelectedLeadId(lead.id);
    setDraftError(null);
    try {
      await generateMessage({
        lead_context: `${lead.summary}\n${lead.content}`,
        tone,
        max_words: 120,
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown AI error";
      setDraftError(`AI insight generation failed: ${reason}`);
    }
  };

  const handleCopyDraft = async () => {
    if (!draftText) return;
    try {
      await navigator.clipboard.writeText(draftText);
    } catch {
      // no-op
    }
  };

  const handleOpenSource = () => {
    if (!selectedLead?.permalink) return;
    window.open(selectedLead.permalink, "_blank", "noopener,noreferrer");
  };

  const handleExportResults = () => {
    if (sortedLeads.length === 0) return;

    const header = ["id", "author", "title", "source", "score", "email", "url", "created_at"];
    const rows = sortedLeads.map((lead) => [
      lead.id,
      lead.author,
      lead.title || "",
      lead.source,
      String(lead.score),
      lead.email || "",
      lead.permalink || "",
      lead.created_at,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `discovery-results-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveLead = async (lead: Lead) => {
    setSavingLeadId(lead.id);
    setSaveFeedback(null);
    try {
      const saved = await leadService.saveDiscoveryLeadAsManageLead(lead);
      setSaveFeedback(`Saved ${saved.name} to Manage Leads.`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown save error";
      setSaveFeedback(`Save failed: ${reason}`);
    } finally {
      setSavingLeadId(null);
    }
  };

  const handleFindLeads = () => {
    const trimmed = searchTerm.trim();
    if (trimmed.length <= 2) return;
    setSelectedLeadId(null);
    setSubmittedQuery(trimmed);
  };

  return (
    <div className="page-with-bg">
      <PageBackground image={bgConnecting} tint="rgba(21, 171, 123, 0.50)" />

      <div className="focus-fill-height h-[calc(100vh-100px)] w-full min-w-0 overflow-y-auto overflow-x-hidden space-y-4 p-6">
        <header className="glass-card-lg p-5">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-content-tertiary">Lead Intelligence</p>
              <h2 className="mt-1 text-3xl font-semibold text-content">
                Discovery Console
                <span className="ml-3 inline-block rounded-full border border-accent/30 bg-accent/10 px-3 py-1 align-middle text-xs text-accent">
                  {isLoading ? "Syncing" : `${sortedLeads.length} matches`}
                </span>
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-content-secondary">
                Find high-intent opportunities from live sources, evaluate quickly, and move qualified leads into CRM.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-accent/[0.1] bg-surface/40 p-2">
              <FullscreenToggleButton />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as "score" | "recent")}
                className="rounded-lg border border-accent/[0.12] bg-surface-secondary/70 px-2.5 py-2 text-xs uppercase tracking-[0.08em] text-content outline-none"
              >
                <option value="score">Sort by Score</option>
                <option value="recent">Sort by Recent</option>
              </select>
              <button
                type="button"
                onClick={handleExportResults}
                className="accent-btn px-3 py-2 text-xs uppercase tracking-[0.08em]"
                disabled={sortedLeads.length === 0}
              >
                Export CSV
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-accent/15 bg-surface/45 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.1em] text-content-tertiary">Average Score</p>
              <p className="mt-1 text-2xl font-semibold text-content">{averageScore}</p>
            </div>
            <div className="rounded-xl border border-accent-secondary/25 bg-accent-secondary/10 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.1em] text-accent-secondary">Hot Leads</p>
              <p className="mt-1 text-2xl font-semibold text-accent-secondary">{hotLeadCount}</p>
            </div>
            <div className="rounded-xl border border-accent-tertiary/25 bg-accent-tertiary/10 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.1em] text-accent-tertiary">Active Sources</p>
              <p className="mt-1 text-2xl font-semibold text-accent-tertiary">{sources.length}</p>
            </div>
          </div>
        </header>

        <LeadsDiscoveryFilters
          sources={sources}
          scoreMin={scoreMin}
          industry={industry}
          onToggleSource={toggleSource}
          onScoreChange={setScoreMin}
          onIndustryChange={setIndustry}
          onClear={clearFilters}
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,1fr)]">
          <section className="min-w-0 space-y-3">
            <LeadsDiscoverySearchBar
              value={searchTerm}
              isFetching={isFetching}
              onChange={setSearchTerm}
              onFind={handleFindLeads}
            />

            {error ? (
              <div className="rounded-xl border border-danger/25 bg-danger/10 p-4 text-sm text-danger">
                Unable to load discovery results right now. Please retry your query.
              </div>
            ) : null}

            {saveFeedback ? (
              <div className="rounded-xl border border-accent/20 bg-accent/10 p-3 text-sm text-content-secondary">
                {saveFeedback}
              </div>
            ) : null}

            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="glass-card-sm animate-pulse p-4">
                    <div className="mb-3 h-4 w-1/3 rounded bg-surface-secondary" />
                    <div className="mb-2 h-3 w-2/3 rounded bg-surface-secondary" />
                    <div className="h-16 rounded bg-surface-secondary" />
                  </div>
                ))
              ) : sortedLeads.length === 0 ? (
                <div className="glass-card-sm p-8 text-center">
                  <h3 className="text-base font-semibold text-content">
                    {hiddenByFilters ? "Results hidden by filters" : hasSearched ? "No leads found" : "Ready to find leads"}
                  </h3>
                  <p className="mt-2 text-sm text-content-secondary">
                    {hiddenByFilters
                      ? "Your query returned leads, but the current score/source filters hide them."
                      : hasSearched
                        ? "Try a broader query like \"need crm automation\" or adjust your filters."
                        : "Type an intent-rich prompt, then click Find Leads to run discovery."}
                  </p>
                  {hiddenByFilters ? (
                    <button
                      type="button"
                      onClick={() => setScoreMin(0)}
                      className="mt-3 rounded-lg border border-accent/20 bg-accent/10 px-3 py-2 text-xs font-semibold text-content transition hover:bg-accent/20"
                    >
                      Show all scores
                    </button>
                  ) : null}
                </div>
              ) : (
                sortedLeads.map((lead, index) => (
                  <LeadsDiscoveryResultCard
                    key={lead.id}
                    lead={lead}
                    index={index}
                    isSelected={selectedLeadId === lead.id}
                    onSelect={setSelectedLeadId}
                    onGenerateDraft={handleGenerateDraft}
                    onSaveLead={(selected) => {
                      if (savingLeadId === selected.id) return;
                      void handleSaveLead(selected);
                    }}
                  />
                ))
              )}
            </div>
          </section>

          <LeadsDiscoveryDraftPanel
            tone={tone}
            selectedLead={selectedLead}
            insightsText={draftText}
            isGenerating={isGenerating}
            onToneChange={setTone}
            onAnalyze={() => {
              if (selectedLead) {
                void handleGenerateDraft(selectedLead);
              }
            }}
            onCopyInsights={handleCopyDraft}
            onOpenSource={handleOpenSource}
          />
          {draftError ? (
            <div className="rounded-xl border border-danger/25 bg-danger/10 p-3 text-sm text-danger">
              {draftError}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
