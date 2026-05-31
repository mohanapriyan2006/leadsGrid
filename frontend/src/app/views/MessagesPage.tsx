import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { PageBackground } from "../../components/ui/PageBackground";
import { ResponsivePageLayout } from "../../components/ui/ResponsivePageLayout";
import bgRemotely from "../../assets/bg-images/remotely.svg";
import { useMessageGenerator } from "../../features/leads/hooks/useMessageGenerator";
import { messageService } from "../../features/leads/services/messageService";
import { useCentralizedLeads } from "../../features/leads/hooks/useCentralizedLeads";
import { MessageComposerPanel } from "../../features/messages/components/MessageComposerPanel";
import { MessageLeadDetailsModal } from "../../features/messages/components/MessageLeadDetailsModal";
import { MessageLeadPanel } from "../../features/messages/components/MessageLeadPanel";
import { EmailTemplatePreviewPanel } from "../../features/messages/components/EmailTemplatePreviewPanel";
import { CONTEXT_PREVIEW_LIMIT } from "../../features/messages/constants/messages";
import type { ToneType } from "../../features/common/types/ui";
import { useAuth } from "../../features/auth/AuthContext";
import { useSettingsState } from "../../features/settings/hooks/useSettingsState";
import { renderEmailTemplate } from "../../features/messages/utils/emailTemplateRenderer";
import type { EmailTemplateId } from "../../features/messages/types/emailTemplates";
import { EMAIL_TEMPLATES } from "../../features/messages/constants/emailTemplates";

type DiscoveryMessagesPrefillState = {
  fromDiscovery?: boolean;
  fromPipeline?: boolean;
  leadId?: string;
  tone?: ToneType;
  draft?: string;
  subject?: string;
  customContext?: string;
};

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

type EncodedAttachment = {
  filename: string;
  content_type: string;
  content_base64: string;
  size_bytes: number;
};

const encodeAttachment = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const base64Content = result.includes(",") ? result.split(",", 2)[1] : "";
      if (!base64Content) {
        reject(new Error("Failed to read file content."));
        return;
      }
      resolve(base64Content);
    };
    reader.onerror = () => reject(new Error("Unable to read selected file."));
    reader.readAsDataURL(file);
  });

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildContactFooterPlain = (
  primaryEmail: string,
  secondaryEmail: string,
): string => {
  const entries = [primaryEmail.trim(), secondaryEmail.trim()].filter(Boolean);
  const uniqueEntries = Array.from(new Set(entries));
  if (uniqueEntries.length === 0) {
    return "";
  }

  return `Contact Emails:\n${uniqueEntries.join("\n")}`;
};

const buildContactFooterHtml = (
  primaryEmail: string,
  secondaryEmail: string,
): string => {
  const entries = [primaryEmail.trim(), secondaryEmail.trim()].filter(Boolean);
  const uniqueEntries = Array.from(new Set(entries));
  if (uniqueEntries.length === 0) {
    return "";
  }

  const items = uniqueEntries
    .map((entry) => `<div>${escapeHtml(entry)}</div>`)
    .join("");

  return `<div style="margin-top:12px;color:#374151;font-size:13px;line-height:1.5;"><strong>Contact Emails:</strong>${items}</div>`;
};

const appendSignatureToPlain = (
  content: string,
  signature: string,
  primaryEmail: string,
  secondaryEmail: string,
): string => {
  const trimmedContent = content.trim();
  const trimmedSignature = signature.trim();
  const contactFooterPlain = buildContactFooterPlain(primaryEmail, secondaryEmail);
  if (!trimmedSignature) {
    if (!contactFooterPlain || trimmedContent.includes(contactFooterPlain)) {
      return trimmedContent;
    }
    return `${trimmedContent}\n\n${contactFooterPlain}`;
  }

  let next = trimmedContent;
  if (!trimmedContent.includes(trimmedSignature)) {
    next = `${next}\n\n${trimmedSignature}`;
  }

  if (contactFooterPlain && !next.includes(contactFooterPlain)) {
    next = `${next}\n\n${contactFooterPlain}`;
  }

  return next;
};

