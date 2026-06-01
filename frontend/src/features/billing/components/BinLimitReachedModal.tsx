import { useNavigate } from "react-router-dom";
import { X, Trash2, ArrowRight } from "lucide-react";
import type { BinLimitReachedDetail } from "../hooks/useBinLimitModal";

type BinLimitReachedModalProps = {
  open: boolean;
  data: BinLimitReachedDetail | null;
  onClose: () => void;
};

export const BinLimitReachedModal = ({ open, data, onClose }: BinLimitReachedModalProps) => {
  const navigate = useNavigate();

  if (!open || !data) return null;

  const percent = Math.min(100, Math.round((data.current / data.limit) * 100));

  const handleGoToBin = () => {
    onClose();
    navigate("/recycle-bin");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm rounded-2xl border border-warning/20 bg-surface-secondary/95 p-6 shadow-2xl backdrop-blur-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1 text-content-secondary transition hover:text-content"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/15">
            <Trash2 className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-content">Recycle Bin Full</h3>
            <p className="text-xs text-content-secondary">
              You have reached the recycle bin limit.
            </p>
          </div>
        </div>

        <div className="mb-4 space-y-3 rounded-glass-sm border border-accent/10 bg-surface/40 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-content-secondary">Bin Capacity</span>
            <span className="text-sm font-semibold text-content">{data.current.toLocaleString()} / {data.limit.toLocaleString()}</span>
          </div>

          <div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-warning transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

        <p className="mb-4 text-xs text-content-secondary">
          To delete more leads, please permanently remove some leads from your recycle bin first.
        </p>

        <button
          type="button"
          onClick={handleGoToBin}
          className="accent-btn w-full py-2.5 text-xs font-bold uppercase tracking-[0.1em]"
        >
          <ArrowRight className="w-3.5 h-3.5 inline mr-1" /> Go to Recycle Bin
        </button>

        <p className="mt-3 text-center text-[11px] text-content-secondary">
          Free up space by restoring or permanently deleting leads in the recycle bin.
        </p>
      </div>
    </div>
  );
};
