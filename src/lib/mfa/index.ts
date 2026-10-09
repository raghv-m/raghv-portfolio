import "server-only";

import QRCode from "qrcode";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

import {
  consumeBackupCode,
  decryptSecret,
  encryptSecret,
  generateBackupCodes,
  generateTotpSecret,
  hashBackupCode,
  LOCKOUT_MINUTES,
  MAX_FAILED_ATTEMPTS,
  parseMasterKey,
  verifyTotp,
} from "./core";

/**
 * Admin TOTP, stored in public.mfa_secrets (service role only; RLS has no policies on it).
 * Flow: startEnrollment → user scans QR → confirmEnrollment(code) → backup codes shown once.
 * At sign-in: verifyLoginCode(code or backup code) → caller sets the verified-session cookie.
 */

type MfaRow = {
  user_id: string;
  secret_encrypted: string;
  backup_code_hashes: string[];
  enabled: boolean;
  last_used_step: number | null;
  failed_attempts: number;
  locked_until: string | null;
};

const masterKey = () => parseMasterKey(process.env.MFA_ENCRYPTION_KEY);
const table = () => getSupabaseAdmin().from("mfa_secrets");

async function loadRow(userId: string): Promise<MfaRow | null> {
  const { data, error } = await table().select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data as MfaRow | null;
}

export async function isMfaEnabled(userId: string): Promise<boolean> {
  return (await loadRow(userId))?.enabled === true;
}

/**
 * Creates (or replaces) a pending secret and returns the QR code to scan. Refuses once MFA is
 * already enabled: changing an active second factor needs its own flow that first proves the
 * current one, so a stolen password alone can't re-enroll.
 */
export async function startEnrollment(userId: string, email: string) {
  const existing = await loadRow(userId);
  if (existing?.enabled) throw new Error("Two-factor authentication is already enabled");

  const { base32, otpauthUrl } = generateTotpSecret(email);
  const { error } = await table().upsert(
    {
      user_id: userId,
      secret_encrypted: encryptSecret(base32, masterKey()),
      backup_code_hashes: [],
      enabled: false,
      last_used_step: null,
      failed_attempts: 0,
      locked_until: null,
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;

  return { qrCodeDataUrl: await QRCode.toDataURL(otpauthUrl), manualKey: base32 };
}

/** Confirms the pending secret with a first code. Returns the backup codes (show them once). */
export async function confirmEnrollment(userId: string, code: string): Promise<string[] | null> {
  const row = await loadRow(userId);
  if (!row || row.enabled) return null;

  const result = verifyTotp(decryptSecret(row.secret_encrypted, masterKey()), code, row.last_used_step);
  if (!result.ok) return null;

  const backupCodes = generateBackupCodes();
  const { error } = await table()
    .update({
      enabled: true,
      last_used_step: result.step,
      backup_code_hashes: backupCodes.map(hashBackupCode),
      failed_attempts: 0,
    })
    .eq("user_id", userId)
    .eq("enabled", false);
  if (error) throw error;
  return backupCodes;
}

export type LoginCheck =
  | { ok: true; usedBackupCode: boolean; backupCodesLeft: number }
  | { ok: false; reason: "not_enrolled" | "locked" | "invalid" };

/** Checks a TOTP code or a backup code at sign-in, with lockout after repeated failures. */
export async function verifyLoginCode(userId: string, input: string): Promise<LoginCheck> {
  const row = await loadRow(userId);
  if (!row?.enabled) return { ok: false, reason: "not_enrolled" };
  if (row.locked_until && new Date(row.locked_until) > new Date()) return { ok: false, reason: "locked" };

  const isBackupCode = /[a-z]/i.test(input);
  if (isBackupCode) {
    const remaining = consumeBackupCode(input, row.backup_code_hashes);
    if (remaining) {
      // Conditional on the old list so two simultaneous uses of the same code can't both win.
      const { data, error } = await table()
        .update({ backup_code_hashes: remaining, failed_attempts: 0, locked_until: null })
        .eq("user_id", userId)
        .eq("backup_code_hashes", row.backup_code_hashes)
        .select("user_id");
      if (error) throw error;
      if (data?.length) return { ok: true, usedBackupCode: true, backupCodesLeft: remaining.length };
    }
  } else {
    const result = verifyTotp(decryptSecret(row.secret_encrypted, masterKey()), input, row.last_used_step);
    if (result.ok) {
      // Only advance if nobody used a later step in the meantime (replay race).
      let update = table()
        .update({ last_used_step: result.step, failed_attempts: 0, locked_until: null })
        .eq("user_id", userId);
      update = row.last_used_step === null ? update.is("last_used_step", null) : update.lt("last_used_step", result.step);
      const { data, error } = await update.select("user_id");
      if (error) throw error;
      if (data?.length) return { ok: true, usedBackupCode: false, backupCodesLeft: row.backup_code_hashes.length };
    }
  }

  const failed = row.failed_attempts + 1;
  const lock = failed >= MAX_FAILED_ATTEMPTS;
  await table()
    .update({
      failed_attempts: lock ? 0 : failed,
      locked_until: lock ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000).toISOString() : row.locked_until,
    })
    .eq("user_id", userId);
  return { ok: false, reason: lock ? "locked" : "invalid" };
}

export { MFA_COOKIE_MAX_AGE_SECONDS, MFA_COOKIE_NAME, signMfaCookie, verifyMfaCookie } from "./core";
export { masterKey as mfaMasterKey };
