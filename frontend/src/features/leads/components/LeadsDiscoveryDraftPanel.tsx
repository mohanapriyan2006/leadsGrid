import type { ToneType } from "../../common/types/ui";
import type { AdvancedLeadIntent } from "../services/leadAnalysisService";
import type { HyperPersonalizedOutreachResult, Lead } from "../types/lead";
import { AIIcon, initials } from "./leadsPagePrimitives";

type LeadsDiscoveryDraftPanelProps = {
  tone: ToneType;
  selectedLead: Lead | null;
  selectedIntent: AdvancedLeadIntent | null;
  insightsText: string;
  outreachResult: HyperPersonalizedOutreachResult | null;
  painPointInput: string;
  userSkillsInput: string;
  portfolioSummaryInput: string;
  canGenerateOutreach: boolean;
  isGenerating: boolean;
  isGeneratingOutreach: boolean;
  onToneChange: (tone: ToneType) => void;
  onPainPointChange: (value: string) => void;
  onUserSkillsChange: (value: string) => void;
  onPortfolioSummaryChange: (value: string) => void;
  onAnalyze: () => void;
  onGenerateOutreach: () => void;
  onCopyInsights: () => Promise<void>;
  onCopyOutreach: () => Promise<void>;
  onOpenSource: () => void;
};

const sourceLabel: Record<Lead["source"], string> = {
  reddit: "Reddit",
  twitter: "Twitter",
  linkedin: "LinkedIn",
  hackernews: "Hacker News",
  search: "Search",
};

const buildLeadSignals = (lead: Lead) => {
  const signals: string[] = [];
  if (lead.score >= 80) signals.push("High intent score");
  if (lead.urgency) signals.push("Urgent buying signal");
  if (lead.budget) signals.push("Budget signal detected");
  if (lead.email) signals.push("Contact channel available");
  if (lead.tags.length > 0) signals.push(`${lead.tags.length} topical tags`);
  if (lead.decision_maker) signals.push(`Decision maker: ${lead.decision_maker}`);
  if (lead.status) signals.push(`Qualification: ${lead.status}`);
  if (lead.category) signals.push(`Category: ${lead.category}`);
  return signals.length > 0 ? signals : ["Needs deeper qualification"];
};

