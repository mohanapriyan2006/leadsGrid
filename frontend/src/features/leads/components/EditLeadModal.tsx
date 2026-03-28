import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import type { ManageLead, ManageLeadStage } from "../types/manageLead";

type EditLeadModalProps = {
  lead: ManageLead | null;
  open: boolean;
  onClose: () => void;
  onSave: (payload: {
    name: string;
    company: string;
    email: string;
    phone: string;
    stage: ManageLeadStage;
    budget_estimate: number;
    notes: string;
  }) => void;
};

const STAGES: ManageLeadStage[] = ["NEW", "QUALIFIED", "CONTACTED", "RESPONDED", "NEGOTIATION"];

export const EditLeadModal = ({ lead, open, onClose, onSave }: EditLeadModalProps) => {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    stage: "NEW" as ManageLeadStage,
    budget_estimate: 0,
    notes: "",
  });

  useEffect(() => {
    if (!lead || !open) return;
    setForm({
      name: lead.name,
      company: lead.company,
      email: lead.email ?? "",
      phone: lead.phone ?? "",
      stage: lead.stage,
      budget_estimate: lead.budget_estimate,
      notes: lead.notes ?? "",
    });
  }, [lead, open]);

  return (
    <AnimatePresence>
      {open && lead ? (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/65 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.form
            className="w-full max-w-xl space-y-3 rounded-2xl border border-white/10 bg-slate-950/95 p-5"
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.985 }}
            transition={{ duration: 0.16 }}
            onSubmit={(event) => {
              event.preventDefault();
              onSave(form);
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white">Edit Lead</h3>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-xs text-text-dim">
                Name
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="text-xs text-text-dim">
                Company
                <input
                  value={form.company}
                  onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="text-xs text-text-dim">
                Email
                <input
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="text-xs text-text-dim">
                Phone
                <input
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="text-xs text-text-dim">
                Stage
                <select
                  value={form.stage}
                  onChange={(event) => setForm((prev) => ({ ...prev, stage: event.target.value as ManageLeadStage }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm text-white"
                >
                  {STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-text-dim">
                Budget
                <input
                  type="number"
                  value={form.budget_estimate}
                  onChange={(event) => setForm((prev) => ({ ...prev, budget_estimate: Number(event.target.value) || 0 }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm text-white"
                />
              </label>
            </div>

            <label className="block text-xs text-text-dim">
              Notes
              <textarea
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                rows={3}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm text-white"
              />
            </label>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                className="rounded-lg border border-white/15 bg-black/35 px-3 py-1.5 text-xs text-text-dim"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950">
                Update Lead
              </button>
            </div>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
