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
- Sends email through backend `/api/email/send` with:
	- `From`: `<sender name> via LeadsGrid`
	- `Reply-To`: current user email (or configured messaging primary email)
	- metadata in `custom_args` for campaign analytics.
- Adds a Templates tab with 3 selectable outreach templates:
	- Minimal Professional
	- Modern Card
	- Bold Conversion
- Supports primary/secondary color pickers and applies selected template output to draft before send.
- Template placeholders: `{{name}}`, `{{company}}`, `{{pain_point}}`, `{{solution}}`, `{{sender_name}}`.

## Future Improvements
- Add message history timeline per lead.
- Add validation states for email formatting and subject requirements.
- Add component tests for generation and send action flows.
