import { Bell, Bot, Building2, CreditCard, Lock, MessageSquareText, PlugZap, Target, UserCircle2 } from "lucide-react";

import { SETTINGS_TABS } from "../constants/settingsOptions";
import type { SettingsTabKey } from "../types/settings";

type SettingsTabNavProps = {
  activeTab: SettingsTabKey;
  onChange: (tab: SettingsTabKey) => void;
};

const iconByKey: Record<SettingsTabKey, typeof UserCircle2> = {
  profile: UserCircle2,
  workspace: Building2,
  "leads-scoring": Target,
  messaging: MessageSquareText,
  integrations: PlugZap,
  "ai-settings": Bot,
  notifications: Bell,
  billing: CreditCard,
  "privacy-data": Lock,
};

export const SettingsTabNav = ({ activeTab, onChange }: SettingsTabNavProps) => {
  return (
    <aside className="glass-card-sm md:w-full w-[calc(100dvw-2rem)]  h-fit p-2">
      <nav className="flex gap-2 overflow-x-auto md:flex-col">
        {SETTINGS_TABS.map((tab) => {
          const Icon = iconByKey[tab.key];
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`group min-w-[180px] rounded-glass-sm border px-3 py-2.5 text-left transition-all duration-200 md:min-w-0 ${
                isActive
                  ? "border-accent/40 bg-accent-soft text-content "
                  : "border-accent/10 bg-surface-secondary/70 text-content-secondary hover:border-accent/30 hover:text-content"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Icon className="h-4 w-4" />
                {tab.label}
              </span>
              <span className="mt-1 block text-[11px]  text-content-secondary group-hover:text-content">
                {tab.description}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
