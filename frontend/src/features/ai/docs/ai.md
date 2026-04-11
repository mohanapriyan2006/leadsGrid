# AI Feature

## Overview
Provides AI-assisted sales chat with quick actions, message generation, file-aware context prompts, and session history restoration.

## Components
- `AIHeader`
- `AIMessageFeed`
- `AIQuickActions`
- `AIComposer`

## Types
- `ChatMessage`
- `ChatSession`
- `InsightCard`

## Constants and Utilities
- `QUICK_ACTIONS`
- `QUICK_ACTION_PROMPT`
- `TONES`
- `FILE_ACCEPT`
- `createId`

## Orchestration
- View/controller: `src/app/views/AIPage.tsx`
- Components: `src/features/ai/components/*`
- Types: `src/features/ai/types/chat.ts`
- Constants: `src/features/ai/constants/aiPage.ts`

## Behavior
- Ask mode runs frontend-only provider calls with ordered fallback: Gemini -> Groq -> OpenRouter.
- Ask mode returns text responses only and can show one CTA to switch into Agent mode for execution tasks.
- Agent mode uses structured plan/execution timeline components with approval-aware controls.
- Supports quick action prompts and file-aware prompt seeding.
- Supports save/restore chat sessions in local page state.

## Ask Mode Guardrails
- No insight cards/actions are rendered in Ask mode responses.
- Ask mode is advisory only; execution flows are delegated to Agent mode.
- Provider keys are sourced from `VITE_*` env variables.

## Future Improvements
- Persist chat history to Firestore through `aiHistoryService`.
- Add structured intent cards from model output instead of static card generation.
- Add tests for quick-action, session save/restore, and composer interactions.
