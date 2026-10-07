// Run: npm run test:unit  (Node's built-in test runner with native TypeScript stripping)
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { test } from "node:test";
import speakeasy from "speakeasy";

import {
  consumeBackupCode,
  decryptSecret,
  encryptSecret,
  generateBackupCodes,
  generateTotpSecret,
  hashBackupCode,
  parseMasterKey,
  signMfaCookie,
  TOTP_PERIOD_SECONDS,
  verifyMfaCookie,
  verifyTotp,
} from "../src/lib/mfa/core.ts";

const master = randomBytes(32);

test("master key must be 32 bytes of base64", () => {
  assert.throws(() => parseMasterKey(undefined));
  assert.throws(() => parseMasterKey(randomBytes(16).toString("base64")));
  assert.equal(parseMasterKey(master.toString("base64")).length, 32);
});

test("secret round-trips through AES-GCM and is not stored in the clear", () => {
  const { base32 } = generateTotpSecret("me@raghv.dev");
  const stored = encryptSecret(base32, master);
  assert.ok(!stored.includes(base32));
  assert.notEqual(encryptSecret(base32, master), stored, "fresh IV each time");
  assert.equal(decryptSecret(stored, master), base32);
});

test("tampered ciphertext or wrong key is rejected", () => {
  const stored = encryptSecret("JBSWY3DPEHPK3PXP", master);
  const parts = stored.split(".");
  parts[3] = Buffer.from("tampered").toString("base64url");
  assert.throws(() => decryptSecret(parts.join("."), master));
  assert.throws(() => decryptSecret(stored, randomBytes(32)));
});

test("valid TOTP is accepted once; replay in the same step is refused", () => {
  const { base32 } = generateTotpSecret("me@raghv.dev");
  const now = Date.now();
  const token = speakeasy.totp({ secret: base32, encoding: "base32", time: Math.floor(now / 1000) });
  const first = verifyTotp(base32, token, null, now);
  assert.equal(first.ok, true);
  assert.ok(first.ok);
  const replay = verifyTotp(base32, token, first.step, now);
  assert.deepEqual(replay, { ok: false, reason: "replayed" });
});

test("codes from one step of drift pass, two steps fail", () => {
  const { base32 } = generateTotpSecret("me@raghv.dev");
  const now = Date.now();
  const at = (offsetSteps: number) =>
    speakeasy.totp({ secret: base32, encoding: "base32", time: Math.floor(now / 1000) + offsetSteps * TOTP_PERIOD_SECONDS });
  assert.equal(verifyTotp(base32, at(-1), null, now).ok, true);
  assert.equal(verifyTotp(base32, at(-3), null, now).ok, false);
});

test("malformed or wrong codes are refused", () => {
  const { base32 } = generateTotpSecret("me@raghv.dev");
  assert.deepEqual(verifyTotp(base32, "12345", null), { ok: false, reason: "invalid" });
  assert.deepEqual(verifyTotp(base32, "abcdef", null), { ok: false, reason: "invalid" });
  const now = Date.now();
  const real = speakeasy.totp({ secret: base32, encoding: "base32", time: Math.floor(now / 1000) });
  const wrong = real.slice(0, 5) + ((Number(real[5]) + 5) % 10);
  // A one-digit change can collide with an adjacent step's code only by chance (1 in 10^5ish).
  assert.deepEqual(verifyTotp(base32, wrong, null, now), { ok: false, reason: "invalid" });
});

test("backup codes are unique, formatted, and single-use", () => {
  const codes = generateBackupCodes();
  assert.equal(codes.length, 10);
  assert.equal(new Set(codes).size, 10);
  for (const code of codes) assert.match(code, /^[A-HJ-NP-Z2-9]{5}-[A-HJ-NP-Z2-9]{5}$/);

  const hashes = codes.map(hashBackupCode);
  const remaining = consumeBackupCode(codes[3].toLowerCase().replace("-", " "), hashes);
  assert.ok(remaining, "matches regardless of case and separator");
  assert.equal(remaining!.length, 9);
  assert.equal(consumeBackupCode(codes[3], remaining!), null, "can't be used twice");
  assert.equal(consumeBackupCode("ZZZZZ-ZZZZZ", hashes), null);
});

test("verified-session cookie is bound to session, user, key and expiry", () => {
  const now = Date.now();
  const cookie = signMfaCookie("sess-1", "user-1", master, now);
  assert.equal(verifyMfaCookie(cookie, "sess-1", "user-1", master, now), true);
  assert.equal(verifyMfaCookie(cookie, "sess-2", "user-1", master, now), false, "other session");
  assert.equal(verifyMfaCookie(cookie, "sess-1", "user-2", master, now), false, "other user");
  assert.equal(verifyMfaCookie(cookie, "sess-1", "user-1", randomBytes(32), now), false, "other key");
  assert.equal(verifyMfaCookie(cookie, "sess-1", "user-1", master, now + 9 * 3600 * 1000), false, "expired");
  const [s, , mac] = cookie.split(".");
  assert.equal(verifyMfaCookie(`${s}.9999999999.${mac}`, "sess-1", "user-1", master, now), false, "extended expiry");
  assert.equal(verifyMfaCookie(undefined, "sess-1", "user-1", master, now), false);
});
