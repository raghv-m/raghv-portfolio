// One-off: creates (or repairs) the admin account in Supabase.
// The password is random and never shown: set your own with "Forgot password" at /auth/login.
// Run: node --env-file=.env.local scripts/create-admin.mjs you@example.com "Your Name"
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const [email, fullName = "Admin"] = process.argv.slice(2);
if (!email) {
  console.error("Usage: node --env-file=.env.local scripts/create-admin.mjs <email> [name]");
  process.exit(1);
}

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: list, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 });
if (listError) throw listError;
let user = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

if (!user) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: randomBytes(32).toString("base64url"),
    email_confirm: true,
  });
  if (error) throw error;
  user = data.user;
  console.log("Created auth user");
} else {
  console.log("Auth user already exists");
}

const { data: profile } = await admin.from("profiles").select("id, role").eq("id", user.id).maybeSingle();
if (profile?.role === "admin") {
  console.log("Profile is already admin. Nothing to do.");
} else if (profile) {
  await admin.from("profiles").update({ role: "admin" }).eq("id", user.id);
  console.log("Promoted existing profile to admin");
} else {
  const { data: tenant, error } = await admin.from("tenants").insert({ name: `${fullName} (admin)` }).select().single();
  if (error) throw error;
  const { error: profileError } = await admin
    .from("profiles")
    .insert({ id: user.id, email: email.toLowerCase(), full_name: fullName, role: "admin", tenant_id: tenant.id });
  if (profileError) throw profileError;
  console.log("Created admin profile");
}
console.log(`Done. Set your password at /auth/forgot-password using ${email}.`);
