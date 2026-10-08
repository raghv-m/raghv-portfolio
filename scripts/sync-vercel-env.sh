#!/usr/bin/env bash
# Brings the Vercel project's environment variables in line with .env.local, without printing
# any secret. Run from the repo root:   bash scripts/sync-vercel-env.sh
#
#  1. Removes variables nothing uses any more (NextAuth and the old single-admin login).
#  2. For each variable below that has a value in .env.local, replaces it in Production,
#     Preview and Development. Blank values in .env.local are skipped (fill them in first).
set -euo pipefail

cd "$(dirname "$0")/.."
[ -f .env.local ] || { echo ".env.local not found"; exit 1; }
set -a; . ./.env.local; set +a

VERCEL="npx --yes vercel@latest"
ENVS=(production preview development)

REMOVE=(NEXTAUTH_SECRET NEXTAUTH_URL ADMIN_EMAIL ADMIN_PASSWORD_HASH)
SET=(
  NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY MFA_ENCRYPTION_KEY
  CSRF_SECRET IP_HASH_SALT RESEND_API_KEY TURSO_AUTH_TOKEN SMTP_FROM
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
)

for name in "${REMOVE[@]}"; do
  for env in "${ENVS[@]}"; do
    $VERCEL env rm "$name" "$env" --yes >/dev/null 2>&1 && echo "removed  $name ($env)" || true
  done
done

for name in "${SET[@]}"; do
  value="${!name:-}"
  if [ -z "$value" ]; then echo "skipped  $name (no value in .env.local)"; continue; fi
  for env in "${ENVS[@]}"; do
    $VERCEL env rm "$name" "$env" --yes >/dev/null 2>&1 || true
    printf '%s' "$value" | $VERCEL env add "$name" "$env" >/dev/null 2>&1 && echo "set      $name ($env)" || echo "FAILED   $name ($env)"
  done
done

echo
echo "Done. Redeploy for the changes to take effect (Vercel -> Deployments -> Redeploy)."
