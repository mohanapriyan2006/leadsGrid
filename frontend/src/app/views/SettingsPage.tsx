import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ResponsivePageLayout } from "../../components/ui/ResponsivePageLayout";
import bgDataAtWork from "../../assets/bg-images/data-at-work.svg";
import { useAuth } from "../../features/auth/AuthContext";
import { getFirebaseAuth } from "../../lib/firebase";
import { signInWithEmailAndPassword, deleteUser, type User } from "firebase/auth";

import { SETTINGS_DEFAULTS } from "../../features/settings/constants/settingsDefaults";
import {
  AI_ENGINE_ITEMS,
  NOTIFICATION_ITEMS,
  type ToggleSettingKey,
} from "../../features/settings/constants/settingsOptions";
import { SettingsIntervalSection } from "../../features/settings/components/SettingsIntervalSection";
import { SettingsToggleSection } from "../../features/settings/components/SettingsToggleSection";

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [settings, setSettings] = useState(SETTINGS_DEFAULTS);

  // Logout confirmation modal
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // Delete account triple confirmation states
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2 | 3>(0);
  const [reauthPassword, setReauthPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const toggle = (key: ToggleSettingKey) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  // Step 1: Re-authenticate
  const handleReauth = async () => {
    setDeleteError(null);
    if (!user?.email || !reauthPassword) {
      setDeleteError("Please enter your password");
      return;
    }

    setDeleting(true);
    try {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Auth not available");
      await signInWithEmailAndPassword(auth, user.email, reauthPassword);
      setDeleteStep(2);
    } catch {
      setDeleteError("Incorrect password. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // Step 2: Type confirmation
  const handleConfirmText = () => {
    if (confirmText !== "DELETE") {
      setDeleteError('Please type "DELETE" to confirm');
      return;
    }
    setDeleteError(null);
    setDeleteStep(3);
  };

  // Step 3: Final confirmation - delete account
  const handleFinalDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteUser(user as User);
      navigate("/");
    } catch (err) {
      setDeleteError("Failed to delete account. Please try again.");
      setDeleting(false);
    }
  };

  const resetDeleteFlow = () => {
    setDeleteStep(0);
    setReauthPassword("");
    setConfirmText("");
    setDeleteError(null);
    setDeleting(false);
  };

  const openDeleteFlow = () => {
    setDeleteStep(1);
  };

  return (
    <ResponsivePageLayout
      backgroundImage={bgDataAtWork}
      tint="rgba(236, 254, 72, 0.51)"
      contentClassName="space-y-4"
    >
        <header className="glass-card p-5">
          <h2 className="bg-gradient-to-r from-content via-accent to-accent-secondary bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl">System Configuration</h2>
          <p className="mt-1 text-sm text-content-secondary">Configure outreach engine behavior and signal cadence.</p>
        </header>

        {/* User Profile Section */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-sm font-semibold tracking-[0.1em] text-content-tertiary uppercase">User Profile</h3>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="h-14 w-14 rounded-full bg-accent/20 flex items-center justify-center text-xl font-bold text-accent">
              {user?.email?.[0].toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-sm font-medium text-content">{user?.email || "Not signed in"}</p>
              <p className="text-xs text-content-secondary">Account created: {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => setLogoutConfirmOpen(true)}
              className="rounded-lg border border-accent/20 px-4 py-2 text-sm text-content-secondary transition hover:border-accent/40 hover:text-content"
            >
              Log Out
            </button>
            <button
              type="button"
              onClick={openDeleteFlow}
              className="rounded-lg border border-danger/30 px-4 py-2 text-sm text-danger transition hover:bg-danger/10"
            >
              Delete Account
            </button>
          </div>
        </div>

        <SettingsToggleSection
          title="NOTIFICATIONS"
          items={NOTIFICATION_ITEMS}
          values={settings}
          onToggle={toggle}
        />

        <SettingsToggleSection
          title="AI ENGINE"
          items={AI_ENGINE_ITEMS}
          values={settings}
          onToggle={toggle}
        />

        <SettingsIntervalSection
          value={settings.refreshInterval}
          onChange={(value) => {
            setSettings((current) => ({ ...current, refreshInterval: value }));
          }}
        />

        <button className="accent-btn w-full py-3 text-xs font-bold tracking-[0.1em]">SAVE CONFIGURATION</button>

        {/* Logout Confirmation Modal */}
        {logoutConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-accent/20 bg-surface-secondary p-5 sm:p-6 shadow-[0_18px_60px_rgba(0,0,0,0.4)]">
              <h3 className="mb-2 text-lg font-semibold text-content">Log Out?</h3>
              <p className="mb-6 text-sm text-content-secondary">Are you sure you want to log out of your account?</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setLogoutConfirmOpen(false)}
                  className="flex-1 rounded-lg border border-accent/20 px-4 py-2 text-sm text-content-secondary transition hover:border-accent/40 hover:text-content"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-content-inverse transition hover:bg-accent-secondary"
                >
                  Yes, Log Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Triple Confirmation Modal */}
        {deleteStep > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/90 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-danger/30 bg-surface-secondary p-5 sm:p-6 shadow-[0_18px_60px_rgba(239,68,68,0.4)]">
              {/* Step 1: Re-authenticate */}
              {deleteStep === 1 && (
                <>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/20">
                      <span className="text-sm font-bold text-danger">1/3</span>
                    </div>
                    <h3 className="text-lg font-semibold text-content">Re-authenticate</h3>
                  </div>
                  <p className="mb-4 text-sm text-content-secondary">
                    For security, please enter your password to continue with account deletion.
                  </p>
                  <input
                    type="password"
                    value={reauthPassword}
                    onChange={(e) => setReauthPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="glass-input mb-4 w-full"
                  />
                  {deleteError && <p className="mb-4 text-sm text-danger">{deleteError}</p>}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={resetDeleteFlow}
                      className="flex-1 rounded-lg border border-accent/20 px-4 py-2 text-sm text-content-secondary transition hover:border-accent/40 hover:text-content"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleReauth}
                      disabled={deleting}
                      className="flex-1 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:bg-danger/80 disabled:opacity-60"
                    >
                      {deleting ? "Verifying..." : "Continue"}
                    </button>
                  </div>
                </>
              )}

              {/* Step 2: Type DELETE */}
              {deleteStep === 2 && (
                <>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/20">
                      <span className="text-sm font-bold text-danger">2/3</span>
                    </div>
                    <h3 className="text-lg font-semibold text-content">Type to Confirm</h3>
                  </div>
                  <p className="mb-4 text-sm text-content-secondary">
                    This action is permanent. Type <strong className="text-danger">DELETE</strong> below to confirm.
                  </p>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type DELETE here"
                    className="glass-input mb-4 w-full"
                  />
                  {deleteError && <p className="mb-4 text-sm text-danger">{deleteError}</p>}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={resetDeleteFlow}
                      className="flex-1 rounded-lg border border-accent/20 px-4 py-2 text-sm text-content-secondary transition hover:border-accent/40 hover:text-content"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmText}
                      className="flex-1 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:bg-danger/80"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {/* Step 3: Final confirmation */}
              {deleteStep === 3 && (
                <>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/20">
                      <span className="text-sm font-bold text-danger">3/3</span>
                    </div>
                    <h3 className="text-lg font-semibold text-content">Final Confirmation</h3>
                  </div>
                  <p className="mb-4 text-sm text-content-secondary">
                    <strong className="text-danger">Warning:</strong> All your data will be permanently deleted. This cannot be undone.
                  </p>
                  <div className="mb-4 rounded-lg border border-danger/20 bg-danger/5 p-3">
                    <p className="text-xs text-content-secondary">Account to delete:</p>
                    <p className="text-sm font-medium text-content">{user?.email}</p>
                  </div>
                  {deleteError && <p className="mb-4 text-sm text-danger">{deleteError}</p>}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={resetDeleteFlow}
                      className="flex-1 rounded-lg border border-accent/20 px-4 py-2 text-sm text-content-secondary transition hover:border-accent/40 hover:text-content"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleFinalDelete}
                      disabled={deleting}
                      className="flex-1 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:bg-danger/80 disabled:opacity-60"
                    >
                      {deleting ? "Deleting..." : "Permanently Delete Account"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
    </ResponsivePageLayout>
  );
};
