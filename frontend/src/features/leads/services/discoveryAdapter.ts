import type { Lead } from "../types/lead";
import type { DiscoveryLeadDto } from "../types/discovery";

const SOURCE_MAP: Record<string, Lead["source"]> = {
  reddit: "reddit",
  hackernews: "hackernews",
  search: "search",
  linkedin: "linkedin",
  twitter: "twitter",
};

const toSource = (platform: string): Lead["source"] => {
  return SOURCE_MAP[platform.toLowerCase()] ?? "search";
};

const toTimeAgo = (createdAtIso: string): string => {
  const created = new Date(createdAtIso).getTime();
  if (Number.isNaN(created)) return "just now";

  const delta = Math.max(0, Date.now() - created);
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const inferTags = (text: string): string[] => {
  const lower = text.toLowerCase();
  const tags: string[] = [];

  if (lower.includes("crm")) tags.push("crm");
  if (lower.includes("saas")) tags.push("saas");
  if (lower.includes("automation")) tags.push("automation");
  if (lower.includes("lead") || lower.includes("outreach")) tags.push("sales");
  if (lower.includes("ai") || lower.includes("llm") || lower.includes("agent")) tags.push("ai");

  return tags.length ? tags : ["opportunity"];
};

const inferIntent = (score: number): string => {
  if (score >= 85) return "high intent";
  if (score >= 65) return "medium intent";
  return "early signal";
};

const initials = (name: string): string => {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export const adaptDiscoveryLead = (dto: DiscoveryLeadDto): Lead => {
  const createdAt = dto.created_at || new Date().toISOString();
  const author = dto.author?.trim() || "Unknown Author";
  const summary = dto.summary?.trim() || dto.title;
  const content = dto.content?.trim() || summary;
  const score = Number.isFinite(dto.score) ? Math.max(1, Math.min(Math.round(dto.score), 100)) : 50;
  const combinedText = `${dto.title} ${summary} ${content}`;

  return {
    id: dto.id || `${toSource(dto.platform)}-${Math.random().toString(36).slice(2, 10)}`,
    source: toSource(dto.platform),
    author,
    title: dto.title,
    email: dto.email,
    avatar: initials(author),
    location: undefined,
    timeAgo: toTimeAgo(createdAt),
    budget: score >= 78,
    urgency: score >= 88,
    permalink: dto.url,
    content,
    summary,
    score,
    tags: inferTags(combinedText),
    intent_label: inferIntent(score),
    created_at: createdAt,
  };
};
