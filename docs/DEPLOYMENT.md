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

## Security Notes

See `docs/SECURITY_MODEL.md` for trust boundaries and authorization details.
