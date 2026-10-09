import "server-only";

import { randomBytes } from "node:crypto";

import { logAudit } from "@/lib/audit";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Everyone who has interacted with the site, merged by email: portal accounts (Supabase),
 * estimate requests (Supabase) and contact-form messages (still in Turso until the data move).
 */
export type Person = {
  email: string;
  name: string;
  company: string | null;
  account: { id: string; role: "admin" | "client"; createdAt: string } | null;
  estimates: number;
  messages: number;
  invoices: number;
  lastActivity: string;
};

export async function listPeople(): Promise<Person[]> {
  const admin = getSupabaseAdmin();
  const [{ data: profiles }, { data: estimates }, { data: invoices }] = await Promise.all([
    admin.from("profiles").select("id, email, full_name, role, created_at"),
    admin.from("estimates").select("email, name, company, created_at"),
    admin.from("invoices").select("client_id"),
  ]);
  const messages = isDatabaseConfigured
    ? await prisma.contactSubmission.findMany({ select: { email: true, name: true, createdAt: true } }).catch(() => [])
    : [];

  const people = new Map<string, Person>();
  const touch = (email: string, name: string, at: string) => {
    const key = email.toLowerCase();
    const person = people.get(key) ?? { email: key, name, company: null, account: null, estimates: 0, messages: 0, invoices: 0, lastActivity: at };
    if (at > person.lastActivity) person.lastActivity = at;
    if (!person.name && name) person.name = name;
    people.set(key, person);
    return person;
  };

  const invoiceCount = new Map<string, number>();
  for (const invoice of invoices ?? []) invoiceCount.set(invoice.client_id, (invoiceCount.get(invoice.client_id) ?? 0) + 1);

  for (const p of profiles ?? []) {
    const person = touch(p.email, p.full_name ?? "", p.created_at);
    person.account = { id: p.id, role: p.role, createdAt: p.created_at };
    person.invoices = invoiceCount.get(p.id) ?? 0;
  }
  for (const e of estimates ?? []) {
    const person = touch(e.email, e.name, e.created_at);
    person.estimates += 1;
    person.company ??= e.company;
  }
  for (const m of messages) {
    const person = touch(m.email, m.name, m.createdAt.toISOString());
    person.messages += 1;
  }

  return [...people.values()].sort((a, b) => b.lastActivity.localeCompare(a.lastActivity));
}

/** Everything about one person, by email. */
export async function getPerson(email: string) {
  const key = email.toLowerCase();
  const admin = getSupabaseAdmin();
  const [{ data: profile }, { data: estimates }] = await Promise.all([
    admin.from("profiles").select("*").eq("email", key).maybeSingle(),
    admin.from("estimates").select("*").ilike("email", key).order("created_at", { ascending: false }),
  ]);
  const { data: invoices } = profile
    ? await admin.from("invoices").select("*").eq("client_id", profile.id).order("created_at", { ascending: false })
    : { data: [] };
  const { data: projects } = profile
    ? await admin.from("projects").select("*").eq("client_id", profile.id).order("created_at", { ascending: false })
    : { data: [] };
  const { data: questionnaires } = profile
    ? await admin.from("questionnaires").select("*").eq("client_id", profile.id).order("created_at", { ascending: false })
    : { data: [] };
  const { data: contracts } = profile
    ? await admin.from("contracts").select("id, number, title, status, sent_at, client_signed_at, created_at").eq("client_id", profile.id).order("created_at", { ascending: false })
    : { data: [] };
  const messages = isDatabaseConfigured
    ? await prisma.contactSubmission
        .findMany({ where: { email: { equals: key } }, orderBy: { createdAt: "desc" } })
        .catch(() => [])
    : [];
  return {
    email: key,
    profile,
    estimates: estimates ?? [],
    invoices: invoices ?? [],
    projects: projects ?? [],
    questionnaires: questionnaires ?? [],
    contracts: contracts ?? [],
    messages,
  };
}

/**
 * Finds or creates a client account for an email: a Supabase user (random password nobody
 * knows; they set their own via the portal invite), their own tenant, and a client profile.
 */
export async function ensureClient(actorId: string | null, input: { email: string; name: string; company?: string | null }) {
  const admin = getSupabaseAdmin();
  const email = input.email.toLowerCase();

  const { data: existing } = await admin.from("profiles").select("id, role").eq("email", email).maybeSingle();
  if (existing) return { id: existing.id, created: false };

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password: randomBytes(32).toString("base64url"),
    email_confirm: true,
    user_metadata: { full_name: input.name },
  });
  if (error) throw error;

  const { data: tenant, error: tenantError } = await admin
    .from("tenants")
    .insert({ name: input.company || input.name || email })
    .select("id")
    .single();
  if (tenantError) throw tenantError;

  const { error: profileError } = await admin
    .from("profiles")
    .insert({ id: created.user.id, email, full_name: input.name || null, role: "client", tenant_id: tenant.id });
  if (profileError) throw profileError;

  await logAudit({ actorId, action: "client.create", resourceType: "profile", resourceId: created.user.id, changes: { email } });
  return { id: created.user.id, created: true };
}

/** Emails a client a link to set their password and open the portal (Supabase recovery email). */
export async function sendPortalInvite(actorId: string, email: string, origin: string) {
  // The email template links to /auth/confirm with a token hash, so it works on the client's own device.
  const { error } = await getSupabaseAdmin().auth.resetPasswordForEmail(email.toLowerCase(), {
    redirectTo: `${origin}/auth/confirm?next=/auth/reset-password`,
  });
  if (error) throw error;
  await logAudit({ actorId, action: "client.portal_invite", resourceType: "profile", changes: { email } });
}

/**
 * A one-time link that signs the person in and lets them set a password, for our own emails
 * (sent through Resend, not Supabase's rate-limited mailer). Valid for 24 hours, single use.
 */
export async function createPortalAccessLink(email: string, origin: string): Promise<string | null> {
  // Never mint a sign-in link for the admin account from a public form.
  const { data: profile } = await getSupabaseAdmin().from("profiles").select("role").eq("email", email.toLowerCase()).maybeSingle();
  if (profile?.role === "admin") return null;
  const { data, error } = await getSupabaseAdmin().auth.admin.generateLink({ type: "recovery", email: email.toLowerCase() });
  if (error || !data.properties?.hashed_token) {
    console.error("[clients] portal link failed", error);
    return null;
  }
  return `${origin}/auth/confirm?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=recovery&next=/auth/reset-password`;
}
