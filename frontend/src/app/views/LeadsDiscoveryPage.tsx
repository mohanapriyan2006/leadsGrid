import { useEffect, useMemo, useState } from "react";

import bgConnecting from "../../assets/bg-images/connecting-teams.svg";
import { FullscreenToggleButton } from "../../components/ui/FullscreenToggleButton";
import { PageBackground } from "../../components/ui/PageBackground";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { LeadsDiscoveryDraftPanel } from "../../features/leads/components/LeadsDiscoveryDraftPanel";
import { LeadsDiscoveryFilters } from "../../features/leads/components/LeadsDiscoveryFilters";
import { LeadsDiscoveryResultCard } from "../../features/leads/components/LeadsDiscoveryResultCard";
import { LeadsDiscoverySearchBar } from "../../features/leads/components/LeadsDiscoverySearchBar";
import { useLeadsDiscoveryFilters } from "../../features/leads/hooks/useLeadsDiscoveryFilters";
import { useMessageGenerator } from "../../features/leads/hooks/useMessageGenerator";
import { useLeads } from "../../features/leads/hooks/useLeads";
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

  const debouncedSearchTerm = useDebouncedValue(searchTerm, 550);

  const { leads, isLoading, isFetching, error } = useLeads({
    query: debouncedSearchTerm,
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

  const hiddenByFilters = leads.length > 0 && filteredLeads.length === 0;
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
      setDraftError(`AI draft generation failed: ${reason}`);
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

  const handleSendDraft = () => {
    if (!selectedLead?.email || !draftText) return;
    const subject = encodeURIComponent(`Follow up from ${selectedLead.author}`);
    const body = encodeURIComponent(draftText);
    window.location.href = `mailto:${selectedLead.email}?subject=${subject}&body=${body}`;
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

  return (
    <div className="page-with-bg">
      <PageBackground image={bgConnecting} tint="rgba(6, 182, 212, 0.28)" />

      <div className="focus-fill-height h-[calc(100vh-100px)] w-full min-w-0 overflow-y-auto overflow-x-hidden space-y-4 p-6">
        <header className="rounded-2xl border border-accent/[0.12] bg-surface-secondary/85 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold text-content">
                Leads Discovery Studio
                <span className="ml-3 inline-block rounded-full border border-accent/25 bg-accent/[0.08] px-3 py-1 align-middle text-xs text-content-secondary">
                  {isLoading ? "Syncing..." : `${sortedLeads.length} live matches`}
                </span>
              </h2>
              <p className="mt-1 max-w-3xl text-sm text-content-secondary">
                Discover buyer signals from Reddit, HackerNews, and Search. Sort, filter, and generate contextual outreach drafts from one workspace.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-accent/15 bg-surface/50 px-2.5 py-1 text-content-secondary">
                  Avg score: <strong className="text-content">{averageScore}</strong>
                </span>
                <span className="rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-success">
                  Hot leads: <strong>{hotLeadCount}</strong>
                </span>
                <span className="rounded-full border border-info/20 bg-info/10 px-2.5 py-1 text-info">
                  Sources active: <strong>{sources.length}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-accent/[0.1] bg-surface/50 p-2">
              <FullscreenToggleButton />

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as "score" | "recent")}
                className="rounded-lg border border-accent/[0.1] bg-surface-secondary/80 px-2.5 py-2 text-xs uppercase tracking-[0.08em] text-content outline-none"
              >
                <option value="score">Sort: Score</option>
                <option value="recent">Sort: Recent</option>
              </select>
              <button
                type="button"
                onClick={handleExportResults}
                className="accent-btn px-3 py-2 text-xs uppercase tracking-[0.08em]"
                disabled={sortedLeads.length === 0}
              >
                Export Results
              </button>
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
            />

            {error ? (
              <div className="rounded-xl border border-danger/25 bg-danger/10 p-4 text-sm text-danger">
                Unable to load discovery results right now. Please retry your query.
              </div>
            ) : null}

            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="glass-card animate-pulse p-4">
                    <div className="mb-3 h-4 w-1/3 rounded bg-surface-secondary" />
                    <div className="mb-2 h-3 w-2/3 rounded bg-surface-secondary" />
                    <div className="h-16 rounded bg-surface-secondary" />
                  </div>
                ))
              ) : sortedLeads.length === 0 ? (
                <div className="rounded-2xl border border-accent/20 bg-surface-secondary/70 p-8 text-center">
                  <h3 className="text-base font-semibold text-content">
                    {hiddenByFilters ? "Results hidden by filters" : "No leads found"}
                  </h3>
                  <p className="mt-2 text-sm text-content-secondary">
                    {hiddenByFilters
                      ? "Your query returned leads, but the current score/source filters hide them."
                      : "Try a broader query like \"need crm automation\" or adjust your filters."}
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
                  />
                ))
              )}
            </div>
          </section>

          <LeadsDiscoveryDraftPanel
            tone={tone}
            selectedLead={selectedLead}
            draftText={draftText}
            isGenerating={isGenerating}
            onToneChange={setTone}
            onGenerate={() => {
              if (selectedLead) {
                void handleGenerateDraft(selectedLead);
              }
            }}
            onCopy={handleCopyDraft}
            onSend={handleSendDraft}
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
