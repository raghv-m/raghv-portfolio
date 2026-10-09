import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Landing point for the links in Supabase emails (password reset, portal invites). The email
 * template links here with ?token_hash=...&type=recovery, which works in any browser, unlike the
 * PKCE code flow that only works in the browser that asked for the email. Verifies the one-time
 * token, sets the session cookie, then continues to ?next (same-site paths only).
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const nextParam = params.get("next") ?? "/auth/reset-password";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/auth/reset-password";

  if (tokenHash && type) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  }
  return NextResponse.redirect(new URL("/auth/forgot-password?expired=1", request.url));
}
