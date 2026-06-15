import { useState } from "react";
import { Mail, RefreshCw, Send, X } from "lucide-react";

import type { AgentCardData } from "../../types/agent";

type MessageDraftCardProps = {
  card: AgentCardData;
  onAction: (action: string, payload?: Record<string, unknown>) => void;
};

export const MessageDraftCard = ({ card, onAction }: MessageDraftCardProps) => {
  const leadIds = (card.data.lead_ids as string[]) || [];
  const initialDraft = String(card.data.draft || "");
  const [draft, setDraft] = useState(initialDraft);
  const [tone, setTone] = useState(String(card.data.tone || "professional"));

  return (
    <div className="mt-2 w-full overflow-hidden rounded-xl border border-info/[0.15] bg-surface-secondary/50">
      <div className="flex items-center gap-2 border-b border-info/[0.1] px-3 py-2">
        <Mail className="h-4 w-4 text-info" />
        <span className="text-sm font-semibold text-content">{card.title}</span>
        <span className="ml-auto text-[10px] text-content-secondary">{leadIds.length} lead(s)</span>
      </div>

      <div className="space-y-2 px-3 py-2">
        <div>
          <label className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wider text-content-secondary">
            Message
          </label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-lg border border-accent/[0.1] bg-surface/50 px-3 py-2 text-[13px] text-content outline-none focus:border-info/40"
            placeholder="Draft your message here..."
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-content-secondary">Tone</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="rounded-lg border border-accent/[0.1] bg-surface/50 px-2 py-1 text-[11px] text-content outline-none"
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="direct">Direct</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 border-t border-info/[0.1] px-3 py-2">
        <button
          type="button"
          onClick={() => onAction("cancel")}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-accent/[0.1] bg-surface/40 px-3 py-2 text-[12px] font-medium text-content-secondary transition hover:text-content"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onAction("regenerate_message", { lead_ids: leadIds, tone })}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-info/[0.15] bg-info/[0.08] px-3 py-2 text-[12px] font-medium text-info transition hover:bg-info/[0.12]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Regenerate
        </button>
        <button
          type="button"
          onClick={() => onAction("send_message", { lead_ids: leadIds, draft, tone })}
          disabled={!draft.trim()}
          className="ml-auto flex items-center justify-center gap-1.5 rounded-xl bg-info/90 px-4 py-2 text-[12px] font-semibold text-surface transition hover:bg-info disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" />
          Send
        </button>
      </div>
    </div>
  );
};
