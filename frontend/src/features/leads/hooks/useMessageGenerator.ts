import { useMutation } from "@tanstack/react-query";

import {
  messageService,
  type MessageGenerationPayload,
} from "../services/messageService";
import { aiHistoryService } from "../../ai/services/aiHistoryService";
import type { HyperPersonalizedOutreachRequest } from "../types/lead";

export const useMessageGenerator = () => {
  const generateMutation = useMutation({
    mutationFn: async (payload: MessageGenerationPayload) => {
      const result = await messageService.generateMessage(payload);
      await aiHistoryService.save({
        type: "email",
        prompt: payload.lead_context,
        outputText: result.message,
      });
      return result;
    },
  });

  const hyperOutreachMutation = useMutation({
    mutationFn: async (payload: HyperPersonalizedOutreachRequest) => {
      const result = await messageService.generateHyperPersonalizedOutreach(payload);
      await aiHistoryService.save({
        type: "email",
        prompt: [
          payload.lead_text,
          `Pain point: ${payload.pain_point}`,
          `Skills: ${payload.user_skills.join(", ")}`,
          `Portfolio: ${payload.portfolio_summary}`,
        ].join("\n"),
        outputText: result.message,
      });

      return result;
    },
  });

  return {
    generateMessage: generateMutation.mutateAsync,
    generatedMessage: generateMutation.data,
    isGenerating: generateMutation.isPending,
    generationError: generateMutation.error,
    generateHyperPersonalizedOutreach: hyperOutreachMutation.mutateAsync,
    hyperOutreachResult: hyperOutreachMutation.data,
    isGeneratingHyperOutreach: hyperOutreachMutation.isPending,
    hyperOutreachError: hyperOutreachMutation.error,
  };
};
