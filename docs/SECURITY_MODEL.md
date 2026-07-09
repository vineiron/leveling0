# Security Model

This document explains the intended security boundaries for leveling0.

## Summary

- Anonymous quests are stored locally in the user's browser.
- Signed-in quests are private to the authenticated Supabase user.
- Authentication uses Supabase Auth with cookie-backed SSR clients.
- Authorization is enforced in application code.
- Drizzle connects directly to Postgres, so Supabase Row Level Security is not
  the runtime authorization boundary.

## Trust Boundaries

### Browser

The browser can create, edit, search, filter, reorder, and render quests. It can
also store anonymous quests in `localStorage`. Browser state is never trusted
for authorization.

Markdown is rendered through React components. User-provided markdown should not
be rendered as raw HTML.

### API Routes

Quest API routes are public HTTP endpoints from a security perspective. Each
route must authenticate the user and perform owner checks server-side.

State-changing routes also call `checkOrigin(request)`, which rejects browser
requests whose `Origin` host does not match the request `Host`.

Owner-scoped reads and writes must include the authenticated user id, usually as
`where user_id = userId`.

### Middleware

`src/middleware.ts` refreshes Supabase session cookies. It is not the
authorization boundary for quest data.

### Database

The app uses Drizzle with `postgres-js` through `DATABASE_URL`. This direct
connection bypasses Supabase RLS. The app must not rely on RLS to protect
runtime data access.

RLS can still be added later as defense-in-depth for other access paths, but it
does not replace application-level owner checks.

## Data Visibility

### Anonymous Quests

Anonymous quests are stored in browser `localStorage` under
`leveling0:items:v1`. They are visible to anyone with access to that browser
profile and are removed if the user clears site data.

### Signed-In Quests

Signed-in quests should only be readable and writable by their owner.

Owner-only data includes:

- title
- detail
- note
- tags
- due date
- status and position
- timestamps

## Environment Variables

`.env` files are ignored and must never be committed.

`NEXT_PUBLIC_*` values are public by design and must not contain secrets.

The app intentionally does not require `SUPABASE_SERVICE_ROLE_KEY`. Adding it
would increase secret leak risk and is unnecessary for the current architecture.

## Current Hardening

- API route handlers call `supabase.auth.getUser()` before remote data access.
- Quest reads, updates, deletes, and reorders are scoped by authenticated user
  id.
- OAuth callback `next` redirects are constrained to same-origin relative paths.
- Request bodies are validated with Zod and `.strict()`.
- State-changing quest endpoints reject cross-origin browser requests.
- Baseline security headers and a practical Content Security Policy are
  configured in `next.config.ts` (inline scripts/styles allowed for the theme
  script and Next runtime; Supabase origins and Google avatar hosts allowlisted).
- Server Action request bodies are capped at `256kb` for future action routes.
- The Postgres client uses `{ prepare: false }` for pooler compatibility.
- `.env*` files are ignored except `.env.example`.
- GitHub issue templates direct security reports away from public issues.
- API authorization, CSRF origin checks, and validation have Vitest coverage
  under `src/**/*.test.ts`.

## Known Gaps

- Dedicated rate limiting is not implemented yet.
- Supabase RLS is not configured as defense-in-depth yet.
- Anonymous local quests are not encrypted at rest in browser storage.
