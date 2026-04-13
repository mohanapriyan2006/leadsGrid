# Firebase Optimization Implementation Guide (Spark-Friendly)

This guide documents the Firebase optimizations already introduced in this repository and provides a repeatable checklist for upcoming implementation phases.

## 1. Scope and Goals

- Reduce Firestore document reads for lead listing screens.
- Reduce write spikes from bulk operations and AI session persistence.
- Keep query patterns index-backed (avoid scan-like behavior).
- Keep UI responsive on large datasets using cursor pagination.
- Stay within Firebase Spark (free plan) limits as long as workload allows.

## 2. What Was Optimized

## 2.1 Lead list pagination (hard cursors)

Implemented in `frontend/src/features/leads/services/leadService.ts` and consumed via `frontend/src/features/leads/hooks/useCentralizedLeads.ts`.

- Added `listManageLeadsPage(...)` with Firestore cursor support.
- Added `listManageLeadBinPage(...)` with cursor support.
- Added `listAllManageLeads(...)` for explicit full traversal (used only where needed, e.g., export).
- Added bounded page sizing:
  - `DEFAULT_PAGE_SIZE = 100`
  - `MAX_PAGE_SIZE = 250`
- Hook defaults:
  - active page size `100`
  - bin page size `60`

Impact: avoids loading the entire leads collection for standard page views.

## 2.2 Batch writes for bulk operations

Implemented in `frontend/src/features/leads/services/leadService.ts`.

- Batch chunk constant: `BATCH_WRITE_SIZE = 250`.
- Bulk delete/restore/import operations now use batched commits instead of one write transaction per item.

Impact: reduces write pressure and improves throughput consistency.

## 2.3 Indexed dedupe checks

Implemented in `frontend/src/features/leads/services/leadModel.ts` and `frontend/src/features/leads/services/leadService.ts`.

- Added deterministic dedupe key generation using `buildLeadDedupeKey(...)`.
- Added Firestore query path that checks duplicates with indexed fields (`isDeleted + dedupeKey`).

Impact: avoids expensive duplicate detection patterns and supports predictable lookup cost.

## 2.4 Debounced conversation/session saves

Implemented in `frontend/src/features/ai/services/conversationMemoryService.ts`.

- `SESSION_SAVE_DEBOUNCE_MS = 1500`
- `MAX_LIST_SESSIONS = 50` for bounded list reads.

Impact: collapses high-frequency write bursts during chat activity.

## 2.5 Backend write/read guardrails

Implemented in backend files:

- `backend/app/services/agent_run_service.py`
  - Avoids duplicate terminal log writes when Firebase run-state doc is already used.
  - Keeps run state in one primary document path to reduce write duplication.
- `backend/app/firebase/firebase_client.py`
  - `get_user_projects(..., take=100)` now clamps to max `250`.

Impact: lowers unnecessary backend Firestore operations.

## 3. Required Firestore Composite Indexes

Defined in `frontend/firestore.indexes.json`.

Current required indexes on collection group `leads`:

1. `isDeleted (ASC), dedupeKey (ASC)`
2. `isDeleted (ASC), pipelineStage (ASC)`
3. `isDeleted (ASC), pipelineStage (ASC), updatedAt (DESC)`
4. `isDeleted (ASC), updatedAt (DESC)`

Without these indexes, paginated and filtered queries may fail with "The query requires an index".

## 4. Deploy Indexes (One-Time Per Environment)

Run from project root:

```bash
npm install -g firebase-tools
firebase login
cd frontend
firebase deploy --only firestore:indexes --project <YOUR_PROJECT_ID>
```

Replace `<YOUR_PROJECT_ID>` with your Firebase project id.

After deployment:

- Open Firebase Console -> Firestore -> Indexes.
- Wait until status is `Serving`.
- Do not consider Manage Leads fixed while index status is `Building`.

## 5. Spark-Plan Operational Strategy

Important: Firebase Spark quotas can change over time. Always confirm current limits in Firebase pricing/usage docs.

Practical strategy:

- Keep list views paginated; avoid unbounded reads in user-facing screens.
- Keep `page_size` conservative (start at 50-100 for active leads).
- Keep batch writes at 250 or lower if traffic is bursty.
- Avoid frequent auto-refresh loops on lead-heavy pages.
- Use explicit `Load More` over automatic aggressive prefetch.
- Reserve full traversal (`listAllManageLeads`) for user-triggered export flows only.

## 6. Tuning Knobs for Upcoming Implementation

Primary knobs:

- `frontend/src/features/leads/services/leadService.ts`
  - `DEFAULT_PAGE_SIZE`
  - `MAX_PAGE_SIZE`
  - `BATCH_WRITE_SIZE`
- `frontend/src/features/leads/hooks/useCentralizedLeads.ts`
  - `DEFAULT_ACTIVE_PAGE_SIZE`
  - `DEFAULT_BIN_PAGE_SIZE`
- `frontend/src/features/ai/services/conversationMemoryService.ts`
  - `SESSION_SAVE_DEBOUNCE_MS`
  - `MAX_LIST_SESSIONS`

Recommended starting profile for Spark:

- active leads page size: 50-100
- bin page size: 40-60
- batch write size: 100-250
- session save debounce: 1500-2500 ms

## 7. Verification Checklist (After Each Change)

1. Build frontend.
2. Run backend tests.
3. Open Manage Leads and confirm first page loads with no index error.
4. Trigger `Load More` and confirm cursor pagination works.
5. Execute a small CSV import and verify batched behavior.
6. Validate Firestore Usage graph does not spike unexpectedly.

Suggested local commands:

```bash
# frontend
cd frontend
npm run build

# backend (Windows cmd)
cd /d d:\codings\leadsGrid\backend
set PYTEST_DISABLE_PLUGIN_AUTOLOAD=1
pytest
```

## 8. Observability and KPI Tracking

Track daily values before/after releases:

- Firestore document reads/day
- Firestore document writes/day
- Avg lead-list load time (first page)
- Error count for index-related failures
- Avg import duration and success rate

Simple release KPI template:

```text
Date:
Release:
Reads/day (before -> after):
Writes/day (before -> after):
P95 lead list load time (before -> after):
Index errors (count):
Notes:
```

## 9. Known Risk Areas

- If a new query adds `where` + `orderBy` combinations, it may need a new composite index.
- If `page_size` is raised too high, Spark read limits can still be exceeded under moderate concurrency.
- Full export endpoints can still be expensive if used frequently on large datasets.

## 10. Next Implementation Backlog (Recommended)

1. Add a guardrail to block oversized exports for free-plan users.
2. Add server-side counters for read/write heavy actions.
3. Add per-feature quota telemetry (imports, load-more, AI saves).
4. Add a fallback UX message when index is still building.
5. Add environment-specific tuning via config (dev/staging/prod).

---

Owner note: keep this file updated whenever query patterns or pagination constants change.
