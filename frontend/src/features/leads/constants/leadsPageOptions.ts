import type { Lead } from "../types/lead";

export const LEAD_SOURCES: Lead["source"][] = ["linkedin", "twitter", "reddit"];

export const LEAD_INDUSTRIES = [
  "Software & SaaS",
  "FinTech",
  "HealthTech",
  "eCommerce",
  "Enterprise",
] as const;
