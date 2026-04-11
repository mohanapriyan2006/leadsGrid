# Responsive Layout System

## Overview
Defines the responsive layout baseline for shared shell, page containers, and table behavior across PitchPilot.

## Scope
- Shell behavior: desktop sidebar + mobile drawer navigation
- Page wrapper behavior: consistent viewport-safe scrolling and spacing
- Data table behavior: card mode on mobile, grid table on md+

## Breakpoint Contract
- `base`: mobile-first styles (320px+)
- `sm`: 640px+
- `md`: 768px+
- `lg`: 1024px+
- `xl`: 1280px+
- `2xl`: 1536px+

## Core Components
- `components/ui/ResponsivePageLayout.tsx`
  - Provides background + scroll container + responsive padding.
- `components/shared/MobileNavDrawer.tsx`
  - Provides route access on mobile devices.
- `components/shared/Topbar.tsx`
  - Provides mobile menu trigger and responsive search/profile controls.

## Page Container Rules
- Use `ResponsivePageLayout` for route-level pages with backgrounds.
- Avoid hardcoded heights like `h-[calc(100vh-100px)]`.
- Use `.page-scroll-container` for viewport-safe scroll regions.

## Table Rules
- For narrow screens (`md` and below), show stacked cards.
- For `md+`, show full table grid.
- Keep action buttons available in both modes.

## Current Adopters
- Dashboard page
- CRM page
- Manage Leads page
- CRM table view
- Manage Leads table view

## Future Improvements
- Introduce reusable responsive table primitive to remove duplicate card/table rendering.
- Add storybook snapshots for each breakpoint.
- Add Playwright viewport regression tests for critical routes.
