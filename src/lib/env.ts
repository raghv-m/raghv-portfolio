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
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}
