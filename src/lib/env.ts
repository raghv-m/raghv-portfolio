const required = [
  // Turso (blog, contact, newsletter) until the data moves to Supabase
  "DATABASE_URL",
  "TURSO_AUTH_TOKEN",
  "CSRF_SECRET",
  // Supabase: logins, client portal, invoices
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  // Encrypts the admin TOTP secret and signs the 2FA cookie
  "MFA_ENCRYPTION_KEY",
] as const;

export function validateEnv() {
  // Skip during `next build` — static page generation doesn't need secrets,
  // only runtime server processes do. NEXT_PHASE is set by Next.js internally.
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}
