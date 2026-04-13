# leadsGrid Frontend

React + TypeScript frontend for the leadsGrid precision sales engine UI.

## Tech Stack
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- React Query
- Zustand
- Framer Motion
- Axios

## Current Capabilities
- App shell layout with sidebar + topbar
- Dashboard page with metric widgets and system panels
- Leads page with feature-module architecture
- Lead cards with high-intent glow effect
- Centralized API client and state store
- Feature documentation under `src/features/*/docs`

## Project Structure

```text
frontend/
  src/
    app/
      router.tsx
      shell/
      views/
    components/
      shared/
      ui/
    features/
      leads/
        components/
        hooks/
        services/
        types/
        docs/
    lib/
    store/
    styles/
    main.tsx
  index.html
  package.json
  tailwind.config.js
  vite.config.ts
```

## Setup

From `frontend/`:

```bash
npm install
```

## Run (Development)

```bash
npm run dev
```

Default local URL is shown by Vite (typically `http://localhost:5173`).

## Build

```bash
npm run build
```

Build output:
- `frontend/dist`

## API Configuration
Set API base URL using environment variable:

- `VITE_API_BASE_URL`

Example `.env` in `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Firestore Free-Plan Optimization
- Lead lists use hard cursor pagination in service and hook APIs (`loadMore` pattern) instead of full active-set reads.
- Lead bulk actions and CSV imports use batched writes to reduce write overhead.
- Duplicate checks use an indexed `dedupeKey` query to avoid full scans.
- Dashboard metrics are computed from centralized lead state to reduce repeated reads.
- Conversation autosave in AI chat is debounced to reduce high-frequency writes.
- AI history queries are bounded by default to prevent unbounded historical reads.

### Firestore Index Deployment
Required composite indexes are defined in `frontend/firestore.indexes.json`.

Deploy with Firebase CLI:

```bash
firebase deploy --only firestore:indexes
```

## Auth Integration Note
Current leads hook uses a development placeholder token. Next step is to wire full login flow and inject real JWT into service calls.

## Next Implementation Steps
- Add auth pages and protected route guard
- Replace development token with real auth context
- Add loading/error states across all feature views
- Connect AI message panel UI to backend `/api/ai/message`
