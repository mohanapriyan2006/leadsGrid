import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { PageBackground } from "../../components/ui/PageBackground";
import { ResponsivePageLayout } from "../../components/ui/ResponsivePageLayout";
import bgDataAtWork from "../../assets/bg-images/data-at-work.svg";
import { useAuth } from "../../features/auth/AuthContext";
import { getFirebaseAuth, googleProvider } from "../../lib/firebase";
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  type User,
} from "firebase/auth";
import { LogOut } from "lucide-react";
import { leadService } from "../../features/leads/services/leadService";
import { SETTINGS_TABS } from "../../features/settings/constants/settingsOptions";
import { useSettingsState } from "../../features/settings/hooks/useSettingsState";
import { SettingsDeleteAccountModal } from "../../features/settings/components/SettingsDeleteAccountModal";
import { SettingsLogoutModal } from "../../features/settings/components/SettingsLogoutModal";
import { SettingsTabNav } from "../../features/settings/components/SettingsTabNav";
import { AISettingsSection } from "../../features/settings/components/sections/AISettingsSection";
import { BillingSettingsSection } from "../../features/settings/components/sections/BillingSettingsSection";
import { IntegrationsSettingsSection } from "../../features/settings/components/sections/IntegrationsSettingsSection";
import { LeadsScoringSettingsSection } from "../../features/settings/components/sections/LeadsScoringSettingsSection";
import { MessagingSettingsSection } from "../../features/settings/components/sections/MessagingSettingsSection";
import { NotificationsSettingsSection } from "../../features/settings/components/sections/NotificationsSettingsSection";
import { PrivacyDataSettingsSection } from "../../features/settings/components/sections/PrivacyDataSettingsSection";
import { ProfileSettingsSection } from "../../features/settings/components/sections/ProfileSettingsSection";
import { WorkspaceSettingsSection } from "../../features/settings/components/sections/WorkspaceSettingsSection";
import type { SettingsTabKey } from "../../features/settings/types/settings";

