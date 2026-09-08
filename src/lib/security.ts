import { NextResponse } from "next/server";

// Rejects state-changing requests whose Origin doesn't match the Host. Browsers
// always send Origin on cross-origin POST/PATCH/DELETE, so a strict mismatch
// indicates the request didn't come from our own pages — i.e. CSRF.
export function checkOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  const host = request.headers.get("host");
  if (!host) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (originHost !== host) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

// Constrains a post-auth redirect target to a same-origin path. Resolving
// against the origin (instead of prefix-checking the string) catches every
// parser quirk that turns a "relative" value into another host, e.g. "//evil"
// and "/\\evil" (backslash is a slash for http(s) URLs).
export function safeRedirectPath(value: string | null, origin: string): string {
  if (!value?.startsWith("/")) return "/";
  let target: URL;
  try {
    target = new URL(value, origin);
  } catch {
    return "/";
  }
  if (target.origin !== origin) return "/";
  return target.pathname + target.search + target.hash;
}
