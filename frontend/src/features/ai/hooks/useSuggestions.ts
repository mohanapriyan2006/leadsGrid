import { useState, useCallback, useMemo } from "react";

import { TYPING_SUGGESTIONS, SMART_SUGGESTIONS } from "../constants/agentActions";
import type { SmartSuggestion } from "../types/agent";

export const useSuggestions = () => {
  const [inputValue, setInputValue] = useState("");

  const typingSuggestions = useMemo((): string[] => {
    const trimmed = inputValue.trim().toLowerCase();
    if (trimmed.length < 2) return [];

    const firstWord = trimmed.split(" ")[0];
    const matches = TYPING_SUGGESTIONS[firstWord];
    if (matches) {
      return matches.filter((s) => s.toLowerCase().includes(trimmed));
    }

    const allSuggestions = Object.values(TYPING_SUGGESTIONS).flat();
    return allSuggestions
      .filter((s) => s.toLowerCase().includes(trimmed))
      .slice(0, 4);
  }, [inputValue]);

  const smartChips = useMemo((): SmartSuggestion[] => {
    return SMART_SUGGESTIONS.slice(0, 6);
  }, []);

  const contextualChips = useCallback(
    (category?: SmartSuggestion["category"]): SmartSuggestion[] => {
      if (!category) return SMART_SUGGESTIONS.slice(0, 4);
      return SMART_SUGGESTIONS.filter((s) => s.category === category).slice(0, 4);
    },
    [],
  );

  return {
    inputValue,
    setInputValue,
    typingSuggestions,
    smartChips,
    contextualChips,
  };
};
