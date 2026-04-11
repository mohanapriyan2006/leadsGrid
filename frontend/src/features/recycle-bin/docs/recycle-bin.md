# Recycle Bin Feature

## Overview
Shows soft-deleted leads, supports restore and permanent delete actions, and provides a detail modal with enriched lead fields.

## Components
- `RecycleBinTable`
- `RecycleBinDetailsModal`

## Orchestration
- View/controller: `src/app/views/RecyclicBinPage.tsx`
- UI components: `src/features/recycle-bin/components/*`

## Behavior
- Loads bin leads from centralized lead store hook.
- Opens details modal for selected lead.
- Restores lead back to active workflow.
- Permanently deletes lead from recycle bin.

## Future Improvements
- Add action confirmations for destructive operations.
- Add search and filter controls for large bins.
- Add pagination or virtualization for very large datasets.
