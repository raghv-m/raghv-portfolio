import "server-only";

import { getSignedIn, hasVerifiedMfa, type SignedIn } from "@/lib/session";

/**
 * Admin check for API routes: returns the signed-in admin, or null (callers answer 401).
 * Same bar as admin pages: Supabase session + admin role + TOTP verified for this session.
 * Pages use requireAdmin() from "@/lib/session", which redirects instead.
 */
export async function requireAdmin(): Promise<SignedIn | null> {
  const signedIn = await getSignedIn();
  if (!signedIn || signedIn.profile.role !== "admin") return null;
  return (await hasVerifiedMfa(signedIn)) ? signedIn : null;
}
