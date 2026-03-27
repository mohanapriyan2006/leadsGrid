import { useEffect, useState } from "react";

import { leadService } from "../../features/leads/services/leadService";
import type { BinLead } from "../../features/leads/types/manageLead";

export const ManageLeadsBinPage = () => {
  const [binLeads, setBinLeads] = useState<BinLead[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBin = async () => {
    const rows = await leadService.listManageLeadBin();
    setBinLeads(rows);
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await loadBin();
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  const handleRestore = async (leadId: string) => {
    await leadService.restoreManageLead(leadId);
    await loadBin();
  };

  const handleDeleteForever = async (leadId: string) => {
    await leadService.deleteManageLeadForever(leadId);
    await loadBin();
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/30 p-8 text-sm text-text-dim">
        Loading bin...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-white/10 bg-black/35 p-4">
        <h2 className="text-3xl font-semibold text-white">Manage Leads Bin</h2>
        <p className="text-sm text-text-dim">Restore soft deleted leads or delete permanently.</p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
        <div className="grid grid-cols-[1.5fr_1.5fr_1fr_220px] border-b border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-text-dim">
          <span>Name</span>
          <span>Company</span>
          <span>Deleted time</span>
          <span>Actions</span>
        </div>

        {binLeads.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-text-dim">Bin is empty.</div>
        ) : (
          binLeads.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[1.5fr_1.5fr_1fr_220px] items-center border-b border-white/5 px-4 py-3 text-sm"
            >
              <span className="text-white">{row.name}</span>
              <span className="text-text-dim">{row.company}</span>
              <span className="text-text-dim">{new Date(row.deleted_at).toLocaleString()}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => void handleRestore(row.id)}
                  className="rounded-lg border border-emerald-300/30 bg-emerald-500/15 px-2 py-1 text-xs text-emerald-100"
                >
                  Restore
                </button>
                <button
                  onClick={() => void handleDeleteForever(row.id)}
                  className="rounded-lg border border-rose-300/30 bg-rose-500/15 px-2 py-1 text-xs text-rose-100"
                >
                  Delete forever
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
