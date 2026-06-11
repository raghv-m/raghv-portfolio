const required = [
  "DATABASE_URL",
  "TURSO_AUTH_TOKEN",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD_HASH",
  "CSRF_SECRET",
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
