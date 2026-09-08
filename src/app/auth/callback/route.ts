import { NextResponse } from "next/server";
import { safeRedirectPath } from "@/lib/security";
import { getSupabaseServer } from "@/lib/supabase/server";

function redirectWithAuthError(requestUrl: URL, path: string, message: string) {
  const target = new URL(path, requestUrl.origin);
  target.searchParams.set("auth_error", message);
  return NextResponse.redirect(target);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeRedirectPath(url.searchParams.get("next"), url.origin);

  if (!code) {
    return redirectWithAuthError(url, next, "missing_code");
  }

  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return redirectWithAuthError(url, next, error.message);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
