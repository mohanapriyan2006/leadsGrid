type SettingsDeleteAccountModalProps = {
  open: boolean;
  step: 1 | 2 | 3;
  confirmEmail: string;
  authPassword: string;
  isGoogleUser: boolean;
  userEmail: string;
  deleting: boolean;
  deleteError: string | null;
  onConfirmEmailChange: (value: string) => void;
  onAuthPasswordChange: (value: string) => void;
  onCancel: () => void;
  onStepOneDecision: (confirmed: boolean) => void;
  onStepTwoConfirm: () => void;
  onFinalDelete: () => void;
};

export const SettingsDeleteAccountModal = ({
  open,
  step,
  confirmEmail,
  authPassword,
  isGoogleUser,
  userEmail,
  deleting,
  deleteError,
  onConfirmEmailChange,
  onAuthPasswordChange,
  onCancel,
  onStepOneDecision,
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
              <h3 className="text-lg font-semibold text-content">Delete Account?</h3>
            </div>
            <p className="mb-4 text-sm text-content-secondary">
              Are you sure you want to delete your account? This removes all leads, messages, and settings permanently.
            </p>
            {deleteError ? <p className="mb-4 text-sm ">{deleteError}</p> : null}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onStepOneDecision(false)}
                className="glass-btn flex-1 py-2 text-sm"
              >
                No, Keep Account
              </button>
              <button
                type="button"
                onClick={() => onStepOneDecision(true)}
                className="rounded-glass-sm flex-1 border border-danger/30 bg-danger-soft py-2 text-sm font-semibold  disabled:opacity-50"
              >
                Yes, Continue
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
              <h3 className="text-lg font-semibold text-content">Confirm Your Email</h3>
            </div>
            <p className="mb-4 text-sm text-content-secondary">
              Enter your account email address to continue deletion.
            </p>
            <input
              type="email"
              value={confirmEmail}
              onChange={(event) => onConfirmEmailChange(event.target.value)}
              placeholder="your@email.com"
              className="glass-input mb-4 w-full"
            />
            {deleteError ? <p className="mb-4 text-sm ">{deleteError}</p> : null}
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
              <h3 className="text-lg font-semibold text-content">Authorize Deletion</h3>
            </div>
            <p className="mb-4 text-sm text-content-secondary">
              Re-login with Firebase to authorize deletion.
            </p>
            <div className="mb-4 rounded-glass-sm border border-danger/20 bg-danger/5 p-3">
              <p className="text-xs text-content-secondary">Account to delete:</p>
              <p className="text-sm font-medium text-content">{userEmail || "Unknown"}</p>
            </div>
            {!isGoogleUser ? (
              <input
                type="password"
                value={authPassword}
                onChange={(event) => onAuthPasswordChange(event.target.value)}
                placeholder="Enter your password"
                className="glass-input mb-4 w-full"
              />
            ) : (
              <p className="mb-4 text-xs text-content-secondary">
                Your account uses Google sign-in. Continue to re-authenticate with your Google account.
              </p>
            )}
            {deleteError ? <p className="mb-4 text-sm ">{deleteError}</p> : null}
            <div className="flex gap-3">
              <button type="button" onClick={onCancel} className="glass-btn flex-1 py-2 text-sm">Cancel</button>
              <button
                type="button"
                onClick={onFinalDelete}
                disabled={deleting || (!isGoogleUser && !authPassword.trim())}
                className="rounded-glass-sm flex-1 border border-danger/30 bg-danger-soft py-2 text-sm font-semibold text-danger disabled:opacity-50"
              >
                {deleting ? "Deleting..." : isGoogleUser ? "Re-login with Google & Delete" : "Re-login & Delete"}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
