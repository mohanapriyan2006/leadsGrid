# CRM Analysis Feature

## Overview
The Analysis tab turns live CRM deals into actionable intelligence without backend dependencies. It computes analytics, predictions, and AI-style recommendations directly from centralized lead data.

## Architecture
- Components: visualization and presentation only
- Hooks: state and orchestration
- Services: deterministic analytics, prediction, and insight engines
- Types: contracts for charts, cards, and insight panels

## Data Source
- Uses `useCentralizedLeads` from the leads feature
- Reads active CRM deals already mapped in the CRM page

## Filters
- Date range: 7d / 30d / 90d
- Pipeline scope: all / active / won / lost

## KPIs
- Total deals
- Total pipeline value
- Win rate
- Average deal size
- Average time to close

## Charts
- Pipeline distribution
- Conversion funnel
- Revenue trend
- Deal velocity

## Predictions
- Expected revenue
- Likely-to-close deals
- At-risk deals
- Confidence score

## AI Insight Engine
Deterministic heuristics produce:
- three insights
- three recommended actions
- one risk alert
- next best action

## Formulas
- `winRate = wonClosedDeals / allClosedDeals`
- `avgDealSize = totalValue / totalDeals`
- `expectedRevenue = sum(dealValue * stageProbability)`
- at-risk flag: low score or long stage duration

## Future Upgrades
- optional backend AI enrichment
- persistent stage history for precise velocity
- per-source conversion and revenue attribution
