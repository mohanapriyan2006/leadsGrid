import { useEffect, useMemo, useState } from "react";

import bgConnecting from "../../assets/bg-images/connecting-teams.svg";
import { FullscreenToggleButton } from "../../components/ui/FullscreenToggleButton";
import { PageBackground } from "../../components/ui/PageBackground";
import { ResponsivePageLayout } from "../../components/ui/ResponsivePageLayout";
import { LeadsDiscoveryDraftPanel } from "../../features/leads/components/LeadsDiscoveryDraftPanel";
import { LeadsDiscoveryFilters } from "../../features/leads/components/LeadsDiscoveryFilters";
import { LeadsDiscoveryResultCard } from "../../features/leads/components/LeadsDiscoveryResultCard";
import { LeadsDiscoverySearchBar } from "../../features/leads/components/LeadsDiscoverySearchBar";
import { useLeadsDiscoveryFilters } from "../../features/leads/hooks/useLeadsDiscoveryFilters";
import { useMessageGenerator } from "../../features/leads/hooks/useMessageGenerator";
import { useLeads } from "../../features/leads/hooks/useLeads";
import { leadAnalysisService, type AdvancedLeadIntent } from "../../features/leads/services/leadAnalysisService";
import { leadService } from "../../features/leads/services/leadService";
import type { HyperPersonalizedOutreachResult, Lead } from "../../features/leads/types/lead";
import type { ToneType } from "../../features/common/types/ui";

const getIntentLabel = (score: number): string => {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
};

