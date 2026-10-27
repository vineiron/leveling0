import { NextResponse } from "next/server";

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
