import type { SourceType, ToneType } from "../../common/types/ui";

export const TONES: ToneType[] = ["professional", "friendly", "direct"];

export const CONTEXT_PREVIEW_LIMIT = 140;

export const toUiSource = (source: string): SourceType => {
  if (source === "linkedin" || source === "twitter" || source === "reddit") {
    return source;
  }
  return "linkedin";
};
