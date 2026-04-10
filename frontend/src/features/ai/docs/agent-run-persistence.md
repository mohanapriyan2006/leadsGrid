# Agent Run Persistence and Realtime Sync

## Overview
This phase adds durable agent run snapshots in Firestore and realtime run-state hydration in the frontend execution hook.

## Goals
- Persist run lifecycle transitions beyond in-memory backend state.
- Enable frontend timeline updates from Firestore run snapshots.
- Keep existing API-based flow compatible.

## Backend Behavior
- Every major transition now writes a snapshot document to:
  - `users/{userId}/agent_runs/{runId}`
- Snapshot payload includes:
  - event metadata (`event`, `prompt`, `tone`, approval settings)
  - serialized `run` state
  - serialized `steps`

### Persisted Events
- `started`
- `running`
- `paused_for_approval`
- `step_started`
- `step_completed`
- `step_skipped`
- `failed`
- `completed`
- `aborted`

## Frontend Behavior
- `useAgentExecution` starts a Firestore listener when a run starts.
- Listener reads the persisted run snapshot and applies updates to plan/execution state.
- Listener is stopped on terminal statuses (`completed`, `failed`, `aborted`) and on hook cleanup/reset.

## Firestore Rules
Added user-scoped access for:
- `users/{userId}/conversations/{conversationId}`
- `users/{userId}/agent_runs/{runId}`

## Notes
- This phase does not replace API endpoints.
- API responses remain the source for mutations (start/approve/skip/abort), while Firestore provides realtime synchronization.
