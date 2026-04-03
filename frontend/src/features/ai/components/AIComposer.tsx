import type { ChangeEvent, KeyboardEvent, RefObject } from "react";

import type { ToneType } from "../../common/types/ui";
import type { AIMode } from "../types/agent";
import { SuggestionDropdown } from "./SuggestionDropdown";

type AIComposerProps = {
  input: string;
  loading: boolean;
  attachedFile: File | null;
  fileAccept: string;
  tones: ToneType[];
  tone: ToneType;
  mode: AIMode;
  typingSuggestions: string[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onInputChange: (value: string) => void;
  onToneChange: (tone: ToneType) => void;
  onSend: () => void;
  onSuggestionSelect: (suggestion: string) => void;
};

export const AIComposer = ({
  input,
  loading,
  attachedFile,
  fileAccept,
  tones,
  tone,
  mode,
  typingSuggestions,
  fileInputRef,
  onFileUpload,
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
    <div className="relative overflow-hidden rounded-2xl border border-accent/[0.08] bg-surface-secondary/50 backdrop-blur-sm">
      <div className="relative flex items-end gap-2 p-3">
        <SuggestionDropdown
          suggestions={typingSuggestions}
          onSelect={onSuggestionSelect}
          visible={typingSuggestions.length > 0 && input.trim().length >= 2}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-accent/[0.06] bg-surface/40 text-sm transition-all hover:border-accent/15 hover:bg-accent/[0.06]"
          aria-label="Attach file"
        >
          📎
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept={fileAccept}
          onChange={onFileUpload}
          className="hidden"
        />

        <textarea
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={
            mode === "ask"
              ? "Ask something..."
              : "Tell the agent what to do..."
          }
          className="min-h-[40px] max-h-[120px] flex-1 resize-none rounded-xl border border-accent/[0.06] bg-surface/50 px-4 py-2.5 text-[14px] text-content outline-none transition-all placeholder:text-content-tertiary/60 focus:border-accent/20 focus:shadow-[0_0_0_3px_rgba(167,139,250,0.06)]"
          aria-label="Chat input"
        />

        <button
          type="button"
          onClick={onSend}
          disabled={loading || !input.trim()}
          className={`flex h-10 items-center gap-1.5 rounded-xl px-5 text-[13px] font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
            mode === "agent"
              ? "bg-gradient-to-r from-info to-info/80 text-surface shadow-[0_2px_12px_rgba(6,182,212,0.2)] hover:shadow-[0_2px_20px_rgba(6,182,212,0.3)]"
              : "bg-gradient-to-r from-accent to-accent-secondary text-surface shadow-[0_2px_12px_rgba(167,139,250,0.2)] hover:shadow-[0_2px_20px_rgba(167,139,250,0.3)]"
          }`}
          aria-label="Send message"
        >
          {mode === "agent" ? "Run" : "Send"}
          <span className="text-[11px] opacity-70">↵</span>
        </button>
      </div>

      <div className="flex items-center gap-2 border-t border-accent/[0.04] bg-surface/20 px-3.5 py-1.5">
        <span
          className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
            mode === "ask"
              ? "bg-accent/10 text-accent/70"
              : "bg-info/10 text-info/70"
          }`}
        >
          {mode === "ask" ? "Ask" : "Agent"}
        </span>

        {attachedFile ? (
          <span className="flex items-center gap-1 text-[11px] text-success">
            <span className="h-1 w-1 rounded-full bg-success" />
            {attachedFile.name}
          </span>
        ) : (
          <span className="text-[11px] text-content-tertiary/50">
            Attach image, PDF, or CSV
          </span>
        )}

        <div className="ml-auto flex items-center gap-1">
          {tones.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onToneChange(option)}
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-all ${
                tone === option
                  ? "bg-accent/10 text-accent"
                  : "text-content-tertiary/40 hover:text-content-tertiary"
              }`}
              aria-label={`Set tone to ${option}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
