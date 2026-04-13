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

## Firestore Free-Plan Optimizations
- Realtime subscriptions are mode-aware (`active`, `bin`, `both`) so pages only subscribe to the data they need.
- Lead list APIs now use hard cursor pagination (`listManageLeadsPage`, `listManageLeadBinPage`) instead of returning full active datasets.
- Bulk lead actions now use Firestore batched writes instead of per-document sequential writes.
- CSV import uses chunked batched commits to reduce write burst overhead.
- Duplicate detection for discovery saves uses an indexed `dedupeKey` lookup (`isDeleted + dedupeKey`) instead of full collection scans.
- Dashboard insights/analytics are computed from already-loaded leads where possible to avoid repeated polling reads.

## Operational Notes
- Deploy indexes from `frontend/firestore.indexes.json` before enabling dedupe-key queries in production.
- Keep Firestore batch size under platform limits (current chunk size: 250).

## Future Improvements
- Extract hover/dialog orchestration into a dedicated modal controller hook.
- Add virtualization for large table mode datasets.
- Add unit tests for `guessMapping` alias resolution and stage progression.
