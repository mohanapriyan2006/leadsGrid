# AI Sales Engine Feature

## Overview
Dual-mode AI interface for the LeadsGrid CRM. Provides conversational insights (Ask Mode) and autonomous action execution (Agent Mode) with user permission.

## Modes

### Ask Mode
- Chat-based Q&A with CRM context
- Quick actions: Find leads, Best lead, Next action, Draft message, Analyze pipeline
- Smart chips and typing auto-suggestions
- Response cards: Insight Card with CTA to convert to Agent Task

### Agent Mode
- User describes a task → AI builds execution plan
- Permission UI: Approve All / Step-by-Step / Edit Plan
- Real client-side execution (lead discovery, scoring, CRM updates, message drafting, follow-up scheduling)
- Live timeline progress with status badges

## Components
- `AIHeader` — Mode toggle, context bar, status indicator, chat history
- `AIComposer` — Input with mode indicator, tone selector, suggestion dropdown
- `AIMessageFeed` — Messages, plan cards, execution timeline, empty state
- `AIQuickActions` — Quick action buttons (Ask Mode)
- `ModeToggle` — Ask/Agent mode switcher
- `ContextBar` — Active context display
- `StatusIndicator` — AI status (Idle/Thinking/Executing)
- `AgentPlanCard` — Plan display with approval buttons
- `AgentExecutionTimeline` — Live step progress
- `PermissionModal` — Step approval modal (step-by-step mode)
- `SmartChip` / `SmartChipGroup` — Suggestion chips
- `EmptyState` — Interactive empty state with suggestions
- `SuggestionDropdown` — Typing auto-suggestions

## Hooks
- `useMode` — Mode state, AI status, active context, auto-approve toggle
- `useSuggestions` — Typing suggestions and smart chips
- `useAgentExecution` — Plan creation, approval, step-by-step execution

## Services
- `agentService` — Real action execution (lead discovery, scoring, CRM update, message draft, follow-up schedule)
- `aiHistoryService` — Chat history persistence

## Types
- `agent.ts` — AIMode, AIStatus, AgentPlan, AgentStep, AgentExecutionState, ActiveContext, SmartSuggestion, AgentMessage
- `chat.ts` — ChatRole (user/assistant/agent), ChatMessage, ChatSession, InsightCard

## Constants
- `agentActions.ts` — Action definitions, smart suggestions, typing suggestions, intent keywords
- `aiPage.ts` — Quick actions, tones, file accept types

## State
- `mode`: 'ask' | 'agent'
- `aiStatus`: 'idle' | 'thinking' | 'executing'
- `messages`: ChatMessage[]
- `agentPlan`: AgentPlan | null
- `executionState`: AgentExecutionState | null
- `autoApproveLowRisk`: boolean

## Agent Actions
1. **Lead Discovery** — Scans and filters leads by criteria (low risk)
2. **Lead Scoring** — Ranks leads by quality signals (low risk)
3. **CRM Update** — Moves stages, adds tags (medium risk)
4. **Message Draft** — Generates personalized outreach (medium risk)
5. **Follow-up Schedule** — Queues reminders (low risk)

## Future Improvements
- Voice input
- Auto Mode (daily lead discovery)
- Best Lead of the Day widget
- 1-click Close Strategy
- Backend AI integration (replace client-side execution)
