// One-off: opens a one-time "set your password" link for the admin account in your browser,
// without going through email. The link is single use and is never printed.
// Run: node --env-file=.env.local scripts/admin-access-link.mjs you@example.com [https://www.raghv.dev]
import { exec } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const [email, origin = "https://www.raghv.dev"] = process.argv.slice(2);
if (!email) {
  console.error("Usage: node --env-file=.env.local scripts/admin-access-link.mjs <email> [origin]");
  process.exit(1);
}

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: profile } = await admin.from("profiles").select("role").eq("email", email.toLowerCase()).maybeSingle();
if (profile?.role !== "admin") {
  console.error(`${email} is not an admin. Run scripts/create-admin.mjs with it first.`);
  process.exit(1);
}

const { data, error } = await admin.auth.admin.generateLink({ type: "recovery", email: email.toLowerCase() });
if (error || !data.properties?.hashed_token) throw error ?? new Error("No token returned");

const link = `${origin}/auth/confirm?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=recovery&next=/auth/reset-password`;
const opener = process.platform === "win32" ? `start "" "${link}"` : process.platform === "darwin" ? `open "${link}"` : `xdg-open "${link}"`;
exec(opener);
console.log("Opened the set-password page in your browser. The link works once.");
