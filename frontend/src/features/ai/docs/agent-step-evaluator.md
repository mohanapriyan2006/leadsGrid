# Agent Step Evaluator Phase

## Overview
This phase adds backend step-quality evaluation and frontend rendering of evaluation signals in agent execution views.

## Backend
- Added a dedicated evaluator service to score each step result and identify quality issues.
- Each `AgentStep` now includes optional `evaluation` metadata:
  - `score` (0-100)
  - `quality` (`excellent`, `good`, `needs_improvement`)
  - `issues` (list of detected risks)
  - `improvement` (suggested fix path)
- `AgentRunService` now evaluates every step and stores summary quality in `step.result`.

## Frontend
- Extended `AgentStep` type with optional `evaluation` metadata.
- Execution timeline and plan card display evaluator score and top issues.

## Result
- Runs now provide both execution status and quality intelligence.
- Quality metadata is included in persisted snapshots through the existing run-state persistence flow.
