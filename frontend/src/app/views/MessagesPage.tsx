import { useMemo, useState } from "react";

import { Avatar } from "../../components/ui/Avatar";
import { SourceIcon } from "../../components/ui/SourceIcon";
import { MOCK_LEADS } from "../../features/leads/constants/mockLeads";
import { useMessageGenerator } from "../../features/leads/hooks/useMessageGenerator";
import { useLeadStore } from "../../store/useLeadStore";
import { MOCK_MESSAGES } from "../../features/messages/constants/mockMessages";
import type { ToneType } from "../../features/common/types/ui";

const TONES: ToneType[] = ["professional", "friendly", "direct"];

export const MessagesPage = () => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>(MOCK_LEADS[0].id);
  const [tone, setTone] = useState<ToneType>("professional");
  const [localDraft, setLocalDraft] = useState(MOCK_MESSAGES[0].content);
  const [copied, setCopied] = useState(false);

  const { leads } = useLeadStore();
  const { generateMessage, generatedMessage, isGenerating } = useMessageGenerator();

  const leadPool = leads.length ? leads : MOCK_LEADS;
  const selectedLead = useMemo(
    () => leadPool.find((lead) => lead.id === selectedLeadId) ?? leadPool[0],
    [leadPool, selectedLeadId]
  );

  const handleGenerate = async () => {
    if (!selectedLead) {
      return;
    }
    try {
      const result = await generateMessage({
        lead_context: `${selectedLead.summary}\n${selectedLead.content}`,
        tone,
        max_words: 130,
      });
      setLocalDraft(result.message);
    } catch {
      setLocalDraft(`Hi ${selectedLead.author.split(" ")[0]},\n\nI noticed your recent signal about ${selectedLead.content.toLowerCase()}\n\nPitchPilot helps teams move from stale outreach to live intent-led execution.\n\nOpen to a quick 10-minute walkthrough this week?\n\nBest,\nAlex`);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(localDraft);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-3xl font-semibold text-white">Message Synthesis</h2>
        <p className="text-sm text-text-dim">Generate personalized outbound drafts from live lead context.</p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <aside className="space-y-3 rounded-xl border border-white/10 bg-panel/80 p-4 shadow-aura">
          <label className="text-xs tracking-[0.1em] text-text-dim" htmlFor="lead-select">SELECT LEAD</label>
          <select
            id="lead-select"
            value={selectedLead.id}
            onChange={(event) => setSelectedLeadId(event.target.value)}
            className="w-full rounded border border-white/10 bg-black/25 px-3 py-2 text-sm text-white"
          >
            {leadPool.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.author}
              </option>
            ))}
          </select>

          <div className="rounded border border-white/10 bg-black/20 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs tracking-[0.1em] text-text-dim">CLIENT CONTEXT</p>
              <SourceIcon source={selectedLead.source} />
            </div>
            <div className="flex gap-3">
              <Avatar initials={selectedLead.avatar ?? selectedLead.author.slice(0, 2).toUpperCase()} size={40} />
              <div>
                <p className="text-sm font-semibold text-white">{selectedLead.author}</p>
                <p className="text-xs text-text-dim">{selectedLead.title ?? "Lead"}</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-text-dim">{selectedLead.content}</p>
            <p className="mt-2 text-xs text-accent">{selectedLead.summary}</p>
          </div>

          <button onClick={handleGenerate} disabled={isGenerating} className="w-full rounded bg-gradient-to-br from-accentSoft to-indigo-600 px-4 py-2 text-xs font-bold tracking-[0.1em] text-white disabled:opacity-60">
            {isGenerating ? "GENERATING..." : "GENERATE DRAFT"}
          </button>
        </aside>

        <section className="rounded-xl border border-white/10 bg-panel/80 p-4 shadow-aura">
          <div className="mb-3 flex items-center gap-2">
            {TONES.map((option) => (
              <button
                key={option}
                onClick={() => setTone(option)}
                className={`rounded border px-3 py-1 text-xs uppercase tracking-[0.1em] ${tone === option ? "border-accent/50 bg-accent/10 text-accent" : "border-white/10 text-text-dim"}`}
              >
                {option}
              </button>
            ))}
            <div className="ml-auto text-xs text-text-dim">{generatedMessage ? `Confidence ${generatedMessage.confidence}%` : "Draft not generated"}</div>
          </div>

          <textarea
            value={localDraft}
            onChange={(event) => setLocalDraft(event.target.value)}
            className="min-h-[360px] w-full resize-y rounded border border-white/10 bg-black/25 p-3 text-sm leading-7 text-white outline-none focus:border-accent/60"
          />

          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-text-dim">Optimized for {selectedLead.author.toUpperCase()}</p>
            <button onClick={handleCopy} className="rounded border border-emerald-400/40 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold tracking-[0.08em] text-emerald-300">
              {copied ? "COPIED" : "COPY"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
