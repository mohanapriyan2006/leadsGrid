import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import type { ManageLead, BinLead } from "../types/manageLead";
import { type ManageLeadsCursor, leadService } from "../services/leadService";

type CentralizedLeadsMode = "active" | "bin" | "both";

type UseCentralizedLeadsOptions = {
  mode?: CentralizedLeadsMode;
  pageSize?: number;
  binPageSize?: number;
};

const DEFAULT_ACTIVE_PAGE_SIZE = 100;
const DEFAULT_BIN_PAGE_SIZE = 60;

const mergeById = (current: ManageLead[], incoming: ManageLead[]) => {
  const map = new Map<string, ManageLead>();
  current.forEach((lead) => map.set(lead.id, lead));
  incoming.forEach((lead) => map.set(lead.id, lead));
  return [...map.values()].sort(
    (a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime(),
  );
};

export const useCentralizedLeads = (options?: UseCentralizedLeadsOptions) => {
  const { user } = useAuth();
  const mode = options?.mode ?? "active";
  const activePageSize = options?.pageSize ?? DEFAULT_ACTIVE_PAGE_SIZE;
  const binPageSize = options?.binPageSize ?? DEFAULT_BIN_PAGE_SIZE;
  const [activeLeads, setActiveLeads] = useState<ManageLead[]>([]);
  const [deletedLeads, setDeletedLeads] = useState<ManageLead[]>([]);
  const [activeCursor, setActiveCursor] = useState<ManageLeadsCursor>(null);
  const [deletedCursor, setDeletedCursor] = useState<ManageLeadsCursor>(null);
  const [hasMoreLeads, setHasMoreLeads] = useState(false);
  const [hasMoreBinLeads, setHasMoreBinLeads] = useState(false);
  const [loadingMoreLeads, setLoadingMoreLeads] = useState(false);
  const [loadingMoreBinLeads, setLoadingMoreBinLeads] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const includesActive = mode === "active" || mode === "both";
  const includesBin = mode === "bin" || mode === "both";

  const fetchInitial = useCallback(async () => {
    if (!user) {
      setActiveLeads([]);
      setDeletedLeads([]);
      setActiveCursor(null);
      setDeletedCursor(null);
      setHasMoreLeads(false);
      setHasMoreBinLeads(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (includesActive) {
        const activePage = await leadService.listManageLeadsPage({
          page_size: activePageSize,
        });
        setActiveLeads(activePage.items);
        setActiveCursor(activePage.nextCursor);
        setHasMoreLeads(activePage.hasMore);
      } else {
        setActiveLeads([]);
        setActiveCursor(null);
        setHasMoreLeads(false);
      }

      if (includesBin) {
        const binPage = await leadService.listManageLeadBinPage({
          page_size: binPageSize,
        });
        setDeletedLeads(binPage.items);
        setDeletedCursor(binPage.nextCursor);
        setHasMoreBinLeads(binPage.hasMore);
      } else {
        setDeletedLeads([]);
        setDeletedCursor(null);
        setHasMoreBinLeads(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load leads"));
    } finally {
      setLoading(false);
    }
  }, [activePageSize, binPageSize, includesActive, includesBin, user]);

  const loadMoreLeads = useCallback(async () => {
    if (!includesActive || !hasMoreLeads || !activeCursor || loadingMoreLeads) {
      return;
    }

    setLoadingMoreLeads(true);
    try {
      const page = await leadService.listManageLeadsPage({
        page_size: activePageSize,
        cursor: activeCursor,
      });
      setActiveLeads((current) => mergeById(current, page.items));
      setActiveCursor(page.nextCursor);
      setHasMoreLeads(page.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load more leads"));
    } finally {
      setLoadingMoreLeads(false);
    }
  }, [activeCursor, activePageSize, hasMoreLeads, includesActive, loadingMoreLeads]);

  const loadMoreBinLeads = useCallback(async () => {
    if (!includesBin || !hasMoreBinLeads || !deletedCursor || loadingMoreBinLeads) {
      return;
    }

    setLoadingMoreBinLeads(true);
    try {
      const page = await leadService.listManageLeadBinPage({
        page_size: binPageSize,
        cursor: deletedCursor,
      });
      setDeletedLeads((current) => mergeById(current, page.items));
      setDeletedCursor(page.nextCursor);
      setHasMoreBinLeads(page.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load more bin leads"));
    } finally {
      setLoadingMoreBinLeads(false);
    }
  }, [binPageSize, deletedCursor, hasMoreBinLeads, includesBin, loadingMoreBinLeads]);

  useEffect(() => {
    void fetchInitial();
  }, [fetchInitial]);

  // Computed values
  const leads = useMemo(() => activeLeads, [activeLeads]);
  
  const binLeads = useMemo((): BinLead[] => 
    deletedLeads
      .map(lead => ({
        id: lead.id,
        name: lead.name,
        company: lead.company,
        email: lead.email,
        deleted_at: lead.deleted_at ?? lead.updated_at,
      })),
    [deletedLeads]
  );

  const negotiationLeads = useMemo(() => 
    leads.filter(lead => lead.stage === "NEGOTIATION"),
    [leads]
  );

  const getLeadById = (id: string): ManageLead | undefined => {
    return [...activeLeads, ...deletedLeads].find((lead) => lead.id === id);
  };

  const getLeadsByStage = (stage: string): ManageLead[] => {
    return leads.filter(lead => lead.stage === stage);
  };

  const refresh = async () => {
    await fetchInitial();
  };

  return {
    leads,              // Active leads only
    binLeads,           // Deleted leads
    negotiationLeads,   // Leads in NEGOTIATION stage
    loading,
    loadingMoreLeads,
    loadingMoreBinLeads,
    hasMoreLeads,
    hasMoreBinLeads,
    error,
    refresh,
    loadMoreLeads,
    loadMoreBinLeads,
    getLeadById,
    getLeadsByStage,
  };
};
