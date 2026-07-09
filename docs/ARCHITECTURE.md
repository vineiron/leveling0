# Architecture

leveling0 is a personal quest board with anonymous local storage and optional
signed-in sync.

## System Overview

The app is a Next.js App Router application with a small API layer:

- **Next.js / React** renders the landing page, quest board, API routes, and
  Supabase OAuth callback.
- **Supabase Auth** provides Google OAuth identity and cookie-backed sessions.
- **Drizzle ORM** talks to Postgres through `postgres-js`.
- **dnd-kit** powers drag-and-drop movement between quest columns.
- **Zod** validates all state-changing quest API requests.

Postgres is the persistence layer for signed-in users. Supabase is currently
used for auth identity, not for runtime data access through Supabase database
client APIs.

## Runtime Boundaries

### Browser

The browser renders the board, stores anonymous quests in `localStorage`, opens
modals and the command palette, renders markdown, and sends API requests for
signed-in users. Browser state is treated as untrusted.

### Next.js Server

API route handlers under `src/app/api/quests/` authenticate the Supabase user,
validate request bodies, check request origins for mutations, and scope every
database operation by the authenticated user id.

`src/middleware.ts` refreshes the Supabase session cookie. It is helpful for
session continuity, but API routes still perform their own authentication.

### Database

The app uses Drizzle with a direct Postgres connection. This means Supabase Row
Level Security is not the runtime authorization boundary. Owner checks happen in
application code before private rows are returned or changed.

## Route Layout

- `src/app/page.tsx` is the public landing page at `/`.
- `src/app/quests/page.tsx` renders the board.
- `src/app/api/quests/route.ts` lists and creates signed-in quests.
- `src/app/api/quests/[id]/route.ts` updates and deletes signed-in quests.
- `src/app/api/quests/reorder/route.ts` persists signed-in board order.
- `src/app/auth/callback/route.ts` exchanges Supabase OAuth codes.
- `src/app/design/page.tsx` shows the local design system.

## Data Flow

### Anonymous Local Mode

1. The user opens the board without signing in.
2. `useQuests` selects `localStore`.
3. Quest reads and writes use browser `localStorage`.
4. No server persistence occurs.

### Signed-In Remote Mode

1. The user signs in with Google through Supabase Auth.
2. `useQuests` selects `apiStore`.
3. The browser calls `/api/quests` endpoints.
4. API routes call `getCurrentUserId()`.
5. Drizzle queries include `where quests.user_id = userId`.

### Reordering

1. Drag-over updates the board optimistically in memory for responsive feedback.
2. Drop commits the affected column order to `/api/quests/reorder`.
3. The route performs one bulk `UPDATE ... FROM (VALUES ...)` scoped by
   `quests.user_id`.
4. If persistence fails, the client refetches to resync state.

## Authorization Model

Private signed-in data access follows this rule:

```text
authenticated user id + quest id -> owner-scoped query
```

Important files:

- `src/lib/supabase/server.ts` reads the Supabase user from the server session.
- `src/app/api/quests/route.ts` scopes list and create flows.
- `src/app/api/quests/[id]/route.ts` scopes update and delete flows.
- `src/app/api/quests/reorder/route.ts` scopes bulk reorder writes.
- `src/lib/security.ts` rejects cross-origin state-changing browser requests.
- `docs/SECURITY_MODEL.md` documents trust boundaries and known gaps.

## Key Files

- `src/app/` - routes, metadata, API handlers, and global styles.
- `src/components/` - board UI, modals, command palette, and shared primitives.
- `src/lib/auth/` - client auth provider and sign-in/sign-out helpers.
- `src/lib/quests/` - quest types, storage adapters, serialization, and hooks.
- `src/lib/supabase/` - browser and server Supabase clients.
- `src/db/schema.ts` - Drizzle schema for persisted quest data.
- `src/db/client.ts` - Postgres client and Drizzle instance.
- `src/middleware.ts` - Supabase session refresh.
