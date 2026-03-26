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

## Hooks
- `useLeads`
- `useMessageGenerator`

## Services
- `leadService.getLeads`

## State
- `useLeadStore.leads`

## Current Behavior
- Debounced real-time lead discovery from backend pipeline.
- Displays scored leads from API and falls back to seed mocks when API returns empty.
- Highlights high-intent leads with animated glow effects.
- Generates contextual outreach drafts in split-screen AI panel.

## Future Improvements
- Pagination and cursor-based loading.
- Source-level filters and debounce search.
- Realtime lead updates via websocket.
