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
    // CSV fields
    category: string | null;
    rating: number | null;
    review_count: number | null;
    address: string | null;
    website_url: string | null;
    open_now: boolean | null;
    google_maps_url: string | null;
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
    // CSV fields
    category: null as string | null,
    rating: null as number | null,
    review_count: null as number | null,
    address: null as string | null,
    website_url: null as string | null,
    open_now: null as boolean | null,
    google_maps_url: null as string | null,
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
      // CSV fields
      category: lead.category,
      rating: lead.rating,
      review_count: lead.review_count,
      address: lead.address,
      website_url: lead.website_url,
      open_now: lead.open_now,
      google_maps_url: lead.google_maps_url,
    });
  }, [lead, open]);

  return (
    <AnimatePresence>
      {open && lead ? (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-surface/80 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.form
            className="glass-card-lg overflow-y-auto max-h-[80vh] w-full max-w-xl space-y-3 p-5"
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
            <h3 className="text-lg font-semibold text-content">Edit Lead</h3>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-xs text-content-secondary">
                Name
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="glass-input mt-1"
                />
              </label>
              <label className="text-xs text-content-secondary">
                Company
                <input
                  value={form.company}
                  onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
                  className="glass-input mt-1"
                />
              </label>
              <label className="text-xs text-content-secondary">
                Email
                <input
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="glass-input mt-1"
                />
              </label>
              <label className="text-xs text-content-secondary">
                Phone
                <input
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  className="glass-input mt-1"
                />
              </label>
              <label className="text-xs text-content-secondary">
                Stage
                <select
                  value={form.stage}
                  onChange={(event) => setForm((prev) => ({ ...prev, stage: event.target.value as ManageLeadStage }))}
                  className="glass-input mt-1"
                >
                  {STAGES.map((stage) => (
                    <option key={stage} value={stage} className="bg-surface-tertiary">
                      {stage}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-content-secondary">
                Budget
                <input
                  type="number"
                  value={form.budget_estimate}
                  onChange={(event) => setForm((prev) => ({ ...prev, budget_estimate: Number(event.target.value) || 0 }))}
                  className="glass-input mt-1"
                />
              </label>
              {/* CSV Fields */}
              <label className="text-xs text-content-secondary">
                Category
                <input
                  value={form.category ?? ""}
                  onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value || null }))}
                  className="glass-input mt-1"
                  placeholder="e.g. establishment, restaurant"
                />
              </label>
              <label className="text-xs text-content-secondary">
                Rating
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={form.rating ?? ""}
                  onChange={(event) => {
                    const val = event.target.value;
                    setForm((prev) => ({ ...prev, rating: val ? parseFloat(val) : null }));
                  }}
                  className="glass-input mt-1"
                  placeholder="0-5"
                />
              </label>
              <label className="text-xs text-content-secondary">
                Review Count
                <input
                  type="number"
                  value={form.review_count ?? ""}
                  onChange={(event) => {
                    const val = event.target.value;
                    setForm((prev) => ({ ...prev, review_count: val ? parseInt(val, 10) : null }));
                  }}
                  className="glass-input mt-1"
                />
              </label>
            </div>

            {/* Address & Links */}
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-xs text-content-secondary">
                Address
                <input
                  value={form.address ?? ""}
                  onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value || null }))}
                  className="glass-input mt-1"
                />
              </label>
              <label className="text-xs text-content-secondary">
                Website URL
                <input
                  value={form.website_url ?? ""}
                  onChange={(event) => setForm((prev) => ({ ...prev, website_url: event.target.value || null }))}
                  className="glass-input mt-1"
                  placeholder="https://..."
                />
              </label>
              <label className="text-xs text-content-secondary">
                Google Maps URL
                <input
                  value={form.google_maps_url ?? ""}
                  onChange={(event) => setForm((prev) => ({ ...prev, google_maps_url: event.target.value || null }))}
                  className="glass-input mt-1"
                  placeholder="https://maps.google.com/..."
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-content-secondary mt-4">
                <input
                  type="checkbox"
                  checked={form.open_now ?? false}
                  onChange={(event) => setForm((prev) => ({ ...prev, open_now: event.target.checked }))}
                  className="accent-checkbox"
                />
                Open Now
              </label>
            </div>

            <label className="block text-xs text-content-secondary">
              Notes
              <textarea
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                rows={3}
                className="glass-input mt-1"
              />
            </label>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                className="glass-btn px-3 py-1.5 text-xs"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="accent-btn px-3 py-1.5 text-xs font-semibold">
                Update Lead
              </button>
            </div>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
