import type { ToneType } from "../../common/types/ui";
import type { Lead } from "../types/lead";
import { AIIcon, initials } from "./leadsPagePrimitives";

type LeadsDiscoveryDraftPanelProps = {
  tone: ToneType;
  selectedLead: Lead | null;
  draftText: string;
  isGenerating: boolean;
  onToneChange: (tone: ToneType) => void;
  onGenerate: () => void;
  onCopy: () => Promise<void>;
  onSend: () => void;
};

export const LeadsDiscoveryDraftPanel = ({
  tone,
  selectedLead,
  draftText,
  isGenerating,
  onToneChange,
  onGenerate,
  onCopy,
  onSend,
}: LeadsDiscoveryDraftPanelProps) => {
  return (
    <aside className="glass-card h-fit min-w-0 space-y-4 p-5 xl:sticky xl:top-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-content">
          <AIIcon />
          AI Outreach
          <span className="rounded bg-gradient-to-r from-accent to-accent-secondary px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-content-inverse">
            LIVE
          </span>
        </div>

        <div className="flex gap-1">
          {(["professional", "friendly", "direct"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onToneChange(item)}
              className={`rounded-full border px-2.5 py-1 text-[11px] uppercase ${
                tone === item
                  ? "border-accent/40 bg-accent-soft text-content"
                  : "border-accent/10 text-content-secondary hover:border-accent/30"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {selectedLead ? (
        <div className="glass-card-sm flex items-center gap-3 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-xs font-semibold text-content-secondary">
            {initials(selectedLead.author || selectedLead.id)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-content">{selectedLead.author || selectedLead.id}</p>
            <p className="truncate text-xs text-content-secondary">{selectedLead.title ?? "Unknown Role"}</p>
          </div>
          <span className="ml-auto text-lg font-bold text-content">{selectedLead.score}</span>
        </div>
      ) : (
        <p className="text-center text-xs text-content-tertiary">Select a lead to generate a message.</p>
      )}

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.1em] text-content-tertiary">Draft Message</p>
        <textarea
          className={`glass-input min-h-[180px] w-full resize-y p-3 text-sm leading-6 ${isGenerating ? "opacity-80" : ""}`}
          value={draftText}
          onChange={() => {}}
          placeholder="Click Generate Draft on a lead to create personalized outreach..."
          readOnly
        />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          className="accent-btn px-2 py-2 text-xs"
          onClick={onGenerate}
          disabled={!selectedLead || isGenerating}
        >
          {isGenerating ? "Generating..." : "Regenerate"}
        </button>
        <button
          type="button"
          className="glass-btn px-2 py-2 text-xs"
          onClick={() => {
            void onCopy();
          }}
          disabled={!draftText}
        >
          Copy
        </button>
        <button
          type="button"
          className="glass-btn px-2 py-2 text-xs"
          onClick={onSend}
          disabled={!draftText || !selectedLead?.email}
        >
          Send
        </button>
      </div>

      <div className="rounded-xl border border-accent/20 bg-accent-soft px-3 py-2 text-xs text-content-secondary">
        <strong className="text-accent">Insight:</strong> Prioritize fresh intent signals with score above 75 for higher response rates.
      </div>
    </aside>
  );
};
