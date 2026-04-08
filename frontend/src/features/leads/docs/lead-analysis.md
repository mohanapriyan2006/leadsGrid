# Lead Analysis Feature (AI-Powered)

## Overview
AI-powered lead analysis with 6 specialized prompts for intent scoring, validation, outreach generation, follow-ups, action suggestions, and portfolio matching.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/leads/analyze` | POST | Full analysis (all 6 prompts) |
| `/api/leads/analyze-intent` | POST | Intent scoring only |
| `/api/leads/analyze-advanced-intent` | POST | Strict JSON advanced intent scoring |
| `/api/leads/validate` | POST | Lead validation only |
| `/api/leads/generate-outreach` | POST | Outreach message only |
| `/api/leads/suggest-action` | POST | Action suggestion only |

## AI Prompts (6 Core Prompts)

### 1. Lead Intent Scoring
**Purpose:** Score lead quality 0-100 with detailed breakdown

**Returns:**
- `score`: 0-100 integer
- `urgency`: low/medium/high
- `budget`: low/medium/high/unknown
- `decision_maker`: yes/no/unknown
- `pain_point`: 1 sentence summary
- `lead_type`: job/complaint/learning/hiring

**Rules:**
- High scores only for real buying intent
- Students/tutorials filtered out

### 2. Filter Bad Leads
**Purpose:** Validate if lead represents real buying intent

**Returns:**
- `is_valid_lead`: boolean
- `reason`: explanation string

**Classification:**
- YES → hiring, problem, frustration, need developer
- NO → learning, tutorial, curiosity

### 3. AI Outreach Message
**Purpose:** Generate personalized outreach message

**Returns:** Message text (under 80 words)

**Tone Guidelines:**
- Friendly, not salesy
- Mention solution idea
- Show expertise
- No generic phrases like "I am interested"

### 4. Follow-Up Message
**Purpose:** Generate polite follow-up after 2 days of no reply

**Returns:** Message text (under 50 words)

**Rules:**
- Short, friendly reminder
- Not annoying
- No clichés like "just following up"

### 5. Action Suggestion
**Purpose:** Recommend next best action

**Returns:**
- `action`: ignore/save/contact_now
- `reason`: one sentence explanation

**Decision Logic:**
- `ignore` → low quality, not relevant
- `save` → good lead, add to CRM
- `contact_now` → high intent, reach out immediately

### 6. Portfolio Matching
**Purpose:** Match lead to user's best portfolio project

**Returns:**
- `project_name`: matched project name or N/A
- `why_match`: brief explanation

**Data Source:** `users/{uid}/projects` from Firebase

## Components
- Uses existing `LeadsDiscoveryResultCard` for display
- Integrates with `LeadsDiscoveryDraftPanel` for outreach preview

## Hooks
- `useLeadAnalysis` - Full analysis and individual prompt hooks

## Services
- `leadAnalysisService.analyzeLead()` - Full analysis
- `leadAnalysisService.analyzeIntent()` - Intent only
- `leadAnalysisService.analyzeAdvancedIntent()` - Advanced strict intent analysis
- `leadAnalysisService.validateLead()` - Validation only
- `leadAnalysisService.generateOutreach()` - Outreach only
- `leadAnalysisService.suggestAction()` - Action suggestion only

## Backend Services
- `ai_prompts_service.py` - All 6 prompt templates and AI provider integration
- `ai_scorer.py` - AI-enhanced scoring pipeline (combines with keyword-based scoring)

## AI Providers
Supports fallback chain:
1. Gemini (primary)
2. Groq (fallback)

## Types
- `LeadAnalysis` - Complete analysis result
- `LeadIntentDetails` - Intent breakdown
- `LeadValidationResult` - Validation result
- `LeadOutreachMessage` - Generated message
- `LeadActionSuggestion` - Action recommendation
- `LeadPortfolioMatch` - Portfolio match result

## Integration with Existing Flow
The AI scorer (`ai_scorer.py`) enhances existing keyword-based scoring:
- 40% weight: Original keyword-based score
- 60% weight: AI intent score
- Invalid leads automatically penalized (-30 points)

## Future Improvements
- Caching layer for repeated lead analysis
- Batch analysis for multiple leads
- Custom prompt templates per user
