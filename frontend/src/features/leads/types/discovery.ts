import type { Lead } from "./lead";

export type DiscoveryLeadDto = {
  id: string | null;
  title: string;
  summary: string;
  content: string;
  platform: string;
  score: number;
  upvotes: number;
  url: string | null;
  author: string | null;
  email: string | null;
  created_at: string | null;
};

export type DiscoveryParams = {
  query: string;
  limit?: number;
  selectedSources?: Lead["source"][];
};
