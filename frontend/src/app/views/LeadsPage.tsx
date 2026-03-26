import { useEffect, useMemo, useState } from "react";

import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { AIMessagePanel } from "../../features/leads/components/AIMessagePanel";
import { LeadsStream } from "../../features/leads/components/LeadsStream";
import { useMessageGenerator } from "../../features/leads/hooks/useMessageGenerator";
import { useLeads } from "../../features/leads/hooks/useLeads";
import type { Lead } from "../../features/leads/types/lead";

export const LeadsPage = () => {
  const [searchTerm, setSearchTerm] = useState("need crm automation");
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 550);
  const [tone, setTone] = useState<"professional" | "friendly" | "direct">("professional");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const { leads, isLoading, isFetching } = useLeads({
    query: debouncedSearchTerm,
    source: "reddit",
    limit: 12,
  });
  const { generateMessage, generatedMessage, isGenerating } = useMessageGenerator();

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) ?? null,
    [leads, selectedLeadId]
  );

  useEffect(() => {
    if (!selectedLeadId && leads.length) {
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

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-3xl font-semibold text-white">Lead Discovery</h2>
        <p className="text-sm text-text-dim">High-intent opportunities matched to your ICP.</p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <LeadsStream
          leads={leads}
          isLoading={isLoading}
          isFetching={isFetching}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedLeadId={selectedLeadId}
          onSelectLead={(lead: Lead) => setSelectedLeadId(lead.id)}
          onGenerateDraft={handleGenerateDraft}
        />

        <AIMessagePanel
          selectedLead={selectedLead}
          generatedMessage={generatedMessage}
          tone={tone}
          onToneChange={setTone}
          onGenerate={async () => {
            if (!selectedLead) {
              return;
            }
            await handleGenerateDraft(selectedLead);
          }}
          isGenerating={isGenerating}
        />
      </div>
    </section>
  );
};
