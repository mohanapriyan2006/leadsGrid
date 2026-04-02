import { useEffect, useMemo, useState } from "react";

import { Avatar } from "../../components/ui/Avatar";
import { SourceIcon } from "../../components/ui/SourceIcon";
import { MOCK_LEADS } from "../../features/leads/constants/mockLeads";
import { PageBackground } from "../../components/ui/PageBackground";
import bgRemotely from "../../assets/bg-images/remotely.svg";
import { useMessageGenerator } from "../../features/leads/hooks/useMessageGenerator";
import { messageService } from "../../features/leads/services/messageService";
import { useLeadStore } from "../../store/useLeadStore";
import { MOCK_MESSAGES } from "../../features/messages/constants/mockMessages";
import type { ToneType } from "../../features/common/types/ui";

const TONES: ToneType[] = ["professional", "friendly", "direct"];

export const MessagesPage = () => {
  const CONTEXT_PREVIEW_LIMIT = 140;
  const [selectedLeadId, setSelectedLeadId] = useState<string>(MOCK_LEADS[0].id);
  const [tone, setTone] = useState<ToneType>("professional");
  const [localDraft, setLocalDraft] = useState(MOCK_MESSAGES[0].content);
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [contextExpanded, setContextExpanded] = useState(false);

  const { leads } = useLeadStore();
  const { generateMessage, generatedMessage, isGenerating } = useMessageGenerator();

  const leadPool = leads.length ? leads : MOCK_LEADS;
  const selectedLead = useMemo(
    () => leadPool.find((lead) => lead.id === selectedLeadId) ?? leadPool[0],
    [leadPool, selectedLeadId]
  );

  const generateSubject = () => {
    if (!selectedLead) {
      return "Regarding your project";
    }
    return `Regarding your ${selectedLead.title || "project"}`;
  };

  useEffect(() => {
    if (!selectedLead) {
      setEmail("");
      return;
    }
    setEmail(selectedLead.email ?? "");
    setSent(false);
    setSendError(null);
    setContextExpanded(false);
    setDetailsOpen(false);
  }, [selectedLead]);

  const trimmedContent =
    selectedLead.content.length > CONTEXT_PREVIEW_LIMIT
      ? `${selectedLead.content.slice(0, CONTEXT_PREVIEW_LIMIT).trim()}...`
      : selectedLead.content;

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
      setSubject(generateSubject());
    } catch {
      setLocalDraft(`Hi ${selectedLead.author.split(" ")[0]},\n\nI noticed your recent signal about ${selectedLead.content.toLowerCase()}\n\nPitchPilot helps teams move from stale outreach to live intent-led execution.\n\nOpen to a quick 10-minute walkthrough this week?\n\nBest,\nAlex`);
      setSubject(generateSubject());
    }
  };

  const handleSendEmail = async () => {
    if (!selectedLead || !email || !localDraft.trim()) {
      return;
    }

    try {
      setSending(true);
      setSendError(null);
      setSent(false);

      await messageService.sendEmail({
        to: email,
        subject: subject.trim() || generateSubject(),
        message: localDraft,
        lead_id: selectedLead.id,
      });

      setSent(true);
    } catch {
      setSendError("Failed to send email. Please verify SMTP settings and try again.");
    } finally {
      setSending(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(localDraft);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="page-with-bg space-y-4">
      <PageBackground image={bgRemotely} tint="rgba(56, 189, 248 , 0.80)" />
      <header className="glass-card p-5">
        <h2 className="bg-gradient-to-r from-content via-accent to-accent-secondary bg-clip-text text-3xl font-semibold text-transparent">Message Synthesis</h2>
        <p className="mt-1 text-sm text-content-secondary">Generate personalized outbound drafts from live lead context.</p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <aside className="glass-card space-y-3 p-4">
          <label className="text-xs tracking-[0.1em] text-content-tertiary" htmlFor="lead-select">SELECT LEAD</label>
          <select
            id="lead-select"
            value={selectedLead.id}
            onChange={(event) => setSelectedLeadId(event.target.value)}
            className="glass-input"
          >
            {leadPool.map((lead) => (
              <option key={lead.id} value={lead.id} className="bg-surface-tertiary text-content">
                {lead.author}
              </option>
            ))}
          </select>

          <div className="glass-card-sm p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs tracking-[0.1em] text-content-tertiary">CLIENT CONTEXT</p>
              <div className="flex items-center gap-2">
                <SourceIcon source={selectedLead.source} />
                <button
                  type="button"
                  onClick={() => setDetailsOpen(true)}
                  className="glass-btn px-2 py-1 text-[10px] uppercase tracking-[0.08em]"
                >
                  Details
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <Avatar initials={selectedLead.avatar ?? selectedLead.author.slice(0, 2).toUpperCase()} size={40} />
              <div>
                <p className="text-sm font-semibold text-content">{selectedLead.author}</p>
                <p className="text-xs text-content-tertiary">{selectedLead.title ?? "Lead"}</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-content-secondary">{contextExpanded ? selectedLead.content : trimmedContent}</p>
            {selectedLead.content.length > CONTEXT_PREVIEW_LIMIT ? (
              <button
                type="button"
                onClick={() => setContextExpanded((value) => !value)}
                className="mt-1 text-xs font-semibold text-accent hover:text-accent-secondary"
              >
                {contextExpanded ? "View less" : "View more"}
              </button>
            ) : null}
            <p className="mt-2 text-xs text-accent">{selectedLead.summary}</p>
          </div>

          <button onClick={handleGenerate} disabled={isGenerating} className="accent-btn w-full text-xs font-bold tracking-[0.1em] disabled:opacity-60">
            {isGenerating ? "GENERATING..." : "GENERATE DRAFT"}
          </button>
        </aside>

        <section className="glass-card p-4">
          <div className="mb-3 flex items-center gap-2">
            {TONES.map((option) => (
              <button
                key={option}
                onClick={() => setTone(option)}
                className={`rounded-glass-sm border px-3 py-1 text-xs uppercase tracking-[0.1em] transition-all duration-200 ${tone === option ? "border-accent/50 bg-accent-soft text-accent shadow-glow" : "border-accent/10 text-content-tertiary hover:border-accent/30 hover:text-content-secondary"}`}
              >
                {option}
              </button>
            ))}
            <div className="ml-auto text-xs text-content-tertiary">{generatedMessage ? <span className="badge-accent">Confidence {generatedMessage.confidence}%</span> : "Draft not generated"}</div>
          </div>

          <div className="mb-3 space-y-2">
            <label className="text-xs tracking-[0.1em] text-content-tertiary" htmlFor="email-to">SEND TO</label>
            <input
              id="email-to"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter client email"
              className="glass-input"
            />
            <label className="text-xs tracking-[0.1em] text-content-tertiary" htmlFor="email-subject">SUBJECT</label>
            <input
              id="email-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Subject"
              className="glass-input"
            />
            {!email ? (
              <p className="text-xs text-warning">No email found for this lead.</p>
            ) : null}
          </div>

          <textarea
            value={localDraft}
            onChange={(event) => setLocalDraft(event.target.value)}
            className="glass-input min-h-[360px] resize-y p-3 text-sm leading-7"
          />

          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-content-tertiary">Optimized for {selectedLead.author.toUpperCase()}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSendEmail}
                disabled={sending || !email || !localDraft.trim()}
                className="rounded-glass-sm bg-success px-4 py-1.5 text-xs font-semibold tracking-[0.08em] text-content-inverse shadow-[0_0_16px_rgba(16,185,129,0.3)] transition hover:shadow-[0_0_24px_rgba(16,185,129,0.5)] disabled:opacity-60"
              >
                {sending ? "SENDING..." : sent ? "SENT" : "SEND EMAIL"}
              </button>
              <button onClick={handleCopy} className="rounded-glass-sm border border-success/30 bg-success-soft px-4 py-1.5 text-xs font-semibold tracking-[0.08em] text-success transition hover:border-success/50 hover:shadow-[0_0_16px_rgba(16,185,129,0.2)]">
                {copied ? "COPIED" : "COPY"}
              </button>
            </div>
          </div>
          {sendError ? <p className="mt-2 text-xs text-danger">{sendError}</p> : null}
        </section>
      </div>

      {detailsOpen ? (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-surface/80 backdrop-blur-sm px-4"
          onClick={() => setDetailsOpen(false)}
        >
          <div
            className="glass-card-lg max-h-[80vh] w-full max-w-lg overflow-y-auto p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-content">{selectedLead.author}</h3>
                <p className="text-sm text-content-secondary">{selectedLead.title ?? "Lead"}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailsOpen(false)}
                className="glass-btn px-2 py-1 text-xs"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-sm text-content-secondary">
              <p>
                <span className="text-content">Email:</span> {selectedLead.email ?? "N/A"}
              </p>
              <p>
                <span className="text-content">Source:</span> {selectedLead.source}
              </p>
              <p>
                <span className="text-content">Summary:</span> {selectedLead.summary}
              </p>
            </div>

            <div className="glass-card-sm mt-4 p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-content-tertiary">Full Context</p>
              <p className="mt-2 text-sm leading-6 text-content">{selectedLead.content}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
