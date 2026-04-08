import { useEffect, useMemo, useState } from "react";

import { PageBackground } from "../../components/ui/PageBackground";
import { ResponsivePageLayout } from "../../components/ui/ResponsivePageLayout";
import bgRemotely from "../../assets/bg-images/remotely.svg";
import { useMessageGenerator } from "../../features/leads/hooks/useMessageGenerator";
import { messageService } from "../../features/leads/services/messageService";
import { useCentralizedLeads } from "../../features/leads/hooks/useCentralizedLeads";
import { MessageComposerPanel } from "../../features/messages/components/MessageComposerPanel";
import { MessageLeadDetailsModal } from "../../features/messages/components/MessageLeadDetailsModal";
import { MessageLeadPanel } from "../../features/messages/components/MessageLeadPanel";
import {
  CONTEXT_PREVIEW_LIMIT,
} from "../../features/messages/constants/messages";
import type { ToneType } from "../../features/common/types/ui";

export const MessagesPage = () => {
  // Use centralized leads for message generation
  const { leads: manageLeads, loading } = useCentralizedLeads();

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [tone, setTone] = useState<ToneType>("professional");
  const [localDraft, setLocalDraft] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [contextExpanded, setContextExpanded] = useState(false);

  const { generateMessage, generatedMessage, isGenerating } = useMessageGenerator();

  // Auto-select first lead if none selected
  useEffect(() => {
    if (!selectedLeadId && manageLeads.length > 0) {
      setSelectedLeadId(manageLeads[0].id);
    }
  }, [selectedLeadId, manageLeads]);

  const selectedLead = useMemo(
    () => manageLeads.find((lead) => lead.id === selectedLeadId) ?? null,
    [manageLeads, selectedLeadId]
  );

  const generateSubject = () => {
    if (!selectedLead) {
      return "Regarding your project";
    }
    return `Regarding ${selectedLead.company} - Partnership Opportunity`;
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

  const leadContext = selectedLead?.notes || `Lead from ${selectedLead?.company || 'Unknown'}`;
  const trimmedContent =
    leadContext.length > CONTEXT_PREVIEW_LIMIT
      ? `${leadContext.slice(0, CONTEXT_PREVIEW_LIMIT).trim()}...`
      : leadContext;

  const handleGenerate = async () => {
    if (!selectedLead) {
      return;
    }
    setSendError(null);
    setSent(false);
    try {
      const result = await generateMessage({
        lead_context: `Company: ${selectedLead.company}\nContact: ${selectedLead.name}\nNotes: ${selectedLead.notes || 'N/A'}`,
        tone,
        max_words: 130,
      });
      setLocalDraft(result.message);
      setSubject(generateSubject());
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown AI error";
      setSendError(`AI draft generation failed: ${reason}`);
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
    <ResponsivePageLayout
      backgroundImage={bgRemotely}
      tint="rgba(56, 189, 248 , 0.80)"
      contentClassName="space-y-4"
    >
        <PageBackground image={bgRemotely} tint="rgba(56, 189, 248, 0.82)" opacity={0.88} />
        <header className="glass-card p-5">
          <h2 className="bg-gradient-to-r from-content via-accent to-accent-secondary bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl">Message Synthesis</h2>
          <p className="mt-1 text-sm text-content-secondary">Generate personalized outbound drafts from live lead context.</p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <MessageLeadPanel
            contextPreviewLimit={CONTEXT_PREVIEW_LIMIT}
            loading={loading}
            leads={manageLeads}
            selectedLeadId={selectedLeadId}
            selectedLead={selectedLead}
            leadContext={leadContext}
            trimmedContent={trimmedContent}
            contextExpanded={contextExpanded}
            isGenerating={isGenerating}
            onLeadChange={setSelectedLeadId}
            onToggleContext={() => setContextExpanded((value) => !value)}
            onOpenDetails={() => setDetailsOpen(true)}
            onGenerate={() => {
              void handleGenerate();
            }}
          />

          <MessageComposerPanel
            tone={tone}
            confidence={generatedMessage?.confidence ?? null}
            email={email}
            subject={subject}
            localDraft={localDraft}
            sending={sending}
            sent={sent}
            copied={copied}
            sendError={sendError}
            selectedLeadName={selectedLead?.name}
            onToneChange={setTone}
            onEmailChange={setEmail}
            onSubjectChange={setSubject}
            onDraftChange={setLocalDraft}
            onSend={() => {
              void handleSendEmail();
            }}
            onCopy={() => {
              void handleCopy();
            }}
          />
        </div>

        <MessageLeadDetailsModal
          open={detailsOpen}
          lead={selectedLead}
          onClose={() => setDetailsOpen(false)}
        />
    </ResponsivePageLayout>
  );
};
