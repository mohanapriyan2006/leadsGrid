import { useMutation } from "@tanstack/react-query";

import {
  messageService,
  type MessageGenerationPayload,
} from "../services/messageService";
import { aiHistoryService } from "../../ai/services/aiHistoryService";

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

  return {
    generateMessage: generateMutation.mutateAsync,
    generatedMessage: generateMutation.data,
    isGenerating: generateMutation.isPending,
    generationError: generateMutation.error,
  };
};
