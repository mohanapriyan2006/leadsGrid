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
- Generates assistant responses based on lead and pipeline context.
- Supports quick action prompts and file-aware prompt seeding.
- Supports message hiding, reusing, editing, and send-email actions.
- Supports save/restore chat sessions in local page state.

## Future Improvements
- Persist chat history to Firestore through `aiHistoryService`.
- Add structured intent cards from model output instead of static card generation.
- Add tests for quick-action, session save/restore, and composer interactions.
