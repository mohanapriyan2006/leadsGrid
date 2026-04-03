# Settings Feature

## Overview
Controls system-level outreach behavior such as notifications, AI auto-scoring, and scan interval preferences.

## Components
- `SettingsToggle`
- `SettingsToggleSection`
- `SettingsIntervalSection`

## Constants
- `SETTINGS_DEFAULTS`
- `NOTIFICATION_ITEMS`
- `AI_ENGINE_ITEMS`
- `REFRESH_INTERVALS`

## Orchestration
- View/controller: `src/app/views/SettingsPage.tsx`
- Components: `src/features/settings/components/*`
- Constants: `src/features/settings/constants/*`

## Behavior
- Toggles boolean settings for notification and AI behavior.
- Updates scan interval selection through preset values.
- Keeps local state ready for later persistence.

## Future Improvements
- Persist configuration to backend and restore on page load.
- Add optimistic save feedback and validation states.
- Add unit tests for toggle and interval interactions.
