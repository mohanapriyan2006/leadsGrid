# Manage Leads Feature

## Overview
Handles lead qualification workflows, board/table operations, CSV import mapping, and progression actions before CRM handoff.

## Components
- `ManageLeadsHeader`
- `ManageLeadsAddRowForm`
- `ManageLeadsCsvMappingPanel`
- `ManageLeadsStageColumn`
- `ManageLeadsBoardCard`
- `ManageLeadsTableView`
- `LeadModal`
- `EditLeadModal`
- `ConfirmDialog`

## Constants and Utilities
- `BOARD_STAGES`
- `VIEW_OPTIONS`
- `NEXT_STAGE`
- `APP_IMPORT_FIELDS`
- `guessMapping`
- `formatMoney`
- `fromNow`

## Orchestration
- View/controller: `src/app/views/ManageLeadsPage.tsx`
- UI primitives: `src/features/leads/components/ManageLeads*.tsx`
- Shared config: `src/features/leads/constants/manageLeads.ts`

## Behavior
- Loads centralized leads in realtime.
- Supports board drag-drop stage movement.
- Supports table mode with quick actions (details/edit/delete).
- Supports CSV header mapping and import.
- Supports progression actions and CRM handoff transition.

## Future Improvements
- Extract hover/dialog orchestration into a dedicated modal controller hook.
- Add virtualization for large table mode datasets.
- Add unit tests for `guessMapping` alias resolution and stage progression.
