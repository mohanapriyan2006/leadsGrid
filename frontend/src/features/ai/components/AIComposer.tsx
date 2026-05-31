import type { KeyboardEvent } from "react";
import { Users, CornerDownLeft } from "lucide-react";

import type { ToneType } from "../../common/types/ui";
import type { AIMode } from "../types/agent";
import { SuggestionDropdown } from "./SuggestionDropdown";

type AIComposerProps = {
  input: string;
  loading: boolean;
  attachedLeads: Array<{ id: string; title: string }>;
  tones: ToneType[];
  tone: ToneType;
  mode: AIMode;
  typingSuggestions: string[];
  onOpenAttachLeads: () => void;
  onRemoveAttachedLead: (leadId: string) => void;
  onInputChange: (value: string) => void;
  onToneChange: (tone: ToneType) => void;
  onSend: () => void;
  onSuggestionSelect: (suggestion: string) => void;
};

export const AIComposer = ({
  input,
  loading,
  attachedLeads,
  tones,
  tone,
  mode,
  typingSuggestions,
  onOpenAttachLeads,
  onRemoveAttachedLead,
  onInputChange,
  onToneChange,
  onSend,
  onSuggestionSelect,
}: AIComposerProps) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="sticky bottom-0 z-10 overflow-hidden rounded-2xl border border-accent/[0.1] bg-surface-secondary/60">
      {attachedLeads.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-accent/[0.08] bg-surface/35 px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest  text-content-tertiaryy">
            Attached Leads
          </span>
          {attachedLeads.map((lead) => (
            <span
              key={lead.id}
              className="inline-flex items-center gap-1 rounded-full border border-accent/[0.12] bg-accent/[0.06] px-2 py-0.5 text-[11px] text-content"
              title={lead.title}
            >
              {lead.title}
              <button
                type="button"
                onClick={() => onRemoveAttachedLead(lead.id)}
                className="text-content-secondary transition hover:text-content"
                aria-label={`Remove ${lead.title}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="relative flex items-end gap-2 p-3">
        <SuggestionDropdown
          suggestions={typingSuggestions}
          onSelect={onSuggestionSelect}
          visible={typingSuggestions.length > 0 && input.trim().length >= 2}
        />

        <button
          type="button"
          onClick={onOpenAttachLeads}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-accent/[0.1] bg-surface/50 text-sm text-content-secondary transition-all hover:bg-surface-secondary hover:text-content"
          aria-label="Attach leads"
        >
          <Users className="w-4 h-4" />
        </button>

        <textarea
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={
            mode === "ask"
              ? "Ask about your leads, pipeline, or outreach..."
              : "Tell the agent what to do..."
          }
          className="min-h-[44px] max-h-[140px] flex-1 resize-none rounded-xl border border-accent/[0.1] bg-surface/50 px-4 py-2.5 text-[14px] text-content outline-none transition-all placeholder:text-content-tertiary/70 focus:border-accent/40"
          aria-label="Chat input"
        />

        <button
          type="button"
          onClick={onSend}
          disabled={loading || !input.trim()}
          className={`flex h-10 items-center gap-1.5 rounded-xl px-5 text-[13px] font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30 ${
            mode === "agent"
              ? "bg-info/90 text-surface hover:bg-info"
              : "bg-accent/90 text-surface hover:bg-accent"
          }`}
          aria-label="Send message"
        >
          {mode === "agent" ? "Run" : "Send"}
          <CornerDownLeft className="w-3.5 h-3.5 opacity-70" />
        </button>
      </div>

      <div className="flex items-center gap-2 border-t border-accent/[0.08] bg-surface/20 px-3.5 py-1.5">
        <span
          className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
            mode === "ask"
              ? "bg-accent/10 text-accent/70"
              : "bg-info/10 text-info/70"
          }`}
        >
          {mode === "ask" ? "Ask" : "Agent"}
        </span>

        {attachedLeads.length > 0 ? (
          <span className="flex items-center gap-1 text-[11px] text-success">
            <span className="h-1 w-1 rounded-full bg-success" />
            {attachedLeads.length} leads attached
          </span>
        ) : (
          <span className="text-[11px]  text-content-tertiaryy/50">
            Attach leads to focus AI context
          </span>
        )}

        <label className="ml-auto flex items-center gap-2 text-[11px]  text-content-tertiaryy">
          Tone
          <select
            value={tone}
            onChange={(event) => onToneChange(event.target.value as ToneType)}
            className="rounded-md border border-accent/[0.12] bg-surface/60 px-2 py-0.5 text-[11px] text-content outline-none"
            aria-label="Set response tone"
          >
            {tones.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
};
