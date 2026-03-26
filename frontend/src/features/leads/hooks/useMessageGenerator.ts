import { useMutation } from "@tanstack/react-query";

import {
  messageService,
  type MessageGenerationPayload,
} from "../services/messageService";

export const useMessageGenerator = () => {
  const generateMutation = useMutation({
    mutationFn: (payload: MessageGenerationPayload) =>
      messageService.generateMessage(payload),
  });

  return {
    generateMessage: generateMutation.mutateAsync,
    generatedMessage: generateMutation.data,
    isGenerating: generateMutation.isPending,
    generationError: generateMutation.error,
  };
};