const appendSignatureToHtml = (
  content: string,
  signature: string,
  primaryEmail: string,
  secondaryEmail: string,
): string => {
  const trimmedSignature = signature.trim();
  const contactFooterHtml = buildContactFooterHtml(primaryEmail, secondaryEmail);

  const signatureHtml = trimmedSignature
    ? `<div style="margin-top:18px;padding-top:12px;border-top:1px solid #e5e7eb;color:#374151;font-size:14px;line-height:1.5;white-space:pre-wrap;">${escapeHtml(trimmedSignature)}</div>`
    : "";

  const hasSignature = trimmedSignature && content.includes(trimmedSignature);
  const hasContactFooter = contactFooterHtml && content.includes("Contact Emails:");

  if ((hasSignature || !signatureHtml) && (hasContactFooter || !contactFooterHtml)) {
    return content;
  }

  const combinedBlock = `${hasSignature ? "" : signatureHtml}${hasContactFooter ? "" : contactFooterHtml}`;

  if (!combinedBlock) {
    return content;
  }

  if (content.includes("</body>")) {
    return content.replace("</body>", `${combinedBlock}</body>`);
  }

  return `${content}${combinedBlock}`;
};

export const MessagesPage = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { settings } = useSettingsState(user?.email);
  // Use centralized leads for message generation
  const { leads: manageLeads, loading } = useCentralizedLeads();

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [tone, setTone] = useState<ToneType>("professional");
  const [customContext, setCustomContext] = useState(
    "Keep the email concise, personalized, and focused on a clear business outcome.",
  );
  const [activeTab, setActiveTab] = useState<"compose" | "templates">("compose");
  const [localDraft, setLocalDraft] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [senderName, setSenderName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<EmailTemplateId>(settings.messaging.defaultTemplateId);
  const [primaryColor, setPrimaryColor] = useState("#8b5cf6");
  const [secondaryColor, setSecondaryColor] = useState("#eef2ff");
  const [templateHtml, setTemplateHtml] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<EncodedAttachment | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [contextExpanded, setContextExpanded] = useState(false);
  const [prefillApplied, setPrefillApplied] = useState(false);

  const { generateMessage, generatedMessage, isGenerating } =
    useMessageGenerator();

  // Auto-select first lead if none selected
  useEffect(() => {
    if (!selectedLeadId && manageLeads.length > 0) {
      setSelectedLeadId(manageLeads[0].id);
    }
  }, [selectedLeadId, manageLeads]);

  useEffect(() => {
    if (prefillApplied) return;

    const navState =
      (location.state as DiscoveryMessagesPrefillState | null) ?? null;
    if (!navState) {
      return;
    }

    const fromSupportedSource = Boolean(
      navState.fromDiscovery || navState.fromPipeline,
    );
    if (!fromSupportedSource) {
      return;
    }

    let hasPrefill = false;

    if (
      navState.leadId &&
      manageLeads.some((lead) => lead.id === navState.leadId)
    ) {
      setSelectedLeadId(navState.leadId);
      hasPrefill = true;
    }

    if (navState.tone) {
      setTone(navState.tone);
      hasPrefill = true;
    }

    if (navState.customContext?.trim()) {
      setCustomContext(navState.customContext);
      hasPrefill = true;
    }

    if (navState.subject?.trim()) {
      setSubject(navState.subject);
      hasPrefill = true;
    }

    if (navState.draft?.trim()) {
      setLocalDraft(navState.draft);
      hasPrefill = true;
    }

    if (hasPrefill) {
      setPrefillApplied(true);
    }
  }, [location.state, manageLeads, prefillApplied]);

  const selectedLead = useMemo(
    () => manageLeads.find((lead) => lead.id === selectedLeadId) ?? null,
    [manageLeads, selectedLeadId],
  );

  const selectedTemplate = useMemo(
    () =>
      EMAIL_TEMPLATES.find((template) => template.id === selectedTemplateId) ??
      EMAIL_TEMPLATES[0],
    [selectedTemplateId],
  );

  const renderedTemplatePreview = useMemo(
    () =>
      renderEmailTemplate({
        templateId: selectedTemplateId,
        primaryColor,
        secondaryColor,
        tokens: {
          name: selectedLead?.name || "there",
          company: selectedLead?.company || "your team",
          pain_point:
            selectedLead?.notes?.trim() ||
            customContext.trim() ||
            "slower lead conversion",
          solution:
            customContext.trim() ||
            "improving reply quality with a focused outreach sequence",
          sender_name: senderName.trim() || "LeadsGrid Team",
        },
      }),
    [
      customContext,
      primaryColor,
      secondaryColor,
      selectedLead?.company,
      selectedLead?.name,
      selectedLead?.notes,
      selectedTemplateId,
      senderName,
    ],
  );

  useEffect(() => {
    setPrimaryColor(selectedTemplate.defaultPrimaryColor);
    setSecondaryColor(selectedTemplate.defaultSecondaryColor);
  }, [selectedTemplate]);

  useEffect(() => {
    setSelectedTemplateId(settings.messaging.defaultTemplateId);
  }, [settings.messaging.defaultTemplateId]);

  useEffect(() => {
    if (senderName.trim()) {
      return;
    }

    const defaultName =
      settings.profile.name.trim() ||
      user?.displayName?.trim() ||
      user?.email?.split("@")[0]?.trim() ||
      "User";
    setSenderName(defaultName);
  }, [senderName, settings.profile.name, user?.displayName, user?.email]);

  const resolvedReplyToEmail = useMemo(
    () =>
      user?.email?.trim() ||
      settings.messaging.primaryEmail.trim() ||
      settings.profile.email.trim() ||
      "",
    [settings.messaging.primaryEmail, settings.profile.email, user?.email],
  );

  const resolvedSecondaryEmail = useMemo(
    () => settings.messaging.secondaryEmail.trim(),
    [settings.messaging.secondaryEmail],
  );

  const signature = useMemo(
    () => settings.messaging.signature.trim(),
    [settings.messaging.signature],
  );

  useEffect(() => {
    setTone(settings.messaging.defaultTone);
  }, [settings.messaging.defaultTone]);

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

  const leadContext =
    selectedLead?.notes || `Lead from ${selectedLead?.company || "Unknown"}`;
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
      const promptSections = [
        "You are generating a high-converting outreach email.",
        `Lead company: ${selectedLead.company}`,
        `Contact name: ${selectedLead.name}`,
        `Lead stage: ${selectedLead.stage}`,
        `Lead score: ${selectedLead.score}`,
        `Lead notes: ${selectedLead.notes || "N/A"}`,
        `User context: ${customContext.trim() || "No extra context provided"}`,
        "Output: one professional outreach email draft with a clear CTA.",
      ];

      const result = await generateMessage({
        lead_context: promptSections.join("\n"),
        tone,
        max_words: 130,
      });
      setLocalDraft(
        appendSignatureToPlain(
          result.message,
          signature,
          resolvedReplyToEmail,
          resolvedSecondaryEmail,
        ),
      );
      setSubject(generateSubject());
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "Unknown AI error";
      setSendError(`AI draft generation failed: ${reason}`);
    }
  };

  const handleApplyTemplate = () => {
    setLocalDraft(
      appendSignatureToPlain(
        renderedTemplatePreview.plain,
        signature,
        resolvedReplyToEmail,
        resolvedSecondaryEmail,
      ),
    );
    if (!subject.trim()) {
      setSubject(renderedTemplatePreview.subject);
    }
    setTemplateHtml(
      appendSignatureToHtml(
        renderedTemplatePreview.html,
        signature,
        resolvedReplyToEmail,
        resolvedSecondaryEmail,
      ),
    );
    setActiveTab("compose");
  };

  const handleSendEmail = async () => {
    if (!selectedLead || !email || !localDraft.trim()) {
      return;
    }

    try {
      setSending(true);
      setSendError(null);
      setSent(false);

      const messageWithSignature = appendSignatureToPlain(
        localDraft,
        signature,
        resolvedReplyToEmail,
        resolvedSecondaryEmail,
      );
      const htmlWithSignature = templateHtml
        ? appendSignatureToHtml(
            templateHtml,
            signature,
            resolvedReplyToEmail,
            resolvedSecondaryEmail,
          )
        : undefined;

      await messageService.sendEmail({
        to: email,
        subject: subject.trim() || generateSubject(),
        message: messageWithSignature,
        body_plain: messageWithSignature,
        body_html: htmlWithSignature,
        lead_id: selectedLead.id,
        template_id: selectedTemplateId,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        sender_name: senderName.trim() || undefined,
        reply_to: resolvedReplyToEmail || undefined,
        attachment: attachment || undefined,
        custom_args: {
          tone,
          page: "messages",
        },
      });

      setLocalDraft(messageWithSignature);
      setSent(true);
    } catch {
      setSendError(
        "Failed to send email. Please verify email provider settings and try again.",
      );
    } finally {
      setSending(false);
    }
  };

  const handleAttachmentChange = async (file: File | null) => {
    if (!file) {
      setAttachment(null);
      return;
    }

    if (file.size > MAX_ATTACHMENT_BYTES) {
      setAttachment(null);
      setSendError("Attachment must be 5 MB or smaller.");
      return;
    }

    try {
      const contentBase64 = await encodeAttachment(file);
      setAttachment({
        filename: file.name,
        content_type: file.type || "application/octet-stream",
        content_base64: contentBase64,
        size_bytes: file.size,
      });
      setSendError(null);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown file error";
      setSendError(reason);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(localDraft);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <>
      <PageBackground image={bgRemotely} tint="rgba(21, 171, 123, 0.50)" />
      <ResponsivePageLayout contentClassName="space-y-4">
        <header className="glass-card p-5">
          <h2 className="bg-gradient-to-r from-content via-accent to-accent-secondary bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl">
            Message Synthesis
          </h2>
          <p className="mt-1 text-sm  ">
            Generate personalized outbound drafts from live lead context.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          {activeTab === "templates" ? (
            <EmailTemplatePreviewPanel
              templateName={selectedTemplate.name}
              previewSubject={renderedTemplatePreview.subject}
              htmlContent={renderedTemplatePreview.html}
            />
          ) : (
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
          )}

          <MessageComposerPanel
            tone={tone}
            confidence={generatedMessage?.confidence ?? null}
            activeTab={activeTab}
            customContext={customContext}
            senderName={senderName}
            replyToEmail={resolvedReplyToEmail}
            secondaryEmail={resolvedSecondaryEmail}
            email={email}
            subject={subject}
            localDraft={localDraft}
            selectedTemplateId={selectedTemplateId}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            selectedAttachmentName={attachment?.filename}
            selectedAttachmentSize={attachment?.size_bytes}
            sending={sending}
            sent={sent}
            copied={copied}
            sendError={sendError}
            selectedLeadName={selectedLead?.name}
            onTabChange={setActiveTab}
            onToneChange={setTone}
            onCustomContextChange={setCustomContext}
            onApplyContextPreset={(value) => {
              setCustomContext((current) => {
                if (!current.trim()) return value;
                if (current.includes(value)) return current;
                return `${current.trim()}\n- ${value}`;
              });
            }}
            onTemplateChange={setSelectedTemplateId}
            onPrimaryColorChange={setPrimaryColor}
            onSecondaryColorChange={setSecondaryColor}
            onApplyTemplate={handleApplyTemplate}
            onAttachmentChange={(file) => {
              void handleAttachmentChange(file);
            }}
            onSenderNameChange={setSenderName}
            onEmailChange={setEmail}
            onSubjectChange={setSubject}
            onDraftChange={setLocalDraft}
            onSend={() => {
              void handleSendEmail();
            }}
            onCopy={() => {
              void handleCopy();
            }}
            isGenerating={isGenerating}
            onGenerate={() => {
              void handleGenerate();
            }}
          />
        </div>

        <MessageLeadDetailsModal
          open={detailsOpen}
          lead={selectedLead}
          onClose={() => setDetailsOpen(false)}
        />
      </ResponsivePageLayout>
    </>
  );
};
