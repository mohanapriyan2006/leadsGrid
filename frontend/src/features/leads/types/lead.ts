export type Lead = {
  id: string;
  source: "reddit" | "twitter" | "linkedin";
  author: string;
  title?: string;
  avatar?: string;
  location?: string;
  timeAgo?: string;
  budget?: boolean;
  urgency?: boolean;
  permalink?: string | null;
  content: string;
  summary: string;
  score: number;
  tags: string[];
  intent_label: string;
  created_at: string;
};
