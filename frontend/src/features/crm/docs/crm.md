# CRM Feature

## Overview
Manages pipeline deals in table and kanban formats with drag-drop stage transitions, inline actions, and modal-based details.

## Components
- `AddDealForm`
- `CRMStatsGrid`
- `CRMTableView`
- `DealModal`
- `KanbanCard`
- `DroppableStatusColumn`

## Types
- `Deal`
- `NewDealDraft`
- `CRMStage`

## Constants
- `CRM_STAGES`
- `STATUS_COLUMNS`
- `STAGE_TO_STATUS`
- `STATUS_TO_STAGE`

## Utility Functions
- `parseCurrency`
- `formatCurrency`
- `getStatusLabelColor`

## Behavior
- Converts centralized lead stages to CRM deal statuses.
- Supports drag and drop between status columns.
- Persists status updates and lead edits through `leadService`.
- Moves deleted deals to recycle bin using soft-delete behavior.

## Current Structure
- View orchestration: `src/app/views/CRMPage.tsx`
- Feature components: `src/features/crm/components/*`
- Types: `src/features/crm/types/crm.ts`
- Constants and mappings: `src/features/crm/constants/crm.ts`

## Future Improvements
- Extract edit modal into dedicated CRM component and controlled form state.
- Add optimistic rollback for failed stage updates.
- Add unit tests for stage/status mapping and currency parsing.
