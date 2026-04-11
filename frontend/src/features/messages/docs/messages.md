# Messages Feature

## Overview
Generates outbound message drafts from live lead context, supports tone switching, and sends email through the message service.

## Components
- `MessageLeadPanel`
- `MessageComposerPanel`
- `MessageLeadDetailsModal`

## Constants and Utilities
- `TONES`
- `CONTEXT_PREVIEW_LIMIT`
- `toUiSource`

## Orchestration
- View/controller: `src/app/views/MessagesPage.tsx`
- UI components: `src/features/messages/components/*`
- Constants: `src/features/messages/constants/messages.ts`

## Behavior
- Auto-selects the first lead from centralized state.
- Generates draft message content with fallback template on failure.
- Supports manual editing, copy-to-clipboard, and send-email action.
- Shows lead details in a modal with source badge.

## Future Improvements
- Add message history timeline per lead.
- Add validation states for email formatting and subject requirements.
- Add component tests for generation and send action flows.
