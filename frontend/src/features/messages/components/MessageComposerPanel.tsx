import type { ToneType } from "../../common/types/ui";

import { TONES } from "../constants/messages";

type MessageComposerPanelProps = {
  tone: ToneType;
  confidence: number | null;
  customContext: string;
  email: string;
  subject: string;
  localDraft: string;
  sending: boolean;
  sent: boolean;
  copied: boolean;
  sendError: string | null;
  selectedLeadName?: string;
  onToneChange: (tone: ToneType) => void;
  onCustomContextChange: (value: string) => void;
  onApplyContextPreset: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onCopy: () => void;
  isGenerating: boolean;
  onGenerate: () => void;
};

export const MessageComposerPanel = ({
  tone,
  confidence,
  customContext,
  email,
  subject,
  localDraft,
  sending,
  sent,
  copied,
  sendError,
  selectedLeadName,
  onToneChange,
  onCustomContextChange,
  onApplyContextPreset,
  onEmailChange,
  onSubjectChange,
  onDraftChange,
  onSend,
  onCopy,
  isGenerating,
  onGenerate,
}: MessageComposerPanelProps) => {
  const contextPresets = [
    "Focus on ROI and measurable outcomes.",
    "Keep it concise and ask for a 10-minute call.",
    "Highlight trust, delivery quality, and timeline clarity.",
  ];

  return (
    <section className="glass-card p-4">
      <div className="mb-3 flex items-center gap-2">
        {TONES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onToneChange(option)}
            className={`rounded-glass-sm border px-3 py-1 text-xs uppercase tracking-[0.1em] transition-all duration-200 ${
              tone === option
                ? "border-accent/50 bg-accent-soft text-accent shadow-glow"
                : "border-accent/10 text-content-tertiary hover:border-accent/30 hover:text-content-secondary"
            }`}
          >
            {option}
          </button>
        ))}
        <div className="ml-auto text-xs text-content-tertiary">
          {confidence !== null ? (
            <span className="badge-accent">Confidence {confidence}%</span>
          ) : (
            "Draft not generated"
          )}
        </div>
      </div>

      <div className="mb-3 space-y-2">
        <label
          className="text-xs tracking-[0.1em] text-content-tertiary"
          htmlFor="your-context"
        >
          YOUR CONTEXT FOR AI
        </label>
        <textarea
          id="your-context"
          value={customContext}
          onChange={(event) => onCustomContextChange(event.target.value)}
          placeholder="Example: Mention we helped a SaaS team increase reply rate by 34%, and keep tone confident but warm."
          className="glass-input min-h-[92px] resize-y p-3 text-sm leading-6"
        />
        <div className="flex flex-wrap gap-2">
          {contextPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onApplyContextPreset(preset)}
              className="rounded-glass-sm border border-accent/20 bg-accent/5 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-content-secondary transition hover:border-accent/40 hover:text-content"
            >
              Quick Context
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 space-y-2">
        <label
          className="text-xs tracking-[0.1em] text-content-tertiary"
          htmlFor="email-to"
        >
          SEND TO
        </label>
        <input
          id="email-to"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="Enter client email"
          className="glass-input"
        />
        <label
          className="text-xs tracking-[0.1em] text-content-tertiary"
          htmlFor="email-subject"
        >
          SUBJECT
        </label>
        <input
          id="email-subject"
          value={subject}
          onChange={(event) => onSubjectChange(event.target.value)}
          placeholder="Subject"
          className="glass-input"
        />
        {!email ? (
          <p className="text-xs text-warning">No email found for this lead.</p>
        ) : null}
      </div>

      <textarea
        value={localDraft}
        onChange={(event) => onDraftChange(event.target.value)}
        className="glass-input min-h-[200px] resize-y p-3 text-sm leading-7"
      />

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs  text-content-tertiary">Specifically Optimized</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="accent-btn flex-1 text-xs font-bold disabled:opacity-60"
          >
            {isGenerating ? "GENERATING..." : "GENERATE DRAFT"}
          </button>
          <div className="flex gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onSend}
              disabled={sending || !email || !localDraft.trim()}
              className="flex-1 rounded-glass-sm bg-success px-4 py-1.5 text-xs font-semibold tracking-[0.08em] text-content-inverse shadow-[0_0_16px_rgba(16,185,129,0.3)] transition hover:shadow-[0_0_24px_rgba(16,185,129,0.5)] disabled:opacity-60"
            >
              {sending ? "SENDING..." : sent ? "SENT" : "SEND EMAIL"}
            </button>
            <button
              type="button"
              onClick={onCopy}
              className="rounded-glass-sm border border-success/30 bg-success-soft px-4 py-1.5 text-xs font-semibold tracking-[0.08em] text-success transition hover:border-success/50 hover:shadow-[0_0_16px_rgba(16,185,129,0.2)]"
            >
              {copied ? "COPIED" : "COPY"}
            </button>
          </div>
        </div>
      </div>
      {sendError ? (
        <p className="mt-2 text-xs text-danger">{sendError}</p>
      ) : null}
    </section>
  );
};
