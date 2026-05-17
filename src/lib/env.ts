// Centralized, validated environment access. Fails fast with a clear
// message instead of passing `undefined` into the Supabase clients.
//
// The literal `process.env.NEXT_PUBLIC_*` references are kept verbatim so
// Next.js statically inlines them in every bundle (server, edge/middleware,
// client). These vars are public by definition — no server secret leaks.

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const SUPABASE_URL = required(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);

export const SUPABASE_PUBLISHABLE_KEY = required(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
