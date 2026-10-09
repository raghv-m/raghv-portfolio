/**
 * TOTP building blocks for the admin second factor. No framework or database code in here, so
 * it can be unit-tested directly (tests/mfa.test.ts). Storage and cookies live in ./index.ts.
 *
 *  - The TOTP secret is encrypted at rest with AES-256-GCM (key: MFA_ENCRYPTION_KEY).
 *  - Backup codes are random, shown once, and stored only as SHA-256 hashes.
 *  - A code is accepted once per 30-second step (lastUsedStep), so a code seen over someone's
 *    shoulder can't be replayed inside its window.
 */
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import speakeasy from "speakeasy";

export const TOTP_PERIOD_SECONDS = 30;
/** Accept the previous/next 30s step too, for clock drift. */
export const TOTP_WINDOW = 1;
export const BACKUP_CODE_COUNT = 10;
export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 15;

// ---------------------------------------------------------------------------------------------
// Keys
// ---------------------------------------------------------------------------------------------

/** MFA_ENCRYPTION_KEY: 32 random bytes, base64 (`openssl rand -base64 32`). */
export function parseMasterKey(value: string | undefined): Buffer {
  if (!value) throw new Error("MFA_ENCRYPTION_KEY is not set");
  const key = Buffer.from(value, "base64");
  if (key.length !== 32) throw new Error("MFA_ENCRYPTION_KEY must be 32 bytes, base64-encoded");
  return key;
}

/** Separate subkeys per purpose, so the cookie-signing key is never the encryption key. */
function subkey(master: Buffer, purpose: "secret-encryption" | "session-cookie"): Buffer {
  return createHmac("sha256", master).update(`raghv.dev mfa ${purpose}`).digest();
}

// ---------------------------------------------------------------------------------------------
// Secret encryption (AES-256-GCM): "v1.<iv>.<tag>.<ciphertext>", all base64url
// ---------------------------------------------------------------------------------------------

export function encryptSecret(plain: string, master: Buffer): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", subkey(master, "secret-encryption"), iv);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return ["v1", iv, cipher.getAuthTag(), ciphertext].map((p) => (typeof p === "string" ? p : p.toString("base64url"))).join(".");
}

export function decryptSecret(stored: string, master: Buffer): string {
  const [version, iv, tag, ciphertext] = stored.split(".");
  if (version !== "v1" || !iv || !tag || !ciphertext) throw new Error("Unrecognised MFA secret format");
  const decipher = createDecipheriv("aes-256-gcm", subkey(master, "secret-encryption"), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64url")), decipher.final()]).toString("utf8");
}

// ---------------------------------------------------------------------------------------------
// TOTP
// ---------------------------------------------------------------------------------------------

export function generateTotpSecret(accountEmail: string) {
  const secret = speakeasy.generateSecret({ length: 20, name: `raghv.dev (${accountEmail})`, issuer: "raghv.dev" });
  return { base32: secret.base32, otpauthUrl: secret.otpauth_url! };
}

export type TotpResult = { ok: true; step: number } | { ok: false; reason: "invalid" | "replayed" };

/**
 * Checks a 6-digit code. Returns the 30s step it matched so the caller can store it and refuse
 * the same (or an earlier) step next time.
 */
export function verifyTotp(
  base32Secret: string,
  token: string,
  lastUsedStep: number | null,
  nowMs: number = Date.now(),
): TotpResult {
  const clean = token.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(clean)) return { ok: false, reason: "invalid" };
  const nowSeconds = Math.floor(nowMs / 1000);
  const match = speakeasy.totp.verifyDelta({
    secret: base32Secret,
    encoding: "base32",
    token: clean,
    window: TOTP_WINDOW,
    time: nowSeconds,
    step: TOTP_PERIOD_SECONDS,
  });
  if (!match) return { ok: false, reason: "invalid" };
  const step = Math.floor(nowSeconds / TOTP_PERIOD_SECONDS) + match.delta;
  if (lastUsedStep !== null && step <= lastUsedStep) return { ok: false, reason: "replayed" };
  return { ok: true, step };
}

// ---------------------------------------------------------------------------------------------
// Backup codes: "XXXXX-XXXXX" from an unambiguous alphabet, ~50 bits each, stored hashed
// ---------------------------------------------------------------------------------------------

const BACKUP_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

export function generateBackupCodes(count: number = BACKUP_CODE_COUNT): string[] {
  return Array.from({ length: count }, () => {
    const bytes = randomBytes(10);
    const chars = Array.from(bytes, (b) => BACKUP_ALPHABET[b % BACKUP_ALPHABET.length]).join("");
    return `${chars.slice(0, 5)}-${chars.slice(5)}`;
  });
}

export function normaliseBackupCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function hashBackupCode(code: string): string {
  return createHash("sha256").update(normaliseBackupCode(code)).digest("hex");
}

/** Returns the remaining hashes if the code matched one (it's consumed), or null if it didn't. */
export function consumeBackupCode(code: string, hashes: string[]): string[] | null {
  const candidate = Buffer.from(hashBackupCode(code), "hex");
  let matchIndex = -1;
  // Compare against every hash so timing doesn't reveal which one matched.
  hashes.forEach((hash, index) => {
    const stored = Buffer.from(hash, "hex");
    if (stored.length === candidate.length && timingSafeEqual(stored, candidate) && matchIndex === -1) {
      matchIndex = index;
    }
  });
  return matchIndex === -1 ? null : hashes.filter((_, index) => index !== matchIndex);
}

// ---------------------------------------------------------------------------------------------
// Verified-session cookie: proves this Supabase session passed TOTP.
// "<sessionId>.<expiresAtSeconds>.<hmac>"; bound to the Supabase session_id, so it's worthless
// once that session ends or on any other session.
// ---------------------------------------------------------------------------------------------

export const MFA_COOKIE_NAME = "__Host-mfa";
export const MFA_COOKIE_MAX_AGE_SECONDS = 8 * 60 * 60;

function cookieMac(sessionId: string, userId: string, expiresAt: number, master: Buffer): string {
  return createHmac("sha256", subkey(master, "session-cookie"))
    .update(`${sessionId}.${userId}.${expiresAt}`)
    .digest("base64url");
}

export function signMfaCookie(sessionId: string, userId: string, master: Buffer, nowMs = Date.now()): string {
  const expiresAt = Math.floor(nowMs / 1000) + MFA_COOKIE_MAX_AGE_SECONDS;
  return `${sessionId}.${expiresAt}.${cookieMac(sessionId, userId, expiresAt, master)}`;
}

export function verifyMfaCookie(
  value: string | undefined,
  sessionId: string,
  userId: string,
  master: Buffer,
  nowMs = Date.now(),
): boolean {
  if (!value) return false;
  const [cookieSession, expiresRaw, mac] = value.split(".");
  const expiresAt = Number(expiresRaw);
  if (!cookieSession || !mac || !Number.isInteger(expiresAt)) return false;
  if (cookieSession !== sessionId || expiresAt < Math.floor(nowMs / 1000)) return false;
  const expected = Buffer.from(cookieMac(sessionId, userId, expiresAt, master));
  const given = Buffer.from(mac);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
