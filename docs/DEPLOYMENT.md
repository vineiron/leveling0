# Deployment Guide

This guide covers the production setup for leveling0.

## Requirements

- A Supabase project
- Google OAuth credentials for Supabase Auth
- A Postgres connection string
- A deployment platform that supports Next.js 16

## Environment Variables

Set every variable from `.env.example` in your deployment platform.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
DATABASE_URL=postgresql://...
```

### `NEXT_PUBLIC_SUPABASE_URL`

Your Supabase project URL.

### `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Your Supabase publishable key. This value is safe to expose to the browser.

Do not use `SUPABASE_SERVICE_ROLE_KEY`. The app does not need it.

### `DATABASE_URL`

Use this for the deployed app runtime.

For serverless platforms, use the Supabase transaction pooler URL when
applicable. The database client is configured with `{ prepare: false }`, which
is compatible with transaction pooling.

For Drizzle generation and migrations, use a direct or session-pooler
connection when possible.

## Supabase Auth Setup

### Google Provider

In the Supabase dashboard:

1. Go to **Authentication -> Providers -> Google**.
2. Enable Google.
3. Add your Google OAuth Client ID and Client Secret.

In Google Cloud Console, add this authorized redirect URI:

```text
https://<project-ref>.supabase.co/auth/v1/callback
```

### URL Configuration

In Supabase:

1. Go to **Authentication -> URL Configuration**.
2. Set **Site URL** to your production URL.
3. Add local and production callback URLs:

```text
http://localhost:3000/auth/callback
https://your-domain.com/auth/callback
```

## Database Migrations

Schema changes live in:

```text
src/db/schema.ts
```

Generate migrations with:

```bash
pnpm drizzle-kit generate --name=your_change_name
```

Apply migrations with:

```bash
pnpm drizzle-kit migrate
```

Review generated SQL before applying it.

## Production Checklist

- Supabase Google OAuth callback URLs include production.
- `DATABASE_URL` points to the intended production database connection.
- `.env` files are not committed.
- `SUPABASE_SERVICE_ROLE_KEY` is not configured.
- GitHub secret scanning and Dependabot alerts are enabled.
- Production dependency audit passes:

```bash
pnpm audit --prod --audit-level moderate
```

- TypeScript check passes:

```bash
pnpm exec tsc --noEmit
```

## Setup Troubleshooting

### Google sign-in redirects to an error or loops

Most OAuth failures are URL mismatches. Check all three places:

1. **Google Cloud Console -> Credentials -> OAuth client -> Authorized redirect URIs**
   must include the Supabase callback, not your app URL:

```text
https://<project-ref>.supabase.co/auth/v1/callback
```

2. **Supabase -> Authentication -> URL Configuration -> Site URL** should be the
   app origin users land on (`http://localhost:3000` locally, your production
   domain in production).

3. **Supabase -> Authentication -> URL Configuration -> Redirect URLs** must
   include the app callback paths:

```text
http://localhost:3000/auth/callback
https://your-domain.com/auth/callback
```

Common mistakes:

- Putting `http://localhost:3000/auth/callback` in Google Cloud instead of the
  Supabase `/auth/v1/callback` URL.
- Enabling Google in Supabase but forgetting the Client ID / Client Secret.
- Using a production Site URL while testing on localhost (or the reverse).
- Missing the local or production entry in Redirect URLs after a domain change.

### Sign-in succeeds, then returns to the app still signed out

- Confirm `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` match the same Supabase project that
  has Google enabled.
- Confirm cookies are not blocked for the app origin.
- Confirm `/auth/callback` is reachable and listed in Supabase Redirect URLs.
- After a successful exchange, the app only accepts same-origin relative
  `next` paths. A crafted external `next` value is ignored and falls back to
  `/`.

### Signed-in board stays empty or API calls return 401

- You are signed in to Supabase, but quest APIs still require a valid session
  cookie on `/api/quests*`.
- Confirm `DATABASE_URL` points at the database for that same project.
- Confirm migrations have been applied (`pnpm drizzle-kit migrate`).
- A wrong or empty `DATABASE_URL` fails server-side; it will not fall back to
  localStorage for signed-in mode.

### Local anonymous mode works, signed-in sync does not

That is expected until auth and database are configured. Anonymous quests live
in browser `localStorage` under `leveling0:items:v1` and are not uploaded
automatically when you later sign in.

### `pnpm drizzle-kit` fails against the pooler URL

Use a direct or session-pooler connection for generate/migrate when possible.
Keep the transaction pooler URL for the deployed Next.js runtime, which uses
`{ prepare: false }`.

## Security Notes

See `docs/SECURITY_MODEL.md` for trust boundaries and authorization details.
