# Leads Feature

## Overview
Handles lead ingestion display, intent visualization, and integration points to scoring pipelines.

## API
- `GET /api/agent/discover?query=...&limit=...`
- `POST /api/agent/plan`
- `POST /api/agent/execute`
- `POST /api/ai/message` (Ask text generation fallback route in frontend service)

## Components
- `LeadCard`
- `LeadsStream`
- `AIMessagePanel`
- `leadsPagePrimitives` (reusable page-level icons, skeleton card, and UI helpers)
- `LeadsDiscoveryFilters`
- `LeadsDiscoverySearchBar`
- `LeadsDiscoveryResultCard`
- `LeadsDiscoveryDraftPanel`

## Hooks
- `useLeads`
- `useMessageGenerator`
- `useLeadsDiscoveryFilters`

## Services
- `leadService.discoverLeads` (real backend discovery)
- `discoveryAdapter.adaptDiscoveryLead` (DTO to frontend Lead mapping)

## State
- `useLeadStore.leads`

## Leads Page Architecture
- `src/app/views/LeadsDiscoveryPage.tsx` is orchestration-only and delegates UI blocks to feature components.
- `src/features/leads/types/discovery.ts` defines backend discovery DTO contracts.
- `src/features/leads/services/discoveryAdapter.ts` maps backend discovery fields into the canonical frontend `Lead` type.
- `src/features/leads/constants/leadsPageOptions.ts` uses real free-source filters (`reddit`, `hackernews`, `search`).

## Current Behavior
- Debounced real-time lead discovery from backend free-source pipeline.
- Uses adapter-driven mapping so discovered leads always match frontend Lead fields.
- Displays source-accurate chips and score-threshold filtering.
- Generates contextual outreach drafts in split-screen AI panel.

## Future Improvements
- Pagination and cursor-based loading.
- Realtime lead updates via websocket.

## Related Docs
- `src/features/leads/docs/manage-leads.md` for pre-CRM qualification workflow architecture.