export const SettingsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTabKey>("profile");

  useEffect(() => {
    const tab = searchParams.get("tab");
    const validTabs: SettingsTabKey[] = SETTINGS_TABS.map((t) => t.key);
    if (tab && validTabs.includes(tab as SettingsTabKey)) {
      setActiveTab(tab as SettingsTabKey);
    }
  }, [searchParams]);
  const {
    settings,
    loading,
    saving,
    saveError,
    saveMessage,
    isDirty,
    updateSettings,
    saveSettings,
  } = useSettingsState(user?.email);

  // Logout confirmation modal
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // Delete account triple confirmation states
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2 | 3>(0);
  const [authPassword, setAuthPassword] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const isGoogleUser = Boolean(user?.providerData?.some((provider) => provider.providerId === "google.com"));

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleDeleteStepOneDecision = (confirmed: boolean) => {
    if (!confirmed) {
      resetDeleteFlow();
      return;
    }
    setDeleteError(null);
    setDeleteStep(2);
  };

  // Step 2: Confirm email
  const handleStepTwoConfirm = () => {
    setDeleteError(null);
    if (!user?.email) {
      setDeleteError("Account email not found. Please sign in again.");
      return;
    }
    if (!confirmEmail.trim()) {
      setDeleteError("Please enter your email to continue.");
      return;
    }
    if (confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
      setDeleteError("Entered email does not match your account email.");
      return;
    }
    setDeleteStep(3);
  };

  // Step 3: Firebase re-auth and delete
  const handleFinalDelete = async () => {
    if (!user) return;
    setDeleteError(null);
    setDeleting(true);

    try {
      const auth = getFirebaseAuth();
      const currentUser = auth?.currentUser;
      if (!auth || !currentUser || !user.email) {
        throw new Error("Unable to verify your authentication session.");
      }

      if (isGoogleUser) {
        await reauthenticateWithPopup(currentUser, googleProvider);
      } else {
        if (!authPassword.trim()) {
          setDeleteError("Please enter your password to re-login and continue.");
          setDeleting(false);
          return;
        }

        const credential = EmailAuthProvider.credential(user.email, authPassword);
        await reauthenticateWithCredential(currentUser, credential);
      }

      await deleteUser(currentUser as User);
      navigate("/");
    } catch {
      setDeleteError("Re-authentication failed or deletion was cancelled. Please try again.");
      setDeleting(false);
    }
  };

  const resetDeleteFlow = () => {
    setDeleteStep(0);
    setAuthPassword("");
    setConfirmEmail("");
    setDeleteError(null);
    setDeleting(false);
  };

  const openDeleteFlow = () => {
    resetDeleteFlow();
    setDeleteStep(1);
  };

  const handleExportLeads = async () => {
    try {
      const leads = await leadService.listAllManageLeads({ page_size: 200 });
      const headers = ["Name", "Company", "Email", "Phone", "Stage", "Score"];
      const escapeCsv = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
      const rows = leads.map((lead) => [lead.name, lead.company, lead.email, lead.phone, lead.stage, lead.score]);
      const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `leadsgrid-export-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      // Keep silent here: the global save/error status communicates page-level failures.
    }
  };

  const optimizationScore = useMemo(() => {
    const checks = [
      Boolean(settings.profile.name.trim()),
      Boolean(settings.profile.skills.length > 0),
      settings.integrations.gmail === "connected" || settings.integrations.outlook === "connected",
      settings.ai.personalization !== "low",
      Boolean(settings.messaging.primaryEmail),
      settings.privacy.complianceConsent,
    ];
    const met = checks.filter(Boolean).length;
    return Math.round((met / checks.length) * 100);
  }, [settings]);

  const activeTabConfig = SETTINGS_TABS.find((tab) => tab.key === activeTab);

  const renderActiveSection = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ProfileSettingsSection
            profile={settings.profile}
            onChange={(profile) => updateSettings((current) => ({ ...current, profile }))}
          />
        );
      case "workspace":
        return (
          <WorkspaceSettingsSection
            workspace={settings.workspace}
            onChange={(workspace) => updateSettings((current) => ({ ...current, workspace }))}
          />
        );
      // case "leads-scoring":
      //   return (
      //     <LeadsScoringSettingsSection
      //       leadsScoring={settings.leadsScoring}
      //       onChange={(leadsScoring) => updateSettings((current) => ({ ...current, leadsScoring }))}
      //     />
      //   );
      case "messaging":
        return (
          <MessagingSettingsSection
            messaging={settings.messaging}
            userEmail={user?.email ?? undefined}
            onChange={(messaging) => updateSettings((current) => ({ ...current, messaging }))}
          />
        );
      case "integrations":
        return (
          <IntegrationsSettingsSection
            integrations={settings.integrations}
            onChange={(integrations) => updateSettings((current) => ({ ...current, integrations }))}
          />
        );
      // case "ai-settings":
      //   return (
      //     <AISettingsSection
      //       ai={settings.ai}
      //       onChange={(ai) => updateSettings((current) => ({ ...current, ai }))}
      //     />
      //   );
      case "notifications":
        return (
          <NotificationsSettingsSection
            notifications={settings.notifications}
            onChange={(notifications) => updateSettings((current) => ({ ...current, notifications }))}
          />
        );
      case "billing":
        return (
          <BillingSettingsSection
            billing={settings.billing}
            onChange={(billing) => updateSettings((current) => ({ ...current, billing }))}
          />
        );
      case "privacy-data":
        return (
          <PrivacyDataSettingsSection
            onOpenDeleteFlow={openDeleteFlow}
            onOpenLogoutConfirm={() => setLogoutConfirmOpen(true)}
            onExportLeads={() => {
              void handleExportLeads();
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <PageBackground image={bgDataAtWork} tint="rgba(159, 175, 12, 0.49)" />
      <ResponsivePageLayout contentClassName="space-y-4">
        <header className="glass-card p-5">
          <div className="flex md:flex-row flex-col items-start justify-between gap-3">
            <div>
              <h2 className="bg-gradient-to-r from-content via-accent to-accent-secondary bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl">
                AI Sales Engine Control Center
              </h2>
              <p className="mt-1 text-sm text-content-secondary">
                Configure profile, automation, scoring, and compliance from one command surface.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  void saveSettings();
                }}
                disabled={!isDirty || saving}
                className="accent-btn px-3 py-2 text-[10px] font-bold tracking-[0.1em] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "SAVING" : "SAVE"}
              </button>
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(true)}
                className="glass-btn inline-flex h-12 w-12 items-center justify-center text-content-secondary transition-colors hover:text-danger"
                aria-label="Open logout confirmation"
                title="Logout"
              >
                <LogOut className="h-10 w-10" />
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-4">
            <SettingsTabNav activeTab={activeTab} onChange={setActiveTab} />
            <div className="glass-card-sm p-4">
              <p className="text-xs uppercase tracking-[0.1em]  ">AI Optimization Score</p>
              <p className="mt-1 text-2xl font-semibold text-content">{optimizationScore}%</p>
              <p className="mt-2 text-xs text-content-secondary">
                Improve your setup by connecting email, adding skills, and increasing personalization.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card-sm border border-accent/15 p-4">
              <p className="text-xs uppercase tracking-[0.1em]  ">Active Section</p>
              <h3 className="mt-1 text-lg font-semibold text-content">{activeTabConfig?.label}</h3>
              <p className="text-sm text-content-secondary">{activeTabConfig?.description}</p>
            </div>

            {loading ? (
              <div className="glass-card p-6 text-sm text-content-secondary">Loading settings...</div>
            ) : (
              renderActiveSection()
            )}

            <div className="glass-card-sm flex flex-col gap-2 border border-accent/15 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-content">Automation Preview</p>
                <p className="text-xs text-content-secondary">
                  AI runs in {settings.ai.mode} mode with {settings.ai.personalization} personalization and a
                  minimum lead score of {settings.leadsScoring.minimumLeadScore}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  void saveSettings();
                }}
                disabled={!isDirty || saving}
                className="accent-btn px-5 py-2 text-xs font-bold tracking-[0.1em] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "SAVING..." : "SAVE CONFIGURATION"}
              </button>
            </div>

            {saveMessage ? (
              <div className="rounded-glass-sm border border-success/30 bg-success-soft px-3 py-2 text-sm text-success">
                {saveMessage}
              </div>
            ) : null}

            {saveError ? (
              <div className="rounded-glass-sm border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
                {saveError}
              </div>
            ) : null}

            <div>
              <p className="text-xs  ">
                Signed in as {user?.email || "unknown user"}. Configuration is persisted to Firebase when signed in, with local fallback.
              </p>
            </div>
          </div>
        </div>

        <SettingsLogoutModal
          open={logoutConfirmOpen}
          onCancel={() => setLogoutConfirmOpen(false)}
          onConfirm={() => {
            void handleLogout();
          }}
        />

        <SettingsDeleteAccountModal
          open={deleteStep > 0}
          step={(deleteStep || 1) as 1 | 2 | 3}
          confirmEmail={confirmEmail}
          authPassword={authPassword}
          isGoogleUser={isGoogleUser}
          deleteError={deleteError}
          deleting={deleting}
          userEmail={user?.email ?? ""}
          onConfirmEmailChange={setConfirmEmail}
          onAuthPasswordChange={setAuthPassword}
          onCancel={resetDeleteFlow}
          onStepOneDecision={handleDeleteStepOneDecision}
          onStepTwoConfirm={handleStepTwoConfirm}
          onFinalDelete={() => {
            void handleFinalDelete();
          }}
        />
      </ResponsivePageLayout>
    </>
  );
};
