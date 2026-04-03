import type { ToneType } from "../../common/types/ui";

import { TONES } from "../constants/messages";

type MessageComposerPanelProps = {
  tone: ToneType;
  confidence: number | null;
  email: string;
  subject: string;
  localDraft: string;
  sending: boolean;
  sent: boolean;
  copied: boolean;
  sendError: string | null;
  selectedLeadName?: string;
  onToneChange: (tone: ToneType) => void;
  onEmailChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onCopy: () => void;
};

export const MessageComposerPanel = ({
  tone,
  confidence,
  email,
  subject,
  localDraft,
  sending,
  sent,
  copied,
  sendError,
  selectedLeadName,
  onToneChange,
  onEmailChange,
  onSubjectChange,
  onDraftChange,
  onSend,
  onCopy,
}: MessageComposerPanelProps) => {
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
        <label className="text-xs tracking-[0.1em] text-content-tertiary" htmlFor="email-to">
          SEND TO
        </label>
        <input
          id="email-to"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="Enter client email"
          className="glass-input"
        />
        <label className="text-xs tracking-[0.1em] text-content-tertiary" htmlFor="email-subject">
          SUBJECT
        </label>
        <input
          id="email-subject"
          value={subject}
          onChange={(event) => onSubjectChange(event.target.value)}
          placeholder="Subject"
          className="glass-input"
        />
        {!email ? <p className="text-xs text-warning">No email found for this lead.</p> : null}
      </div>

      <textarea
        value={localDraft}
        onChange={(event) => onDraftChange(event.target.value)}
        className="glass-input min-h-[360px] resize-y p-3 text-sm leading-7"
      />

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-content-tertiary">
          Optimized for {selectedLeadName?.toUpperCase() || "LEAD"}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSend}
            disabled={sending || !email || !localDraft.trim()}
            className="rounded-glass-sm bg-success px-4 py-1.5 text-xs font-semibold tracking-[0.08em] text-content-inverse shadow-[0_0_16px_rgba(16,185,129,0.3)] transition hover:shadow-[0_0_24px_rgba(16,185,129,0.5)] disabled:opacity-60"
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
      {sendError ? <p className="mt-2 text-xs text-danger">{sendError}</p> : null}
    </section>
  );
};
