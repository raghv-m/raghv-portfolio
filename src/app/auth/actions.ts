"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { logAudit } from "@/lib/audit";
import {
  confirmEnrollment,
  isMfaEnabled,
  MFA_COOKIE_MAX_AGE_SECONDS,
  MFA_COOKIE_NAME,
  mfaMasterKey,
  signMfaCookie,
  startEnrollment,
  verifyLoginCode,
} from "@/lib/mfa";
import { rateLimit } from "@/lib/rateLimit";
import { getSignedIn } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FormState = { error?: string; message?: string } | undefined;

/** Only same-site relative paths: blocks open redirects like ?next=//evil.com or https://... */
function safeNext(value: FormDataEntryValue | null, fallback: string): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}

/**
 * Where emailed links should come back to: the site the request came from (localhost, a Vercel
 * preview, or raghv.dev), so a reset requested locally doesn't land on production. Supabase only
 * honours redirect URLs on its allow-list (set in the dashboard), so a spoofed Host header can't
 * send the link elsewhere; it falls back to the configured site URL instead.
 */
async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) {
    const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://raghv.dev").replace(/\/$/, "");
}

const credentials = z.object({
  email: z.email().max(320),
  password: z.string().min(1).max(200),
});

// ---------------------------------------------------------------------------------------------
// Sign in / out
// ---------------------------------------------------------------------------------------------

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = credentials.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "Enter your email and password." };
  const email = parsed.data.email.toLowerCase();

  const limit = await rateLimit(email, "login");
  if (!limit.success) return { error: "Too many attempts. Try again in 15 minutes." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: parsed.data.password });
  // Same message for unknown email and wrong password, so the form can't be used to find accounts.
  if (error) return { error: "That email and password don't match." };

  const signedIn = await getSignedIn();
  if (!signedIn) {
    await supabase.auth.signOut();
    return { error: "This account isn't set up yet. Contact Raghav." };
  }

  await logAudit({ actorId: signedIn.userId, action: "auth.login", resourceType: "session" });
  if (signedIn.profile.role === "admin") {
    redirect(`/auth/mfa?next=${encodeURIComponent(safeNext(formData.get("next"), "/admin"))}`);
  }
  redirect(safeNext(formData.get("next"), "/portal"));
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  (await cookies()).delete(MFA_COOKIE_NAME);
  redirect("/auth/login");
}

// ---------------------------------------------------------------------------------------------
// Password reset (Supabase emails a one-time link to /auth/callback)
// ---------------------------------------------------------------------------------------------

export async function requestPasswordResetAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = z.email().safeParse(formData.get("email"));
  if (!email.success) return { error: "Enter a valid email." };

  const limit = await rateLimit(`reset:${email.data.toLowerCase()}`, "login");
  if (limit.success) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.resetPasswordForEmail(email.data.toLowerCase(), {
      redirectTo: `${await siteOrigin()}/auth/callback?next=/auth/reset-password`,
    });
  }
  // Always the same answer, whether or not the account exists.
  return { message: "If that email has an account, a reset link is on its way. It expires in an hour." };
}

const newPassword = z
  .string()
  .min(12, "Use at least 12 characters.")
  .max(200)
  .refine((value) => new Set(value).size >= 6, "That password is too repetitive.");

export async function updatePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = newPassword.safeParse(formData.get("password"));
  if (!password.success) return { error: password.error.issues[0]?.message };
  if (formData.get("password") !== formData.get("confirm")) return { error: "The two passwords don't match." };

  const signedIn = await getSignedIn();
  if (!signedIn) return { error: "Your reset link has expired. Request a new one." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: password.data });
  if (error) return { error: error.message };

  await logAudit({ actorId: signedIn.userId, action: "auth.password_changed", resourceType: "user", resourceId: signedIn.userId });
  redirect(signedIn.profile.role === "admin" ? "/auth/mfa?next=/admin" : "/portal");
}

// ---------------------------------------------------------------------------------------------
// Admin TOTP
// ---------------------------------------------------------------------------------------------

async function requireAdminSession() {
  const signedIn = await getSignedIn();
  if (!signedIn) redirect("/auth/login?next=/admin");
  if (signedIn.profile.role !== "admin") redirect("/portal");
  return signedIn;
}

async function setVerifiedCookie(sessionId: string, userId: string) {
  (await cookies()).set(MFA_COOKIE_NAME, signMfaCookie(sessionId, userId, mfaMasterKey()), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MFA_COOKIE_MAX_AGE_SECONDS,
  });
}

export type EnrollmentState =
  | { step: "scan"; qrCodeDataUrl: string; manualKey: string; error?: string }
  | { step: "done"; backupCodes: string[] }
  | { step: "start"; error?: string };

/** One action for the whole setup form: intent=start shows the QR code, intent=confirm checks the code. */
export async function mfaEnrollmentAction(prev: EnrollmentState, formData: FormData): Promise<EnrollmentState> {
  return formData.get("intent") === "start" ? startMfaEnrollmentAction() : confirmMfaEnrollmentAction(prev, formData);
}

async function startMfaEnrollmentAction(): Promise<EnrollmentState> {
  const signedIn = await requireAdminSession();
  if (await isMfaEnabled(signedIn.userId)) return { step: "start", error: "Two-factor is already on." };
  const { qrCodeDataUrl, manualKey } = await startEnrollment(signedIn.userId, signedIn.email);
  return { step: "scan", qrCodeDataUrl, manualKey };
}

async function confirmMfaEnrollmentAction(
  prev: EnrollmentState,
  formData: FormData,
): Promise<EnrollmentState> {
  const signedIn = await requireAdminSession();
  const code = String(formData.get("code") ?? "");
  const backupCodes = await confirmEnrollment(signedIn.userId, code);
  if (!backupCodes) {
    return prev.step === "scan"
      ? { ...prev, error: "That code didn't match. Check the time on your phone and try the newest code." }
      : { step: "start", error: "Start setup again." };
  }
  await setVerifiedCookie(signedIn.sessionId, signedIn.userId);
  await logAudit({ actorId: signedIn.userId, action: "auth.mfa_enabled", resourceType: "user", resourceId: signedIn.userId });
  return { step: "done", backupCodes };
}

export async function verifyMfaAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const signedIn = await requireAdminSession();
  const code = String(formData.get("code") ?? "").trim();
  if (!code) return { error: "Enter the 6-digit code or a backup code." };

  const result = await verifyLoginCode(signedIn.userId, code);
  if (!result.ok) {
    await logAudit({ actorId: signedIn.userId, action: "auth.mfa_failed", resourceType: "session", changes: { reason: result.reason } });
    if (result.reason === "locked") return { error: "Too many wrong codes. Two-factor is locked for 15 minutes." };
    if (result.reason === "not_enrolled") redirect("/auth/mfa");
    return { error: "That code didn't work." };
  }

  await setVerifiedCookie(signedIn.sessionId, signedIn.userId);
  await logAudit({
    actorId: signedIn.userId,
    action: result.usedBackupCode ? "auth.mfa_backup_code_used" : "auth.mfa_verified",
    resourceType: "session",
    changes: result.usedBackupCode ? { backup_codes_left: result.backupCodesLeft } : null,
  });
  redirect(safeNext(formData.get("next"), "/admin"));
}
