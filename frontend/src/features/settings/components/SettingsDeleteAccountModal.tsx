type SettingsDeleteAccountModalProps = {
  open: boolean;
  step: 1 | 2 | 3;
  reauthPassword: string;
  confirmText: string;
  deleteError: string | null;
  deleting: boolean;
  userEmail: string;
  onPasswordChange: (value: string) => void;
  onConfirmTextChange: (value: string) => void;
  onCancel: () => void;
  onReauth: () => void;
  onStepTwoConfirm: () => void;
  onFinalDelete: () => void;
};

export const SettingsDeleteAccountModal = ({
  open,
  step,
  reauthPassword,
  confirmText,
  deleteError,
  deleting,
  userEmail,
  onPasswordChange,
  onConfirmTextChange,
  onCancel,
  onReauth,
  onStepTwoConfirm,
  onFinalDelete,
}: SettingsDeleteAccountModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-surface/90 p-4 backdrop-blur-sm">
      <div className="glass-card-lg w-full max-w-md border-danger/30 p-5 sm:p-6">
        {step === 1 ? (
          <>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-soft">
                <span className="text-sm font-bold text-danger">1/3</span>
              </div>
              <h3 className="text-lg font-semibold text-content">Re-authenticate</h3>
            </div>
            <p className="mb-4 text-sm text-content-secondary">For security, enter your password to continue account deletion.</p>
            <input
              type="password"
              value={reauthPassword}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="Enter your password"
              className="glass-input mb-4 w-full"
            />
            {deleteError ? <p className="mb-4 text-sm text-danger">{deleteError}</p> : null}
            <div className="flex gap-3">
              <button type="button" onClick={onCancel} className="glass-btn flex-1 py-2 text-sm">Cancel</button>
              <button
                type="button"
                onClick={onReauth}
                disabled={deleting}
                className="rounded-glass-sm flex-1 border border-danger/30 bg-danger-soft py-2 text-sm font-semibold text-danger disabled:opacity-50"
              >
                {deleting ? "Verifying..." : "Continue"}
              </button>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-soft">
                <span className="text-sm font-bold text-danger">2/3</span>
              </div>
              <h3 className="text-lg font-semibold text-content">Type to Confirm</h3>
            </div>
            <p className="mb-4 text-sm text-content-secondary">
              This action is permanent. Type <strong className="text-danger">DELETE</strong> to continue.
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(event) => onConfirmTextChange(event.target.value)}
              placeholder="Type DELETE here"
              className="glass-input mb-4 w-full"
            />
            {deleteError ? <p className="mb-4 text-sm text-danger">{deleteError}</p> : null}
            <div className="flex gap-3">
              <button type="button" onClick={onCancel} className="glass-btn flex-1 py-2 text-sm">Cancel</button>
              <button
                type="button"
                onClick={onStepTwoConfirm}
                className="rounded-glass-sm flex-1 border border-danger/30 bg-danger-soft py-2 text-sm font-semibold text-danger"
              >
                Continue
              </button>
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-soft">
                <span className="text-sm font-bold text-danger">3/3</span>
              </div>
              <h3 className="text-lg font-semibold text-content">Final Confirmation</h3>
            </div>
            <p className="mb-4 text-sm text-content-secondary">
              <strong className="text-danger">Warning:</strong> All account data will be permanently removed.
            </p>
            <div className="mb-4 rounded-glass-sm border border-danger/20 bg-danger/5 p-3">
              <p className="text-xs text-content-secondary">Account to delete:</p>
              <p className="text-sm font-medium text-content">{userEmail || "Unknown"}</p>
            </div>
            {deleteError ? <p className="mb-4 text-sm text-danger">{deleteError}</p> : null}
            <div className="flex gap-3">
              <button type="button" onClick={onCancel} className="glass-btn flex-1 py-2 text-sm">Cancel</button>
              <button
                type="button"
                onClick={onFinalDelete}
                disabled={deleting}
                className="rounded-glass-sm flex-1 border border-danger/30 bg-danger-soft py-2 text-sm font-semibold text-danger disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
