import { Trash2, AlertTriangle } from "lucide-react";

type DeleteConfirmModalProps = {
  open: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export const DeleteConfirmModal = ({
  open,
  title,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface/70 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm rounded-2xl border border-danger/20 bg-surface-secondary p-5 shadow-[0_16px_64px_rgba(0,0,0,0.45)]">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/[0.08]">
            <AlertTriangle className="h-5 w-5 text-danger/80" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-content">Delete Chat?</h3>
            <p className="text-[11px] text-content-secondary">This cannot be undone.</p>
          </div>
        </div>

        <div className="mb-5 rounded-xl border border-accent/[0.06] bg-surface/40 px-3.5 py-3">
          <p className="line-clamp-2 text-sm font-medium text-content">{title}</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-accent/[0.1] bg-surface/50 px-4 py-2.5 text-[13px] font-medium text-content-secondary transition-all hover:border-accent/20 hover:text-content"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-danger/90 px-4 py-2.5 text-[13px] font-semibold text-surface transition-all hover:bg-danger"
          >
            <span className="flex items-center justify-center gap-1.5">
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
