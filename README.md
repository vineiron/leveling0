# leveling0

A compact quest board for keeping personal work, errands, and loose ideas from
turning into a pile.

leveling0 is intentionally simple: three columns, tags, due dates, markdown
details, private notes, search, command-palette actions, drag-and-drop
reordering, and optional Google sign-in for syncing across devices. Anonymous
users can use the board locally in the browser; signed-in users sync quests to
Postgres.

## Project Status

leveling0 is an early personal project. The core board flow works, but APIs,
database shape, deployment assumptions, and contribution guidelines may change
as the project matures.

## Stack

- **Next.js 16** App Router, React 19, React Compiler, TypeScript, Tailwind v4,
  Biome
- **Supabase Auth** with Google OAuth via `@supabase/ssr`
- **Drizzle ORM** and `postgres-js` for Postgres persistence
- **dnd-kit** for board reordering
- **Zod** for API request validation
- **react-markdown** and `remark-gfm` for quest details and notes

## Documentation

- `docs/ARCHITECTURE.md` - app boundaries, route layout, data flow, and key
  files.
- `docs/DATABASE.md` - database schema, ownership model, migrations, and
  validation limits.
- `docs/DEPLOYMENT.md` - production environment, Supabase OAuth, and migration
  setup.
- `docs/SECURITY_MODEL.md` - trust boundaries, data visibility, and known gaps.

## 1. Environment

Copy the example environment file, then replace the placeholders with your own
Supabase and Postgres values:

```bash
cp .env.example .env
```

```dotenv
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
DATABASE_URL=...
```

`NEXT_PUBLIC_*` values are public by design. Do not put secrets in them. This
app does not require `SUPABASE_SERVICE_ROLE_KEY`; adding one increases leak
risk and is unnecessary for the current architecture.

## 2. Install Dependencies

```bash
pnpm install
```

## 3. Database Migration

The schema lives in `src/db/schema.ts` and stores one user-owned `quests` table.
Generate and apply migrations with Drizzle:

```bash
pnpm drizzle-kit generate --name=quests
pnpm drizzle-kit migrate
```

Review generated SQL before applying it.

## 4. Supabase Google OAuth

1. In **Supabase Dashboard -> Authentication -> Providers -> Google**, enable
   Google and add your OAuth Client ID and Client Secret.
2. In **Google Cloud Console -> Credentials -> OAuth client**, add:

```text
https://<project-ref>.supabase.co/auth/v1/callback
```

3. In **Supabase Dashboard -> Authentication -> URL Configuration**, set the
   Site URL and add callback URLs:

```text
http://localhost:3000/auth/callback
https://your-domain.com/auth/callback
```

## 5. Run

```bash
pnpm dev
```

Type-check:

```bash
pnpm exec tsc --noEmit
```

## Architecture Notes

- Anonymous mode stores quests in browser `localStorage` under
  `leveling0:items:v1`.
- Signed-in mode uses Supabase Auth for identity and calls `/api/quests`
  endpoints for persistence.
- API route handlers authenticate with `supabase.auth.getUser()`, then scope
  every read and mutation by `quests.user_id`.
- Drizzle connects directly to Postgres with `DATABASE_URL`, so Supabase RLS is
  not the runtime authorization boundary.
- Middleware refreshes the Supabase session cookie; it is not the only security
  boundary.
- State-changing API routes reject cross-origin browser requests with an Origin
  versus Host check.

## Security Notes

- `.env` files are ignored and must never be committed.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is safe to expose to the browser;
  service-role keys are not.
- Quests are private to their owner after sign-in.
- Local anonymous quests stay in the user's browser and are not uploaded until a
  signed-in remote flow explicitly creates remote quests.
- See `docs/SECURITY_MODEL.md` for trust boundaries and known gaps.
- See `SECURITY.md` for responsible vulnerability reporting.

## Known Limitations

- Dedicated rate limiting is not implemented yet.
- Anonymous local quests are browser/device-local.
- There is no built-in data export/import flow yet.
- Supabase RLS is not configured as defense-in-depth because runtime access uses
  a direct Postgres connection.
