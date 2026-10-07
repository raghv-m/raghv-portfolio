// End-to-end check against the real Supabase project (reads .env.local). Creates two throwaway
// clients, an invoice with a stored PDF, checks what each client can see with a real login, then
// deletes everything it created. Sends no email. Run: node --env-file=.env.local supabase/tests/live-smoke.mjs
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

let failures = 0;
const ok = (name, cond, extra = "") => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  " + extra : ""}`);
  if (!cond) failures++;
};
const created = { users: [], tenants: [] };

async function makeClient(label) {
  const email = `smoke-${label}-${randomBytes(4).toString("hex")}@example.test`;
  const password = randomBytes(18).toString("base64url");
  const { data: user, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  created.users.push(user.user.id);
  const { data: tenant } = await admin.from("tenants").insert({ name: `smoke ${label}` }).select().single();
  created.tenants.push(tenant.id);
  await admin.from("profiles").insert({ id: user.user.id, email, role: "client", tenant_id: tenant.id, full_name: `Smoke ${label}` });
  const client = createClient(url, anonKey, { auth: { persistSession: false } });
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;
  return { id: user.user.id, tenantId: tenant.id, client };
}

try {
  const a = await makeClient("a");
  const b = await makeClient("b");

  const { data: invoice } = await admin
    .from("invoices")
    .insert({ tenant_id: a.tenantId, client_id: a.id, due_date: new Date(Date.now() + 14 * 864e5).toISOString() })
    .select()
    .single();
  await admin.from("invoice_line_items").insert([
    { invoice_id: invoice.id, description: "Build", quantity: 2, unit_amount: 50000 },
    { invoice_id: invoice.id, description: "Hosting", quantity: 1, unit_amount: 2500 },
  ]);
  const { data: fresh } = await admin.from("invoices").select("amount_due, invoice_number").eq("id", invoice.id).single();
  ok("invoice number assigned by the database", /^INV-\d{4}-\d{4}$/.test(fresh.invoice_number), fresh.invoice_number);
  ok("amount_due computed from line items", fresh.amount_due === 102500, String(fresh.amount_due));

  ok("client A can't see a draft invoice", (await a.client.from("invoices").select("id")).data?.length === 0);
  await admin.from("invoices").update({ status: "sent", pdf_path: `${invoice.id}.pdf` }).eq("id", invoice.id);
  const upload = await admin.storage.from("invoices").upload(`${invoice.id}.pdf`, Buffer.from("%PDF-1.4 smoke"), { contentType: "application/pdf", upsert: true });
  ok("service role can store the PDF privately", !upload.error, upload.error?.message ?? "");

  ok("client A sees their sent invoice", (await a.client.from("invoices").select("id")).data?.length === 1);
  ok("client A sees its line items", (await a.client.from("invoice_line_items").select("id")).data?.length === 2);
  ok("client B sees none of A's invoices", (await b.client.from("invoices").select("id")).data?.length === 0);
  ok("client B sees none of A's line items", (await b.client.from("invoice_line_items").select("id")).data?.length === 0);

  const direct = await a.client.storage.from("invoices").download(`${invoice.id}.pdf`);
  ok("clients can't read the invoices bucket directly (signed URL only)", Boolean(direct.error));
  const publicFetch = await fetch(`${url}/storage/v1/object/public/invoices/${invoice.id}.pdf`);
  ok("no public URL for invoice PDFs", publicFetch.status >= 400, String(publicFetch.status));

  const paid = await a.client.from("invoices").update({ status: "paid" }).eq("id", invoice.id).select("id");
  ok("client can't mark their own invoice paid", (paid.data?.length ?? 0) === 0);
  const promote = await a.client.from("profiles").update({ role: "admin" }).eq("id", a.id);
  ok("client can't make themselves admin", Boolean(promote.error));

  await admin.storage.from("invoices").remove([`${invoice.id}.pdf`]);
} catch (error) {
  ok("smoke run completed", false, error.message);
} finally {
  for (const id of created.users) await admin.auth.admin.deleteUser(id);
  if (created.tenants.length) await admin.from("tenants").delete().in("id", created.tenants);
  const left = await admin.from("tenants").select("id").in("id", created.tenants);
  ok("cleaned up test data", (left.data?.length ?? 0) === 0);
}

console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exitCode = failures ? 1 : 0;
