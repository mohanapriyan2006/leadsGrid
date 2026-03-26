import { motion } from "framer-motion";

import type { Lead } from "../types/lead";
import type { MessageGenerationResult } from "../services/messageService";

type AIMessagePanelProps = {
  selectedLead: Lead | null;
  generatedMessage: MessageGenerationResult | undefined;
  tone: "professional" | "friendly" | "direct";
  onToneChange: (tone: "professional" | "friendly" | "direct") => void;
  onGenerate: () => void;
  isGenerating: boolean;
};

const toneOptions: Array<"professional" | "friendly" | "direct"> = [
  "professional",
  "friendly",
  "direct",
];

export const AIMessagePanel = ({
  selectedLead,
  generatedMessage,
  tone,
  onToneChange,
  onGenerate,
  isGenerating,
}: AIMessagePanelProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-xl border border-white/10 bg-panel/70 p-4 shadow-aura"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-white">AI Message Engine</h3>
        <button
          type="button"
          onClick={onGenerate}
          disabled={!selectedLead || isGenerating}
          className="rounded bg-accent px-3 py-2 text-xs font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating ? "Generating..." : "Generate"}
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        {toneOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onToneChange(option)}
            className={`rounded border px-3 py-1 text-xs uppercase tracking-[0.15em] ${
              tone === option
                ? "border-accent/60 bg-accent/10 text-white"
                : "border-white/10 text-text-dim"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-white/10 bg-black/20 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-text-dim">Client Context</p>
          {selectedLead ? (
            <div className="mt-2 space-y-2 text-sm">
              <p className="text-white">{selectedLead.summary}</p>
              <p className="text-text-dim">{selectedLead.content}</p>
              <p className="text-accent">Intent: {selectedLead.intent_label}</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-text-dim">Select a lead to generate a tailored draft.</p>
          )}
        </section>

        <section className="rounded-lg border border-white/10 bg-black/20 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-text-dim">Generated Draft</p>
          {generatedMessage ? (
            <div className="mt-2 space-y-3 text-sm">
              <p className="text-white">{generatedMessage.message}</p>
              <p className="text-text-dim">Confidence: {generatedMessage.confidence}% via {generatedMessage.provider}</p>
              {generatedMessage.evaluation ? (
                <p className="text-[12px] text-accent">Evaluator: {generatedMessage.evaluation}</p>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-sm text-text-dim">No draft yet. Generate from selected lead context.</p>
          )}
        </section>
      </div>
    </motion.div>
  );
};
