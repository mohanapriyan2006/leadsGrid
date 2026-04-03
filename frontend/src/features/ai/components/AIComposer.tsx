import type { ChangeEvent, KeyboardEvent, RefObject } from "react";

import type { ToneType } from "../../common/types/ui";

type AIComposerProps = {
  input: string;
  loading: boolean;
  attachedFile: File | null;
  fileAccept: string;
  tones: ToneType[];
  tone: ToneType;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onInputChange: (value: string) => void;
  onToneChange: (tone: ToneType) => void;
  onSend: () => void;
};

export const AIComposer = ({
  input,
  loading,
  attachedFile,
  fileAccept,
  tones,
  tone,
  fileInputRef,
  onFileUpload,
  onInputChange,
  onToneChange,
  onSend,
}: AIComposerProps) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="glass-card p-3">
      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="glass-btn px-3 py-2 text-sm"
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
          rows={2}
          placeholder="Ask something..."
          className="glass-input min-h-[52px] flex-1 resize-none"
        />

        <button
          type="button"
          onClick={onSend}
          disabled={loading || !input.trim()}
          className="accent-btn px-4 py-2 text-sm disabled:opacity-60"
        >
          Send
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {attachedFile ? (
          <span className="text-xs text-success">Attached: {attachedFile.name}</span>
        ) : (
          <span className="text-xs text-content-tertiary">
            Attach image, PDF, or CSV for deeper analysis.
          </span>
        )}

        <div className="ml-auto flex gap-2">
          {tones.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onToneChange(option)}
              className={`rounded border px-2.5 py-1 text-[11px] uppercase tracking-wider ${
                tone === option
                  ? "border-info/40 bg-info-soft text-info"
                  : "border-accent/10 text-content-tertiary hover:border-accent/30"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
