import { useMutation } from "@tanstack/react-query";

import {
  leadAnalysisService,
  type AdvancedLeadIntent,
  type AnalyzeLeadPayload,
  type LeadAnalysisResult,
  type LeadIntent,
  type LeadValidation,
  type OutreachMessage,
  type ActionSuggestion,
} from "../services/leadAnalysisService";

export const useLeadAnalysis = () => {
  const fullAnalysisMutation = useMutation<LeadAnalysisResult, Error, AnalyzeLeadPayload>({
    mutationFn: leadAnalysisService.analyzeLead,
  });

  const intentMutation = useMutation<LeadIntent, Error, AnalyzeLeadPayload>({
    mutationFn: leadAnalysisService.analyzeIntent,
  });

  const validationMutation = useMutation<LeadValidation, Error, AnalyzeLeadPayload>({
    mutationFn: leadAnalysisService.validateLead,
  });

  const advancedIntentMutation = useMutation<AdvancedLeadIntent, Error, AnalyzeLeadPayload>({
    mutationFn: leadAnalysisService.analyzeAdvancedIntent,
  });

  const outreachMutation = useMutation<OutreachMessage, Error, AnalyzeLeadPayload>({
    mutationFn: leadAnalysisService.generateOutreach,
  });

  const actionMutation = useMutation<ActionSuggestion, Error, AnalyzeLeadPayload>({
    mutationFn: leadAnalysisService.suggestAction,
  });

  return {
    analyzeLead: fullAnalysisMutation.mutateAsync,
    analyzeLeadData: fullAnalysisMutation.data,
    isAnalyzing: fullAnalysisMutation.isPending,
    analysisError: fullAnalysisMutation.error,

    analyzeIntent: intentMutation.mutateAsync,
    intentData: intentMutation.data,
    isAnalyzingIntent: intentMutation.isPending,

    analyzeAdvancedIntent: advancedIntentMutation.mutateAsync,
    advancedIntentData: advancedIntentMutation.data,
    isAnalyzingAdvancedIntent: advancedIntentMutation.isPending,

    validateLead: validationMutation.mutateAsync,
    validationData: validationMutation.data,
    isValidating: validationMutation.isPending,

    generateOutreach: outreachMutation.mutateAsync,
    outreachData: outreachMutation.data,
    isGeneratingOutreach: outreachMutation.isPending,

    suggestAction: actionMutation.mutateAsync,
    actionData: actionMutation.data,
    isSuggestingAction: actionMutation.isPending,
  };
};
