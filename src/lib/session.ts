import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { MFA_COOKIE_NAME, mfaMasterKey, verifyMfaCookie } from "@/lib/mfa";
import type { ProfileRow } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Who is signed in, for Server Components, Server Actions and Route Handlers.
 *
 * Identity comes from supabase.auth.getClaims(), which verifies the JWT signature (never from
 * getSession(), which trusts the cookie as-is). The profile row is read through RLS as the user.
 */

export type Profile = Pick<ProfileRow, "id" | "email" | "full_name" | "role" | "tenant_id" | "avatar_url">;

export type SignedIn = { userId: string; sessionId: string; email: string; profile: Profile };

export async function getSignedIn(): Promise<SignedIn | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, tenant_id, avatar_url")
    .eq("id", claims.sub)
    .maybeSingle();
  if (!profile) return null;

  return {
    userId: claims.sub,
    sessionId: String(claims.session_id ?? ""),
    email: String(claims.email ?? profile.email),
    profile,
  };
}

/** Portal pages: any signed-in client (or admin). */
export async function requirePortalUser(): Promise<SignedIn> {
  const signedIn = await getSignedIn();
  if (!signedIn) redirect("/auth/login?next=/portal");
  return signedIn;
}

/** True when this exact Supabase session has passed the admin TOTP step. */
export async function hasVerifiedMfa(signedIn: SignedIn): Promise<boolean> {
  if (!signedIn.sessionId) return false;
  const cookieStore = await cookies();
  return verifyMfaCookie(cookieStore.get(MFA_COOKIE_NAME)?.value, signedIn.sessionId, signedIn.userId, mfaMasterKey());
}

/**
 * Admin pages and every admin mutation: signed in, role admin, AND TOTP verified for this
 * session. Non-admins get a 404-style redirect home; admins without the TOTP step go to it.
 */
export async function requireAdmin(): Promise<SignedIn> {
  const signedIn = await getSignedIn();
  if (!signedIn) redirect("/auth/login?next=/admin");
  if (signedIn.profile.role !== "admin") redirect("/");
  if (!(await hasVerifiedMfa(signedIn))) redirect("/auth/mfa?next=/admin");
  return signedIn;
}