const toInsightBullets = (text: string) => {
  if (!text.trim()) return [];
  return text
    .split(/\n|\./)
    .map((line) => line.replace(/^[-*\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 5);
};

export const LeadsDiscoveryDraftPanel = ({
  tone,
  selectedLead,
  selectedIntent,
  insightsText,
  outreachResult,
  painPointInput,
  userSkillsInput,
  portfolioSummaryInput,
  canGenerateOutreach,
  isGenerating,
  isGeneratingOutreach,
  onToneChange,
  onPainPointChange,
  onUserSkillsChange,
  onPortfolioSummaryChange,
  onAnalyze,
  onGenerateOutreach,
  onCopyInsights,
  onCopyOutreach,
  onOpenSource,
}: LeadsDiscoveryDraftPanelProps) => {
  const insightBullets = toInsightBullets(insightsText);
  const leadSignals = selectedLead ? buildLeadSignals(selectedLead) : [];
  const skillsCount = userSkillsInput
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean).length;

  const qualityLabel = outreachResult
    ? outreachResult.metadata.personalization_score >= 0.85
      ? "Excellent"
      : outreachResult.metadata.personalization_score >= 0.7
        ? "Strong"
        : "Needs polish"
    : null;

  return (
    <aside className="glass-card overflow-y-auto h-[calc(100vh-150px)] min-w-0 space-y-4 p-5 xl:sticky xl:top-0">
      <div className="border-b border-accent/10 pb-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-content">
          <AIIcon />
          Lead Intelligence
          <span className="rounded bg-accent/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-accent">
            Connected
          </span>
        </div>

        <p className="mb-3 text-xs text-content-secondary">
          Analyze lead signals and generate AI insights to prioritize outreach and personalize messaging.
        </p>
      </div>

      {selectedLead ? (
        <div className="glass-card-sm space-y-3 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/20 bg-surface/60 text-xs font-semibold text-content-secondary">
              {initials(selectedLead.author || selectedLead.id)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-content">{selectedLead.author || selectedLead.id}</p>
              <p className="truncate text-xs text-content-secondary">{selectedLead.title ?? "Unknown Role"}</p>
            </div>
            <span className="ml-auto rounded-lg border border-accent-secondary/30 bg-accent-secondary/10 px-2 py-1 text-sm font-bold text-accent-secondary">
              {selectedLead.score}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-accent/10 bg-surface/35 px-2 py-1.5 text-content-secondary">
              Source: <span className="text-content">{sourceLabel[selectedLead.source]}</span>
            </div>
            <div className="rounded-lg border border-accent/10 bg-surface/35 px-2 py-1.5 text-content-secondary">
              Date: <span className="text-content">{new Date(selectedLead.created_at).toLocaleDateString()}</span>
            </div>
            <div className="rounded-lg border border-accent/10 bg-surface/35 px-2 py-1.5 text-content-secondary">
              Email: <span className="text-content">{selectedLead.email ? "Available" : "N/A"}</span>
            </div>
            <div className="rounded-lg border border-accent/10 bg-surface/35 px-2 py-1.5 text-content-secondary">
              Location: <span className="text-content">{selectedLead.location || "Unknown"}</span>
            </div>
          </div>

          <div>
            <p className="mb-1 text-[11px] uppercase tracking-[0.08em] text-content-tertiary">Intent Summary</p>
            <p className="text-xs leading-5 text-content-secondary">{selectedLead.summary}</p>
          </div>

          {selectedIntent ? (
            <div className="rounded-lg border border-accent-secondary/20 bg-accent-secondary/10 p-2.5">
              <p className="mb-1 text-[11px] uppercase tracking-[0.08em] text-content-tertiary">Advanced Qualification</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-full border border-accent/20 bg-surface/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-content-secondary">
                  {selectedIntent.status}
                </span>
                <span className="rounded-full border border-accent/20 bg-surface/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-content-secondary">
                  {selectedIntent.category}
                </span>
                <span className="rounded-full border border-accent/20 bg-surface/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-content-secondary">
                  Decision: {selectedIntent.decision_maker}
                </span>
                <span className="rounded-full border border-accent/20 bg-surface/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-content-secondary">
                  Urgency: {selectedIntent.urgency}
                </span>
              </div>
              <p className="mt-2 text-xs text-content-secondary">Pain: {selectedIntent.pain_point}</p>
              {selectedIntent.buying_signals.length > 0 ? (
                <p className="mt-1 text-xs text-content-secondary">Signals: {selectedIntent.buying_signals.join(" • ")}</p>
              ) : null}
            </div>
          ) : null}

          {selectedLead.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {selectedLead.tags.slice(0, 8).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-accent/20 bg-accent/10 px-2 py-1 text-[10px] uppercase tracking-[0.06em] text-content-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <p className="rounded-xl border border-accent/10 bg-surface/40 p-3 text-center text-xs text-content-tertiary">
          Select a lead to inspect details and generate AI insights.
        </p>
      )}

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.1em] text-content-tertiary">AI Insights</p>
        <div className={`glass-input min-h-[180px] w-full p-3 text-sm ${isGenerating ? "opacity-80" : ""}`}>
          {insightBullets.length > 0 ? (
            <ul className="space-y-2 text-content-secondary">
              {insightBullets.map((line, index) => (
                <li key={`${line}-${index}`} className="leading-6">
                  {line}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-content-tertiary">
              Run AI analysis to extract pain points, buying signals, and the best next action.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-accent/10 bg-surface/40 p-3">
        <p className="text-xs uppercase tracking-[0.1em] text-content-tertiary">Hyper-Personalized Outreach</p>

        <div className="space-y-1">
          <label className="text-[11px] uppercase tracking-[0.08em] text-content-tertiary">Pain Point</label>
          <textarea
            value={painPointInput}
            onChange={(event) => onPainPointChange(event.target.value)}
            rows={2}
            placeholder="Lead pain point"
            className="glass-input w-full resize-none px-2 py-2 text-xs text-content"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] uppercase tracking-[0.08em] text-content-tertiary">Your Skills</label>
          <input
            value={userSkillsInput}
            onChange={(event) => onUserSkillsChange(event.target.value)}
            placeholder="FastAPI, React, CRM automation"
            className="glass-input w-full px-2 py-2 text-xs text-content"
          />
          <p className="text-[11px] text-content-tertiary">{skillsCount} skills detected</p>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] uppercase tracking-[0.08em] text-content-tertiary">Portfolio Summary</label>
          <textarea
            value={portfolioSummaryInput}
            onChange={(event) => onPortfolioSummaryChange(event.target.value)}
            rows={2}
            placeholder="Relevant outcomes you've delivered"
            className="glass-input w-full resize-none px-2 py-2 text-xs text-content"
          />
          <p className="text-[11px] text-content-tertiary">{portfolioSummaryInput.trim().length}/2000 chars</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="accent-btn px-2 py-2 text-xs"
            onClick={onGenerateOutreach}
            disabled={!selectedLead || isGeneratingOutreach || !canGenerateOutreach}
          >
            {isGeneratingOutreach ? "Generating..." : "Generate Outreach"}
          </button>
          <button
            type="button"
            className="glass-btn px-2 py-2 text-xs"
            onClick={() => {
              void onCopyOutreach();
            }}
            disabled={!outreachResult?.message}
          >
            Copy Outreach
          </button>
        </div>

        {outreachResult ? (
          <div className="space-y-2 rounded-lg border border-accent-secondary/20 bg-accent-secondary/10 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-accent">
                {qualityLabel}
              </span>
              {outreachResult.metadata.rewritten ? (
                <span className="text-[10px] uppercase tracking-[0.08em] text-content-secondary">Auto-polished</span>
              ) : null}
            </div>
            <p className="text-xs leading-5 text-content">{outreachResult.message}</p>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-content-secondary">
              <span>Provider: {outreachResult.metadata.provider}</span>
              <span>Score: {Math.round(outreachResult.metadata.personalization_score * 100)}%</span>
              <span>Compliance: {Math.round(outreachResult.metadata.compliance_score * 100)}%</span>
              <span>Words: {outreachResult.metadata.word_count}</span>
              <span>Soft CTA: {outreachResult.metadata.has_soft_cta ? "Yes" : "No"}</span>
            </div>
            {outreachResult.metadata.violations.length > 0 ? (
              <div className="rounded border border-warning/25 bg-warning/10 p-2 text-[11px] text-warning">
                Needs fixes: {outreachResult.metadata.violations.join(", ")}
              </div>
            ) : (
              <div className="rounded border border-accent/20 bg-accent/10 p-2 text-[11px] text-content-secondary">
                All quality checks passed.
              </div>
            )}
          </div>
        ) : null}
      </div>

      {selectedLead ? (
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.1em] text-content-tertiary">Signal Highlights</p>
          <div className="space-y-1.5">
            {leadSignals.map((signal) => (
              <div
                key={signal}
                className="rounded-lg border border-accent-tertiary/20 bg-accent-tertiary/10 px-2.5 py-1.5 text-xs text-content-secondary"
              >
                {signal}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          className="accent-btn px-2 py-2 text-xs"
          onClick={onAnalyze}
          disabled={!selectedLead || isGenerating}
        >
          Analyze Lead
        </button>
        <button
          type="button"
          className="glass-btn px-2 py-2 text-xs"
          onClick={() => {
            void onCopyInsights();
          }}
          disabled={!insightsText}
        >
          Copy Insights
        </button>
        <button
          type="button"
          className="glass-btn px-2 py-2 text-xs"
          onClick={onOpenSource}
          disabled={!selectedLead?.permalink}
        >
          Open Source
        </button>
      </div>

      <div className="rounded-xl border border-accent-tertiary/20 bg-accent-tertiary/10 px-3 py-2 text-xs text-content-secondary">
        <strong className="text-accent-tertiary">Tip:</strong> Validate AI suggestions against the source post before CRM outreach.
      </div>
    </aside>
  );
};
