import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLeadStore } from "../store/useLeadStore";
import { leadService } from "../features/leads/services/leadService";
import { navigationItems } from "../constants/navigation";
import { SETTINGS_TABS } from "../features/settings/constants/settingsOptions";
import type { ManageLead } from "../features/leads/types/manageLead";
import { CRM_STAGES } from "../features/crm/constants/crm";

export type SearchCategory = "leads" | "deals" | "features" | "settings" | "recycle";

export type SearchResult = {
  id: string;
  category: SearchCategory;
  title: string;
  subtitle: string;
  path: string;
  icon: string;
  meta?: Record<string, unknown>;
};

export type SearchResultGroup = {
  category: SearchCategory;
  label: string;
  items: SearchResult[];
};

const scoreMatch = (text: string, query: string): number => {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return 1;
  if (lowerText === lowerQuery) return 100;
  if (lowerText.startsWith(lowerQuery)) return 80;
  if (lowerText.includes(lowerQuery)) return 60;

  const queryWords = lowerQuery.split(/\s+/).filter(Boolean);
  let matchCount = 0;
  for (const word of queryWords) {
    if (lowerText.includes(word)) matchCount++;
  }
  if (matchCount === queryWords.length) return 50;
  if (matchCount > 0) return 30;
  return 0;
};

export const useGlobalSearch = (query: string, enabled: boolean) => {
  const discoveryLeads = useLeadStore((s) => s.leads);
  const [managedLeads, setManagedLeads] = useState<ManageLead[]>([]);
  const [binLeads, setBinLeads] = useState<ManageLead[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const fetchedRef = useRef(false);

  const fetchDeals = useCallback(async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setLoadingDeals(true);
    try {
      const [activePage, binPage] = await Promise.all([
        leadService.listManageLeadsPage({ page_size: 40 }),
        leadService.listManageLeadBinPage({ page_size: 20 }),
      ]);
      setManagedLeads(activePage.items);
      setBinLeads(binPage.items);
    } catch {
      // silently fail; deals search will be empty
    } finally {
      setLoadingDeals(false);
    }
  }, []);

  useEffect(() => {
    if (enabled && !fetchedRef.current) {
      void fetchDeals();
    }
  }, [enabled, fetchDeals]);

  const reset = useCallback(() => {
    fetchedRef.current = false;
    setManagedLeads([]);
    setBinLeads([]);
  }, []);

  const results = useMemo((): SearchResultGroup[] => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const groups: SearchResultGroup[] = [];

    // Leads (discovery)
    const leadResults: SearchResult[] = [];
    for (const lead of discoveryLeads) {
      const text = `${lead.title ?? ""} ${lead.company ?? ""} ${lead.content ?? ""} ${lead.author ?? ""} ${lead.tags?.join(" ") ?? ""}`;
      const score = scoreMatch(text, q);
      if (score > 0) {
        leadResults.push({
          id: `lead-${lead.id}`,
          category: "leads",
          title: lead.title || lead.company || "Untitled lead",
          subtitle: `${lead.company ?? lead.author ?? "Unknown"} • Score ${lead.score}`,
          path: "/leads-discovery",
          icon: "target",
          meta: { lead, score },
        });
      }
    }
    leadResults.sort((a, b) => (b.meta?.score as number) - (a.meta?.score as number));
    if (leadResults.length) {
      groups.push({ category: "leads", label: "Leads", items: leadResults.slice(0, 5) });
    }

    // Active managed leads → route by stage
    const crmResults: SearchResult[] = [];
    const manageResults: SearchResult[] = [];
    for (const lead of managedLeads) {
      const text = `${lead.name} ${lead.company} ${lead.email ?? ""} ${lead.category ?? ""} ${lead.stage}`;
      const score = scoreMatch(text, q);
      if (score > 0) {
        const isCrm = CRM_STAGES.includes(lead.stage as any);
        const result: SearchResult = {
          id: `deal-${lead.id}`,
          category: "deals",
          title: lead.name || lead.company || "Untitled deal",
          subtitle: `${lead.company ?? ""} • ${lead.stage.replace(/_/g, " ").toLowerCase()} • $${lead.budget_estimate.toLocaleString()}`,
          path: isCrm ? "/crm" : "/manage-leads",
          icon: isCrm ? "zap" : "layers",
          meta: { lead, score, isCrm },
        };
        if (isCrm) crmResults.push(result);
        else manageResults.push(result);
      }
    }
    crmResults.sort((a, b) => (b.meta?.score as number) - (a.meta?.score as number));
    manageResults.sort((a, b) => (b.meta?.score as number) - (a.meta?.score as number));
    if (crmResults.length) {
      groups.push({ category: "deals", label: "Deals", items: crmResults.slice(0, 5) });
    }
    if (manageResults.length) {
      groups.push({ category: "deals", label: "Pipeline", items: manageResults.slice(0, 5) });
    }

    // Recycle bin leads
    const recycleResults: SearchResult[] = [];
    for (const lead of binLeads) {
      const text = `${lead.name} ${lead.company} ${lead.email ?? ""} ${lead.category ?? ""} ${lead.stage}`;
      const score = scoreMatch(text, q);
      if (score > 0) {
        recycleResults.push({
          id: `recycle-${lead.id}`,
          category: "recycle",
          title: lead.name || lead.company || "Untitled lead",
          subtitle: `${lead.company ?? ""} • ${lead.stage.replace(/_/g, " ").toLowerCase()} • Recycle bin`,
          path: "/recycle-bin",
          icon: "trash2",
          meta: { lead, score },
        });
      }
    }
    recycleResults.sort((a, b) => (b.meta?.score as number) - (a.meta?.score as number));
    if (recycleResults.length) {
      groups.push({ category: "recycle", label: "Recycle Bin", items: recycleResults.slice(0, 5) });
    }

    // Features (navigation)
    const featureResults: SearchResult[] = [];
    for (const item of navigationItems) {
      const score = scoreMatch(`${item.label} ${item.path}`, q);
      if (score > 0) {
        featureResults.push({
          id: `feat-${item.path}`,
          category: "features",
          title: item.label,
          subtitle: `Navigate to ${item.label}`,
          path: item.path,
          icon: item.label.toLowerCase().replace(/\s+/g, "-"),
          meta: { score },
        });
      }
    }
    featureResults.sort((a, b) => (b.meta?.score as number) - (a.meta?.score as number));
    if (featureResults.length) {
      groups.push({ category: "features", label: "Features", items: featureResults.slice(0, 5) });
    }

    // Settings tabs
    const settingResults: SearchResult[] = [];
    for (const tab of SETTINGS_TABS) {
      const score = scoreMatch(`${tab.label} ${tab.description} ${tab.key}`, q);
      if (score > 0) {
        settingResults.push({
          id: `set-${tab.key}`,
          category: "settings",
          title: tab.label,
          subtitle: tab.description,
          path: `/settings?tab=${tab.key}`,
          icon: tab.key,
          meta: { score },
        });
      }
    }
    settingResults.sort((a, b) => (b.meta?.score as number) - (a.meta?.score as number));
    if (settingResults.length) {
      groups.push({ category: "settings", label: "Settings", items: settingResults.slice(0, 5) });
    }

    // Order groups by importance
    const order: SearchCategory[] = ["features", "leads", "deals", "settings", "recycle"];
    groups.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));

    return groups;
  }, [query, discoveryLeads, managedLeads, binLeads]);

  return { results, loadingDeals, reset };
};
