import { PGlite } from "@electric-sql/pglite";
import { readdirSync, readFileSync } from "node:fs";

// Applies supabase/migrations/*.sql (in order) to an in-memory Postgres with a minimal Supabase
// stand-in (auth.uid(), roles, storage.objects, realtime publication) and checks every access rule.
// Run: npm run test:db
const dir = new URL("../migrations/", import.meta.url);
const migration = readdirSync(dir)
  .filter((f) => f.endsWith(".sql"))
  .sort()
  .map((f) => readFileSync(new URL(f, dir), "utf8"))
  .join(";\n");
const db = new PGlite();
let failures = 0;
const ok = (name, cond, extra = "") => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  " + extra : ""}`);
  if (!cond) failures++;
};

// --- Supabase stand-in ------------------------------------------------------------------------
await db.exec(`
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create schema auth; create schema storage;
  grant usage on schema public, auth, storage to anon, authenticated, service_role;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant execute on function auth.uid() to anon, authenticated, service_role;
  create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
  grant execute on function auth.jwt() to anon, authenticated, service_role;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant all on storage.objects, storage.buckets to anon, authenticated, service_role;
  create publication supabase_realtime;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
  alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
`);

try {
  await db.exec(migration);
  ok("migration applies cleanly", true);
} catch (e) {
  ok("migration applies cleanly", false, e.message);
  await db.close();
  process.exit(1);
}

// --- Fixtures (as superuser) ------------------------------------------------------------------
const T_ADMIN = "00000000-0000-0000-0000-00000000000a";
const T_A = "00000000-0000-0000-0000-0000000000a1";
const T_B = "00000000-0000-0000-0000-0000000000b1";
const ADMIN = "10000000-0000-0000-0000-000000000001";
const CA = "10000000-0000-0000-0000-0000000000a1";
const CB = "10000000-0000-0000-0000-0000000000b1";
const PA = "20000000-0000-0000-0000-0000000000a1";
const PB = "20000000-0000-0000-0000-0000000000b1";
const INV1 = "30000000-0000-0000-0000-000000000001";
await db.exec(`
  insert into public.tenants (id, name) values ('${T_ADMIN}','me'),('${T_A}','Acme'),('${T_B}','Beta');
  insert into auth.users values ('${ADMIN}','me@x'),('${CA}','a@x'),('${CB}','b@x');
  insert into public.profiles (id,email,role,tenant_id) values
    ('${ADMIN}','me@x','admin','${T_ADMIN}'),('${CA}','a@x','client','${T_A}'),('${CB}','b@x','client','${T_B}');
  insert into public.projects (id,tenant_id,client_id,title) values ('${PA}','${T_A}','${CA}','A site'),('${PB}','${T_B}','${CB}','B app');
  insert into public.milestones (project_id,title) values ('${PA}','m1'),('${PB}','m2');
  insert into public.messages (project_id,sender_id,body) values ('${PA}','${CA}','hi'),('${PB}','${CB}','yo');
  insert into public.invoices (id,tenant_id,client_id,due_date,status) values
    ('${INV1}','${T_A}','${CA}',now(),'sent'),
    ('30000000-0000-0000-0000-000000000002','${T_A}','${CA}',now(),'draft'),
    ('30000000-0000-0000-0000-000000000003','${T_B}','${CB}',now(),'sent');
  insert into public.invoice_line_items (invoice_id,description,quantity,unit_amount) values
    ('${INV1}','Design',2,50000),('${INV1}','Hosting',1,2500);
  insert into public.blog_posts (title,slug,content,status) values ('Pub','pub','x','published'),('Draft','draft','x','draft');
  insert into public.subscribers (email,confirmed) values ('s@x',true);
  insert into public.mfa_secrets (user_id,secret_encrypted) values ('${ADMIN}','enc');
  insert into public.audit_logs (action,resource_type) values ('create','invoice');
  insert into public.estimates (name,email,category_slug,pages,one_time_cents,one_time_low_cents,one_time_high_cents) values
    ('A','A@x','business-website',5,250000,225000,300000),('Stranger','z@x','portfolio',3,150000,135000,180000);
  update public.pricing_items set active = false where slug = 'paypal';
  insert into public.crm_notes (person_email, body) values ('a@x', 'private note about A');
  insert into public.crm_tasks (person_email, title) values ('a@x', 'follow up');
  insert into public.questionnaires (client_id, tenant_id) values ('${CA}','${T_A}'),('${CB}','${T_B}');
  insert into public.contracts (id, client_id, tenant_id, status, body) values
    ('40000000-0000-0000-0000-000000000001','${CA}','${T_A}','sent','A terms'),
    ('40000000-0000-0000-0000-000000000002','${CA}','${T_A}','draft','A draft'),
    ('40000000-0000-0000-0000-000000000003','${CB}','${T_B}','sent','B terms');
  insert into storage.objects (bucket_id,name) values
    ('project-files','${PA}/spec.pdf'),('project-files','${PB}/b.pdf'),('project-files','not-a-uuid/x.pdf');
`);

