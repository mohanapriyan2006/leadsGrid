# Settings Feature

## Overview
Settings now acts as a control center with left-tab navigation and section cards for profile, workspace, scoring, messaging, integrations, AI behavior, notifications, billing, and privacy.

## Architecture
- View/controller: `src/app/views/SettingsPage.tsx`
- Domain types: `src/features/settings/types/settings.ts`
- State orchestration: `src/features/settings/hooks/useSettingsState.ts`
- Persistence layer: `src/features/settings/services/settingsService.ts`
- Section composition: `src/features/settings/components/sections/*`

## Key Components
- `SettingsTabNav`
- `SettingsSectionCard`
- `SettingsField`
- `SettingsLogoutModal`
- `SettingsDeleteAccountModal`
- Section components:
	- `ProfileSettingsSection`
	- `WorkspaceSettingsSection`
	- `LeadsScoringSettingsSection`
	- `MessagingSettingsSection`
	- `IntegrationsSettingsSection`
	- `AISettingsSection`
	- `NotificationsSettingsSection`
	- `BillingSettingsSection`
	- `PrivacyDataSettingsSection`

## Behavior
- Uses a single global save CTA with dirty-state tracking.
- Loads and stores settings through the `settingsService` persistence layer.
- Normalizes values with defaults to avoid missing-field regressions.
- Preserves secure triple-step account deletion flow.

## Current Persistence Mode
- Current implementation persists to browser local storage (`leadsgrid.settings.v1`) via `settingsService`.
- Schema is structured to support backend API persistence in the next phase.

## Future Improvements
- Replace local-storage persistence with authenticated backend endpoints.
- Add section-level validation messages for advanced constraints (for example, BANT weights total).
- Add unit tests for state hook, section updates, and save lifecycle.
