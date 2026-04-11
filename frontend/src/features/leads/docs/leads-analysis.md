# Leads Analysis Feature

## Overview
Leads Analysis adds a dedicated analytics tab to Manage Leads so users can decide where to focus before CRM handoff.

## Scope
- frontend-only analytics
- frontend rule-based prediction engine
- frontend deterministic AI insights
- no backend dependency

## Data Source
- uses centralized lead stream from useCentralizedLeads
- filters by time range, source, and stage

## KPI Cards
- total leads
- qualified leads percent
- average lead score
- conversion to CRM percent
- high-intent lead count

## Charts
- lead score distribution
- source performance chart
- stage conversion funnel
- lead velocity chart

## Prediction Panel
- likely to convert
- leads to discard
- expected CRM conversions
- high ROI leads

## AI Insights Panel
- three insights
- three actions
- one warning
- best leads to contact today

## Notes
Source segmentation includes CSV and Manual heuristics for website-sourced records to preserve practical filtering in frontend-only mode.
