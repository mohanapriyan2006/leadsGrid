import { AnimatePresence, motion } from "framer-motion";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-surface/80 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="glass-card-lg w-full max-w-md p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-content">{title}</h3>
            <p className="mt-2 text-sm text-content-secondary">{description}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="glass-btn px-3 py-1.5 text-xs"
                onClick={onCancel}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className={`rounded-glass-sm px-3 py-1.5 text-xs font-semibold transition ${
                  danger
                    ? "border border-danger/30 bg-danger-soft hover:shadow-[0_0_16px_rgba(239,68,68,0.3)]"
                    : "accent-btn"
                }`}
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
