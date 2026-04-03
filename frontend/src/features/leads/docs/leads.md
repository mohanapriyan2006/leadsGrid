# Leads Feature

## Overview
Handles lead ingestion display, intent visualization, and integration points to scoring pipelines.

## API
- `GET /api/leads`
- `POST /api/leads/sync`
- `POST /api/leads/async`
- `GET /api/leads/discover`
- `POST /api/ai/message`

## Components
- `LeadCard`
- `LeadsStream`
- `AIMessagePanel`
- `leadsPagePrimitives` (reusable page-level icons, skeleton card, and UI helpers)

## Hooks
- `useLeads`
- `useMessageGenerator`

## Services
- `leadService.getLeads`

## State
- `useLeadStore.leads`

## Leads Page Architecture
- `src/app/views/LeadsPage.tsx` now focuses on orchestration and rendering flow.
- `src/features/leads/constants/leadsPageStyles.ts` contains the page style system.
- `src/features/leads/constants/leadsPageOptions.ts` contains source/industry UI options.
- `src/features/leads/components/leadsPagePrimitives.tsx` contains reusable visual primitives and helper utilities.

## Current Behavior
- Debounced real-time lead discovery from backend pipeline.
- Displays scored leads from API and falls back to seed mocks when API returns empty.
- Highlights high-intent leads with animated glow effects.
- Generates contextual outreach drafts in split-screen AI panel.
- Applies source chip filters and minimum score threshold when rendering discovered leads.

## Future Improvements
- Pagination and cursor-based loading.
- Realtime lead updates via websocket.

## Related Docs
- `src/features/leads/docs/manage-leads.md` for pre-CRM qualification workflow architecture.
