import { useState, useCallback, useMemo } from "react";

import { getSmartSuggestions, getTypingSuggestions } from "../services/suggestionEngine";
import type { AIMode, SmartSuggestion } from "../types/agent";

type UseSuggestionsOptions = {
  mode: AIMode;
  leadCount: number;
  manageLeadCount: number;
  topLeadName?: string;
};

export const useSuggestions = ({ mode, leadCount, manageLeadCount, topLeadName }: UseSuggestionsOptions) => {
  const [inputValue, setInputValue] = useState("");

  const context = useMemo(
    () => ({
      mode,
      leadCount,
      manageLeadCount,
      topLeadName,
    }),
    [mode, leadCount, manageLeadCount, topLeadName],
  );

  const typingSuggestions = useMemo((): string[] => {
    return getTypingSuggestions(context, inputValue);
  }, [context, inputValue]);

  const smartChips = useMemo((): SmartSuggestion[] => {
    return getSmartSuggestions(context);
  }, [context]);

  const contextualChips = useCallback(
    (category?: SmartSuggestion["category"]): SmartSuggestion[] => {
      if (!category) return smartChips;
      return smartChips.filter((s) => s.category === category);
    },
    [smartChips],
  );

  return {
    inputValue,
    setInputValue,
    typingSuggestions,
    smartChips,
    contextualChips,
  };
};
