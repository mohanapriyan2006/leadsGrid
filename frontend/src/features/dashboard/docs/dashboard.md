# Dashboard Feature

## Overview
The dashboard is the primary command center for authenticated users. It surfaces live pipeline health and action priorities from Firebase-backed lead data.

## Data Sources
- `useCentralizedLeads` for realtime active leads.
- `leadService.getManageLeadInsights()` for hot/cold/likely-close counters.
- `leadService.getManageLeadAnalytics()` for conversion, pipeline value, and stage distribution.

## Modules
- `hooks/useDashboardData.ts`: Composes lead stream + analytics into one typed view model.
- `utils/dashboardMetrics.ts`: Pure metric and mapping functions.
- `types/dashboard.ts`: Feature-specific dashboard contracts.
- `constants/dashboard.ts`: Stage metadata and quick-action definitions.

## UI Components
- `DashboardHero`
- `DashboardKpiGrid`
- `DashboardHotLeadsWidget`
- `DashboardPipelineWidget`
- `DashboardRecentActivityWidget`
- `DashboardQuickActionsWidget`
- `DashboardSkeleton`

## Rendering Entry
- `app/views/DashboardPage.tsx` composes all widgets and handles loading/fallback states.

## UX States
- Loading: skeleton layout with section placeholders.
- Partial failure: warning banner + computed fallback metrics.
- Empty data: contextual messages in each widget.

## Future Improvements
- Trend spark-lines per KPI.
- Source performance split (linkedin/reddit/website).
- Drilldown panel from pipeline stage bars.
- User-level layout personalization.