const inv = await db.query(`select invoice_number from public.invoices`);
const numbers = inv.rows.map((r) => r.invoice_number);
ok(
  "invoice numbers come from the sequence and are unique",
  numbers.every((n) => /^INV-\d{4}-\d{4}$/.test(n)) && new Set(numbers).size === 3,
  numbers.join(" "),
);
const total = await db.query(`select amount_due from public.invoices where id='${INV1}'`);
ok("amount_due = sum of line items (2 x 500.00 + 25.00)", total.rows[0].amount_due === 102500, `got ${total.rows[0].amount_due}`);
await db.exec(`delete from public.invoice_line_items where invoice_id='${INV1}' and description='Hosting'`);
const total2 = await db.query(`select amount_due from public.invoices where id='${INV1}'`);
ok("amount_due updates when a line item is removed", total2.rows[0].amount_due === 100000, `got ${total2.rows[0].amount_due}`);

// --- act as a role ----------------------------------------------------------------------------
async function as(role, uid, fn) {
  const email = { [ADMIN]: "me@x", [CA]: "a@x", [CB]: "b@x" }[uid] ?? "";
  await db.exec(
    `set role ${role}; select set_config('request.jwt.claim.sub', '${uid ?? ""}', false); select set_config('request.jwt.claims', '${JSON.stringify(uid ? { sub: uid, email } : {})}', false);`,
  );
  try {
    return await fn();
  } finally {
    await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false); select set_config('request.jwt.claims', '', false);`);
  }
}
const count = async (sql) => (await db.query(sql)).rows.length;
const fails = async (sql) => {
  try {
    await db.query(sql);
    return false;
  } catch {
    return true;
  }
};
const affected = async (sql) => (await db.query(sql)).affectedRows ?? 0;

await as("anon", null, async () => {
  const pricing = await count(`select * from public.pricing_items`);
  ok("anon reads the active price list (inactive items hidden)", pricing > 50 && (await count(`select * from public.pricing_items where slug = 'paypal'`)) === 0, String(pricing));
  ok("anon can't change prices", (await affected(`update public.pricing_items set price_cents = 1`)) === 0);
  ok("anon can't submit estimates directly (server route only)", await fails(`insert into public.estimates (name,email,category_slug,pages,one_time_cents,one_time_low_cents,one_time_high_cents) values ('x','x@x','portfolio',1,1,1,1)`));
  ok("anon can't read estimates", (await count(`select * from public.estimates`)) === 0);
  ok("anon can't read CRM notes", (await count(`select * from public.crm_notes`)) === 0);
  ok("anon can't write news digests directly", await fails(`insert into public.news_digests (digest_date, items) values ('2026-10-09', '[]')`));
  ok("anon sees only published posts", (await count(`select * from public.blog_posts`)) === 1);
  ok("anon sees no profiles", (await count(`select * from public.profiles`)) === 0);
  ok("anon cannot self-insert a confirmed subscriber", await fails(`insert into public.subscribers (email, confirmed) values ('evil@x', true)`));
  ok("anon cannot insert contact submissions directly", await fails(`insert into public.contact_submissions (name,email,subject,message) values ('a','b','c','d')`));
  ok("anon sees no project file objects", (await count(`select * from storage.objects`)) === 0);
});

await as("authenticated", CA, async () => {
  ok("client reads only estimates sent from their own email (case-insensitive)", (await count(`select * from public.estimates`)) === 1);
  ok("client reads only their own questionnaire", (await count(`select * from public.questionnaires`)) === 1);
  ok("client can't read CRM notes, even about themselves", (await count(`select * from public.crm_notes`)) === 0);
  ok("client can't read CRM tasks", (await count(`select * from public.crm_tasks`)) === 0);
  ok("client reads their sent contract, not drafts or others'", (await count(`select * from public.contracts`)) === 1);
  ok("client can't sign by writing to contracts directly", (await affected(`update public.contracts set status='signed', client_signature_name='x'`)) === 0);
  ok("client can't submit questionnaire answers directly", (await affected(`update public.questionnaires set status='submitted'`)) === 0);
  ok("client sees own profile only", (await count(`select * from public.profiles`)) === 1);
  ok("client sees only own tenant's projects", (await count(`select * from public.projects`)) === 1);
  ok("client sees own milestones only", (await count(`select * from public.milestones`)) === 1);
  ok("client sees own messages only", (await count(`select * from public.messages`)) === 1);
  ok("client sees own non-draft invoices only", (await count(`select * from public.invoices`)) === 1);
  ok("client sees line items of visible invoice", (await count(`select * from public.invoice_line_items`)) === 1);
  ok("client cannot read draft posts", (await count(`select * from public.blog_posts`)) === 1);
  ok("client cannot read MFA secrets", (await count(`select * from public.mfa_secrets`)) === 0);
  ok("client cannot read audit logs", (await count(`select * from public.audit_logs`)) === 0);
  ok("client cannot read subscribers", (await count(`select * from public.subscribers`)) === 0);
  ok("client cannot promote self to admin", await fails(`update public.profiles set role='admin' where id='${CA}'`));
  ok("client cannot move self to another tenant", await fails(`update public.profiles set tenant_id='${T_B}' where id='${CA}'`));
  ok("client can edit own name", (await affected(`update public.profiles set full_name='Alice' where id='${CA}'`)) === 1);
  ok("client cannot edit another profile", (await affected(`update public.profiles set full_name='x' where id='${CB}'`)) === 0);
  ok("client cannot update projects (progress etc.)", (await affected(`update public.projects set progress=100`)) === 0);
  ok("client cannot create projects", await fails(`insert into public.projects (tenant_id,client_id,title) values ('${T_A}','${CA}','x')`));
  ok("client cannot mark invoices paid", (await affected(`update public.invoices set status='paid'`)) === 0);
  ok("client can post a message as self", (await affected(`insert into public.messages (project_id,sender_id,body) values ('${PA}','${CA}','hello')`)) === 1);
  ok("client cannot post as someone else", await fails(`insert into public.messages (project_id,sender_id,body) values ('${PA}','${ADMIN}','spoof')`));
  ok("client cannot post on another tenant's project", await fails(`insert into public.messages (project_id,sender_id,body) values ('${PB}','${CA}','x')`));
  ok("client sees only own project file objects (bad path ignored, no error)", (await count(`select * from storage.objects`)) === 1);
  ok("client cannot upload into another project's folder", await fails(`insert into storage.objects (bucket_id,name) values ('project-files','${PB}/evil.pdf')`));
  ok("client can upload into own project folder", (await affected(`insert into storage.objects (bucket_id,name) values ('project-files','${PA}/ok.pdf')`)) === 1);
  ok("client cannot write to invoices bucket", await fails(`insert into storage.objects (bucket_id,name) values ('invoices','${PA}/x.pdf')`));
});

await as("authenticated", ADMIN, async () => {
  ok("admin reads all estimates", (await count(`select * from public.estimates`)) === 2);
  ok("admin reads all contracts incl. drafts", (await count(`select * from public.contracts`)) === 3);
  ok("admin reads CRM notes and tasks", (await count(`select * from public.crm_notes`)) === 1 && (await count(`select * from public.crm_tasks`)) === 1);
  ok("admin reads inactive prices too", (await count(`select * from public.pricing_items where slug = 'paypal'`)) === 1);
  ok("admin reads all profiles (no policy recursion)", (await count(`select * from public.profiles`)) === 3);
  ok("admin reads all projects", (await count(`select * from public.projects`)) === 2);
  ok("admin reads all invoices incl. drafts", (await count(`select * from public.invoices`)) === 3);
  ok("admin reads draft posts", (await count(`select * from public.blog_posts`)) === 2);
  ok("admin reads audit logs", (await count(`select * from public.audit_logs`)) === 1);
  ok("admin cannot read MFA secrets through the API", (await count(`select * from public.mfa_secrets`)) === 0);
  ok("admin JWT alone cannot write (writes go via server + TOTP)", (await affected(`update public.invoices set status='paid'`)) === 0);
});

await as("service_role", null, async () => {
  ok("contract numbers come from the sequence", (await db.query(`select number from public.contracts`)).rows.every((r) => /^CON-\d{4}-\d{4}$/.test(r.number)));
  await db.query(`update public.contracts set status='signed', client_signature_name='Alice', client_signed_at=now() where id='40000000-0000-0000-0000-000000000001'`);
  ok("a signed contract's text can't be changed, even by the server", await fails(`update public.contracts set body='changed' where id='40000000-0000-0000-0000-000000000001'`));
  ok("a signed contract can't be un-signed", await fails(`update public.contracts set status='sent' where id='40000000-0000-0000-0000-000000000001'`));
  ok("a signed contract can be voided (record kept)", (await affected(`update public.contracts set status='void' where id='40000000-0000-0000-0000-000000000001'`)) === 1);
  ok("service role can append audit logs", (await affected(`insert into public.audit_logs (action,resource_type) values ('x','y')`)) === 1);
  ok("audit logs reject updates even for service role", await fails(`update public.audit_logs set action='z'`));
  ok("audit logs reject deletes even for service role", await fails(`delete from public.audit_logs`));
  ok("service role reads MFA secrets", (await count(`select * from public.mfa_secrets`)) === 1);
});

const pub = await db.query(`select tablename from pg_publication_tables where pubname='supabase_realtime' order by 1`);
ok(
  "realtime publishes projects, milestones, messages, invoices",
  pub.rows.map((r) => r.tablename).join(",") === "invoices,messages,milestones,projects",
);

console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
await db.close();
process.exitCode = failures ? 1 : 0;
