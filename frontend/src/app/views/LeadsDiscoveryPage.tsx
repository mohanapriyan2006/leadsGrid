import { useEffect, useMemo, useState } from "react";

import bgConnecting from "../../assets/bg-images/connecting-teams.svg";
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

  const debouncedSearchTerm = useDebouncedValue(searchTerm, 550);

  const { leads, isLoading, isFetching } = useLeads({
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
    return leads.filter((lead) => lead.score >= scoreMin && sources.includes(lead.source));
  }, [leads, scoreMin, sources]);

  const draftText = isGenerating
    ? "Generating..."
    : typeof generatedMessage === "string"
      ? generatedMessage
      : generatedMessage?.message ?? "";

  const handleGenerateDraft = async (lead: Lead) => {
    setSelectedLeadId(lead.id);
    await generateMessage({
      lead_context: `${lead.summary}\n${lead.content}`,
      tone,
      max_words: 120,
    });
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

  return (
    <div className="page-with-bg">
      <PageBackground image={bgConnecting} tint="rgba(56, 189, 248, 0.45)" />

      <div className="h-[calc(100vh-100px)] overflow-auto space-y-4 p-6">
        <header className="glass-card p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="bg-gradient-to-r from-content via-accent to-accent-secondary bg-clip-text text-3xl font-semibold text-transparent">
                Real-Time Lead Discovery
                <span className="ml-3 inline-block rounded-full border border-accent/20 bg-surface-secondary/80 px-3 py-1 align-middle text-xs text-content-secondary">
                  {isLoading ? "..." : `${filteredLeads.length} live matches`}
                </span>
              </h2>
              <p className="mt-1 text-sm text-content-secondary">
                Discover live buyer signals from free web sources and generate context-aware outreach drafts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button type="button" className="glass-btn px-3 py-2 text-xs uppercase tracking-[0.08em]">
                Sort by Score
              </button>
              <button type="button" className="accent-btn px-3 py-2 text-xs uppercase tracking-[0.08em]">
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

        <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
          <section className="space-y-3">
            <LeadsDiscoverySearchBar
              value={searchTerm}
              isFetching={isFetching}
              onChange={setSearchTerm}
            />

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
                  <p className="mt-2 text-sm text-content-secondary">Try a broader query like "need crm automation" or lower min score.</p>
                </div>
              ) : (
                filteredLeads.map((lead, index) => (
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
        </div>
      </div>
    </div>
  );
};
