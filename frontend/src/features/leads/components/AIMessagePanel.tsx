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
      className="glass-card p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-content">AI Message Engine</h3>
        <button
          type="button"
          onClick={onGenerate}
          disabled={!selectedLead || isGenerating}
          className="accent-btn px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
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
                ? "border-accent/50 bg-accent-soft text-accent shadow-glow"
                : "border-accent/10 text-content-tertiary hover:border-accent/30"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="glass-card-sm p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-content-tertiary">Client Context</p>
          {selectedLead ? (
            <div className="mt-2 space-y-2 text-sm">
              <p className="text-content">{selectedLead.summary}</p>
              <p className="text-content-secondary">{selectedLead.content}</p>
              <p className="text-accent">Intent: {selectedLead.intent_label}</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-content-secondary">Select a lead to generate a tailored draft.</p>
          )}
        </section>

        <section className="glass-card-sm p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-content-tertiary">Generated Draft</p>
          {generatedMessage ? (
            <div className="mt-2 space-y-3 text-sm">
              <p className="text-content">{generatedMessage.message}</p>
              <p className="text-content-secondary">Confidence: {generatedMessage.confidence}% via {generatedMessage.provider}</p>
              {generatedMessage.evaluation ? (
                <p className="text-[12px] text-accent">Evaluator: {generatedMessage.evaluation}</p>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-sm text-content-secondary">No draft yet. Generate from selected lead context.</p>
          )}
        </section>
      </div>
    </motion.div>
  );
};
