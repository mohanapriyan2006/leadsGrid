import { SettingsSectionCard } from "../SettingsSectionCard";
import { SettingsToggle } from "../SettingsToggle";
import type { AppSettings } from "../../types/settings";

type NotificationsSettingsSectionProps = {
  notifications: AppSettings["notifications"];
  onChange: (notifications: AppSettings["notifications"]) => void;
};

export const NotificationsSettingsSection = ({
  notifications,
  onChange,
}: NotificationsSettingsSectionProps) => {
  const eventItems: Array<{ key: keyof AppSettings["notifications"]; label: string; help: string }> = [
    { key: "newLead", label: "New lead found", help: "Alert me when discovery captures a new lead." },
    {
      key: "highIntentLead",
      label: "High-intent lead alert",
      help: "Notify me when lead score crosses threshold.",
    },
    {
      key: "messageReply",
      label: "Message reply received",
      help: "Notify me when prospects respond to outreach.",
    },
    { key: "weeklyReport", label: "Weekly report", help: "Send a weekly performance summary." },
  ];

  return (
    <SettingsSectionCard title="Notifications" description="Control event alerts and delivery channels.">
      <div className="space-y-2">
        {eventItems.map((item) => (
          <div key={item.key} className="glass-card-sm flex items-center justify-between px-3 py-2">
            <div>
              <p className="text-sm text-content">{item.label}</p>
              <p className="text-xs text-content-secondary">{item.help}</p>
            </div>
            <SettingsToggle
              checked={Boolean(notifications[item.key])}
              onChange={() =>
                onChange({
                  ...notifications,
                  [item.key]: !notifications[item.key],
                })
              }
            />
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs font-semibold tracking-[0.08em] text-content-secondary uppercase">Channels</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {[
            ["email", "Email"],
            ["inApp", "In-app"]
          ].map(([key, label]) => (
            <div key={key} className="glass-card-sm flex items-center justify-between px-3 py-2">
              <p className="text-sm text-content">{label}</p>
              <SettingsToggle
                checked={notifications.channels[key as keyof AppSettings["notifications"]["channels"]]}
                onChange={() =>
                  onChange({
                    ...notifications,
                    channels: {
                      ...notifications.channels,
                      [key]: !notifications.channels[key as keyof AppSettings["notifications"]["channels"]],
                    },
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>
    </SettingsSectionCard>
  );
};