type TriageQueue = "all" | "hot_qualified" | "high_urgency" | "needs_nurture";

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
  const [triageQueue, setTriageQueue] = useState<TriageQueue>("all");
  const [draftError, setDraftError] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [savingLeadId, setSavingLeadId] = useState<string | null>(null);
  const [analyzingLeadId, setAnalyzingLeadId] = useState<string | null>(null);
  const [isBulkAnalyzing, setIsBulkAnalyzing] = useState(false);
  const [bulkAnalyzeProgress, setBulkAnalyzeProgress] = useState(0);
  const [outreachError, setOutreachError] = useState<string | null>(null);
  const [painPointInput, setPainPointInput] = useState("");
  const [userSkillsInput, setUserSkillsInput] = useState("FastAPI, React, CRM automation");
  const [portfolioSummaryInput, setPortfolioSummaryInput] = useState(
    "I build lead-generation and outreach systems that help sales teams convert qualified prospects faster.",
  );
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [advancedIntentByLeadId, setAdvancedIntentByLeadId] = useState<Record<string, AdvancedLeadIntent>>({});

  const { leads, isLoading, isFetching, error } = useLeads({
    query: submittedQuery,
    selectedSources: sources,
    limit: 16,
  });

  const {
    generateMessage,
    generatedMessage,
    isGenerating,
    generateHyperPersonalizedOutreach,
    hyperOutreachResult,
    isGeneratingHyperOutreach,
  } = useMessageGenerator();

  const enrichedLeads = useMemo(() => {
    return leads.map((lead) => {
      const advancedIntent = advancedIntentByLeadId[lead.id];
      if (!advancedIntent) return lead;

      return {
        ...lead,
        score: advancedIntent.score,
        decision_maker: advancedIntent.decision_maker,
        buying_signals: advancedIntent.buying_signals,
        pain_point: advancedIntent.pain_point,
        category: advancedIntent.category,
        status: advancedIntent.status,
        intent_label: getIntentLabel(advancedIntent.score),
      };
    });
  }, [leads, advancedIntentByLeadId]);

  const selectedLead = useMemo(
    () => enrichedLeads.find((lead) => lead.id === selectedLeadId) ?? null,
    [enrichedLeads, selectedLeadId],
  );

  const selectedIntent = selectedLeadId ? advancedIntentByLeadId[selectedLeadId] ?? null : null;
  const outreachResult = (hyperOutreachResult ?? null) as HyperPersonalizedOutreachResult | null;
  const skillsList = useMemo(
    () => userSkillsInput.split(",").map((value) => value.trim()).filter(Boolean),
    [userSkillsInput],
  );
  const canGenerateOutreach = Boolean(
    selectedLead
    && painPointInput.trim().length >= 3
    && skillsList.length >= 1
    && portfolioSummaryInput.trim().length >= 10,
  );

  useEffect(() => {
    if (!selectedLeadId && enrichedLeads.length > 0) {
      setSelectedLeadId(enrichedLeads[0].id);
    }
  }, [enrichedLeads, selectedLeadId]);

  useEffect(() => {
    if (!selectedLead) {
      setPainPointInput("");
      return;
    }

    const prefilledPainPoint =
      selectedIntent?.pain_point
      || selectedLead.pain_point
      || selectedLead.summary
      || "";
    setPainPointInput(prefilledPainPoint);
  }, [selectedLead, selectedIntent]);

  useEffect(() => {
    if (outreachError) {
      setOutreachError(null);
    }
  }, [painPointInput, userSkillsInput, portfolioSummaryInput]);

  const filteredLeads = useMemo(() => {
    return enrichedLeads.filter((lead) => lead.score >= scoreMin);
  }, [enrichedLeads, scoreMin]);

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
  const analyzedVisibleCount = sortedLeads.filter((lead) => Boolean(advancedIntentByLeadId[lead.id])).length;
  const qualifiedVisibleCount = sortedLeads.filter((lead) => advancedIntentByLeadId[lead.id]?.status === "qualified").length;
  const qualificationRate = analyzedVisibleCount > 0
    ? Math.round((qualifiedVisibleCount / analyzedVisibleCount) * 100)
    : 0;

  const triagedLeads = useMemo(() => {
    if (triageQueue === "all") {
      return sortedLeads;
    }

    return sortedLeads.filter((lead) => {
      const advancedIntent = advancedIntentByLeadId[lead.id];
      if (!advancedIntent) {
        return false;
      }

      if (triageQueue === "hot_qualified") {
        return advancedIntent.status === "qualified" && advancedIntent.score >= 80;
      }

      if (triageQueue === "high_urgency") {
        return advancedIntent.urgency === "high";
      }

      return (
        advancedIntent.status === "unqualified"
        || advancedIntent.category === "learning"
        || advancedIntent.category === "discussion"
        || advancedIntent.score < 70
      );
    });
  }, [advancedIntentByLeadId, sortedLeads, triageQueue]);

  const triageCounts = useMemo(() => {
    const all = sortedLeads.length;
    const hotQualified = sortedLeads.filter((lead) => {
      const intent = advancedIntentByLeadId[lead.id];
      return intent?.status === "qualified" && intent.score >= 80;
    }).length;
    const highUrgency = sortedLeads.filter((lead) => advancedIntentByLeadId[lead.id]?.urgency === "high").length;
    const needsNurture = sortedLeads.filter((lead) => {
      const intent = advancedIntentByLeadId[lead.id];
      return Boolean(
        intent
        && (
          intent.status === "unqualified"
          || intent.category === "learning"
          || intent.category === "discussion"
          || intent.score < 70
        )
      );
    }).length;

    return { all, hotQualified, highUrgency, needsNurture };
  }, [advancedIntentByLeadId, sortedLeads]);

  const draftText = isGenerating
    ? "Generating..."
    : typeof generatedMessage === "string"
      ? generatedMessage
      : generatedMessage?.message ?? "";

  const analyzeLeadIntent = async (lead: Lead, force = false): Promise<AdvancedLeadIntent> => {
    const cached = advancedIntentByLeadId[lead.id];
    if (cached && !force) {
      return cached;
    }

    setAnalyzingLeadId(lead.id);
    try {
      const advancedIntent = await leadAnalysisService.analyzeAdvancedIntent({
        lead_text: lead.content,
        lead_title: lead.title,
        lead_author: lead.author,
        score: lead.score,
      });

      setAdvancedIntentByLeadId((prev) => ({
        ...prev,
        [lead.id]: advancedIntent,
      }));

      return advancedIntent;
    } finally {
      setAnalyzingLeadId(null);
    }
  };

  const handleAnalyzeLead = async (lead: Lead) => {
    setSelectedLeadId(lead.id);
    setDraftError(null);
    try {
      const advancedIntent = await analyzeLeadIntent(lead);
      setSaveFeedback(`Analyzed: ${advancedIntent.status.toUpperCase()} (${advancedIntent.category}, ${advancedIntent.urgency} urgency)`);
    } catch (error) {
      setAnalyzingLeadId(null);
      const reason = error instanceof Error ? error.message : "Unknown AI error";
      setDraftError(`Lead analysis failed: ${reason}`);
    }
  };

  const handleBulkAnalyzeVisible = async () => {
    if (triagedLeads.length === 0 || isBulkAnalyzing) {
      return;
    }

    setIsBulkAnalyzing(true);
    setBulkAnalyzeProgress(0);
    setDraftError(null);

    let completed = 0;
    let failed = 0;

    for (const lead of triagedLeads) {
      try {
        await analyzeLeadIntent(lead);
      } catch {
        failed += 1;
      } finally {
        completed += 1;
        setBulkAnalyzeProgress(Math.round((completed / triagedLeads.length) * 100));
      }
    }

    setIsBulkAnalyzing(false);
    if (failed > 0) {
      setSaveFeedback(`Bulk analysis complete: ${completed - failed}/${completed} succeeded.`);
    } else {
      setSaveFeedback(`Bulk analysis complete: ${completed} leads analyzed.`);
    }
  };

  const handleGenerateDraft = async (lead: Lead) => {
    setSelectedLeadId(lead.id);
    setDraftError(null);
    try {
      const advancedIntent = await analyzeLeadIntent(lead);

      const analysisContext = [
        `Lead summary: ${lead.summary}`,
        `Lead content: ${lead.content}`,
        `Intent score: ${advancedIntent.score}`,
        `Urgency: ${advancedIntent.urgency}`,
        `Decision maker: ${advancedIntent.decision_maker}`,
        `Pain point: ${advancedIntent.pain_point}`,
        `Category: ${advancedIntent.category}`,
        `Qualification status: ${advancedIntent.status}`,
        `Buying signals: ${advancedIntent.buying_signals.join(", ") || "none"}`,
      ].join("\n");

      await generateMessage({
        lead_context: analysisContext,
        tone,
        max_words: 120,
      });
    } catch (error) {
      setAnalyzingLeadId(null);
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

  const handleGenerateOutreach = async () => {
    if (!selectedLead) return;

    if (!painPointInput.trim()) {
      setOutreachError("Pain point is required for hyper-personalized outreach.");
      return;
    }
    if (skillsList.length === 0) {
      setOutreachError("Add at least one skill for personalized outreach.");
      return;
    }
    if (!portfolioSummaryInput.trim()) {
      setOutreachError("Portfolio summary is required for personalized outreach.");
      return;
    }

    setOutreachError(null);

    try {
      await generateHyperPersonalizedOutreach({
        lead_text: selectedLead.content,
        lead_title: selectedLead.title || "",
        lead_author: selectedLead.author || "",
        pain_point: painPointInput.trim(),
        user_skills: skillsList,
        portfolio_summary: portfolioSummaryInput.trim(),
        tone,
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown outreach error";
      setOutreachError(`Outreach generation failed: ${reason}`);
    }
  };

  const handleCopyOutreach = async () => {
    if (!outreachResult?.message) return;
    try {
      await navigator.clipboard.writeText(outreachResult.message);
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
      const advancedIntent = await analyzeLeadIntent(lead);
      if (advancedIntent.status !== "qualified") {
        setSaveFeedback(`Not saved: lead marked ${advancedIntent.status} (${advancedIntent.category}).`);
        return;
      }

      const saved = await leadService.saveDiscoveryLeadAsManageLead(lead);
      setSaveFeedback(`Saved ${saved.name} to Manage Leads (${advancedIntent.category}, score ${advancedIntent.score}).`);
    } catch (error) {
      setAnalyzingLeadId(null);
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
    setTriageQueue("all");
    setAdvancedIntentByLeadId({});
    setDraftError(null);
    setOutreachError(null);
    setSaveFeedback(null);
    setSubmittedQuery(trimmed);
  };

  return (
    <ResponsivePageLayout
      backgroundImage={bgConnecting}
      tint="rgba(21, 171, 123, 0.50)"
      contentClassName="w-full min-w-0 overflow-x-hidden space-y-4"
    >
        <PageBackground image={bgConnecting} tint="rgba(21, 171, 123, 0.64)" opacity={0.86} />
        <header className="glass-card-lg p-5">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-content-tertiary">Lead Intelligence</p>
              <h2 className="mt-1 text-2xl font-semibold text-content sm:text-3xl">
                Discovery Console
                <span className="ml-3 inline-block rounded-full border border-accent/30 bg-accent/10 px-3 py-1 align-middle text-xs text-accent">
                  {isLoading ? "Syncing" : `${sortedLeads.length} matches`}
                </span>
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-content-secondary">
                Find high-intent opportunities from live sources, evaluate quickly, and move qualified leads into CRM.
              </p>
            </div>

            <div className="flex w-full flex-wrap items-center gap-2 rounded-xl border border-accent/[0.1] bg-surface/40 p-2 lg:w-auto">
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
              <button
                type="button"
                onClick={() => {
                  void handleBulkAnalyzeVisible();
                }}
                className="glass-btn px-3 py-2 text-xs uppercase tracking-[0.08em]"
                disabled={triagedLeads.length === 0 || isBulkAnalyzing}
              >
                {isBulkAnalyzing ? `Analyzing ${bulkAnalyzeProgress}%` : "Analyze Visible"}
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
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
            <div className="rounded-xl border border-accent/20 bg-accent/10 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.1em] text-accent">Analyzed</p>
              <p className="mt-1 text-2xl font-semibold text-content">{analyzedVisibleCount}</p>
            </div>
            <div className="rounded-xl border border-success/25 bg-success/10 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.1em] text-success">Qualified Rate</p>
              <p className="mt-1 text-2xl font-semibold text-content">{qualificationRate}%</p>
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

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,1fr)]">
          <section className="min-w-0 space-y-3">
            <LeadsDiscoverySearchBar
              value={searchTerm}
              isFetching={isFetching}
              onChange={setSearchTerm}
              onFind={handleFindLeads}
            />

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <button
                type="button"
                onClick={() => setTriageQueue("all")}
                className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                  triageQueue === "all"
                    ? "border-accent/30 bg-accent/10 text-content"
                    : "border-accent/10 bg-surface/40 text-content-secondary hover:border-accent/20"
                }`}
              >
                <p className="uppercase tracking-[0.08em]">All Leads</p>
                <p className="mt-1 text-sm font-semibold">{triageCounts.all}</p>
              </button>
              <button
                type="button"
                onClick={() => setTriageQueue("hot_qualified")}
                className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                  triageQueue === "hot_qualified"
                    ? "border-success/35 bg-success/10 text-content"
                    : "border-accent/10 bg-surface/40 text-content-secondary hover:border-accent/20"
                }`}
              >
                <p className="uppercase tracking-[0.08em]">Hot Qualified</p>
                <p className="mt-1 text-sm font-semibold">{triageCounts.hotQualified}</p>
              </button>
              <button
                type="button"
                onClick={() => setTriageQueue("high_urgency")}
                className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                  triageQueue === "high_urgency"
                    ? "border-warning/35 bg-warning/10 text-content"
                    : "border-accent/10 bg-surface/40 text-content-secondary hover:border-accent/20"
                }`}
              >
                <p className="uppercase tracking-[0.08em]">High Urgency</p>
                <p className="mt-1 text-sm font-semibold">{triageCounts.highUrgency}</p>
              </button>
              <button
                type="button"
                onClick={() => setTriageQueue("needs_nurture")}
                className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                  triageQueue === "needs_nurture"
                    ? "border-info/35 bg-info/10 text-content"
                    : "border-accent/10 bg-surface/40 text-content-secondary hover:border-accent/20"
                }`}
              >
                <p className="uppercase tracking-[0.08em]">Needs Nurture</p>
                <p className="mt-1 text-sm font-semibold">{triageCounts.needsNurture}</p>
              </button>
            </div>

            {error ? (
              <div className="rounded-xl border border-danger/25 bg-danger/10 p-4 text-sm text-danger">
                Unable to load discovery results right now. Please retry your query.
              </div>
            ) : null}

            {saveFeedback ? (
              <div
                className={`rounded-xl p-3 text-sm ${
                  saveFeedback.startsWith("Saved")
                    ? "border border-success/25 bg-success/10 text-success"
                    : saveFeedback.startsWith("Not saved")
                      ? "border border-warning/25 bg-warning/10 text-warning"
                      : "border border-accent/20 bg-accent/10 text-content-secondary"
                }`}
              >
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
              ) : triagedLeads.length === 0 ? (
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
                triagedLeads.map((lead, index) => (
                  <LeadsDiscoveryResultCard
                    key={lead.id}
                    lead={lead}
                    advancedIntent={advancedIntentByLeadId[lead.id]}
                    isAnalyzing={analyzingLeadId === lead.id}
                    isSaving={savingLeadId === lead.id}
                    index={index}
                    isSelected={selectedLeadId === lead.id}
                    onSelect={setSelectedLeadId}
                    onAnalyze={(selected) => {
                      if (analyzingLeadId === selected.id) return;
                      void handleAnalyzeLead(selected);
                    }}
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
            selectedIntent={selectedIntent}
            insightsText={draftText}
            outreachResult={outreachResult}
            painPointInput={painPointInput}
            userSkillsInput={userSkillsInput}
            portfolioSummaryInput={portfolioSummaryInput}
            canGenerateOutreach={canGenerateOutreach}
            isGenerating={isGenerating}
            isGeneratingOutreach={isGeneratingHyperOutreach}
            onToneChange={setTone}
            onPainPointChange={setPainPointInput}
            onUserSkillsChange={setUserSkillsInput}
            onPortfolioSummaryChange={setPortfolioSummaryInput}
            onAnalyze={() => {
              if (selectedLead) {
                void handleAnalyzeLead(selectedLead);
              }
            }}
            onGenerateOutreach={() => {
              void handleGenerateOutreach();
            }}
            onCopyInsights={handleCopyDraft}
            onCopyOutreach={handleCopyOutreach}
            onOpenSource={handleOpenSource}
          />
          {draftError || outreachError ? (
            <div className="rounded-xl border border-danger/25 bg-danger/10 p-3 text-sm text-danger">
              {draftError || outreachError}
            </div>
          ) : null}
        </div>
    </ResponsivePageLayout>
  );
};
