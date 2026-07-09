# Security Policy

## Reporting A Vulnerability

Please do not open public issues for suspected vulnerabilities.

Report security issues privately to the project maintainer. Include:

- A short description of the issue and impact
- Reproduction steps or proof of concept
- Affected routes, files, or configuration
- Any relevant logs with secrets removed

The maintainer should confirm receipt, investigate, and publish a fix before
public disclosure.

## Scope

In scope:

- Authentication or authorization bypasses
- Exposure of private signed-in quests
- Server-side secret leaks
- Stored or reflected cross-site scripting
- Cross-site request forgery on state-changing quest endpoints
- Abuse paths that can cause unusual resource consumption

Out of scope:

- Vulnerabilities in a local development environment caused by leaked local
  `.env` files
- Social engineering
- Issues requiring physical access to a contributor's device
- Denial-of-service reports without a practical mitigation
- Loss of anonymous browser-local quests caused by clearing browser storage

## Security Model

- `.env` files are ignored and must never be committed.
- `NEXT_PUBLIC_*` values are public by design. Do not put secrets in them.
- The app does not require `SUPABASE_SERVICE_ROLE_KEY`.
- Drizzle uses a direct Postgres connection, so Supabase RLS is not the runtime
  security boundary. Owner checks in API route handlers are required.
- Anonymous quests are stored in browser `localStorage`, not on the server.
- Signed-in quest endpoints should return only quests owned by the authenticated
  user.

See `docs/SECURITY_MODEL.md` for the full security model.
