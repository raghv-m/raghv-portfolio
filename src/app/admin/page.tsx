import Link from "next/link";

import { AdminPage, Empty, Panel, Stat, StatusPill, money, when } from "@/components/admin/ui";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const admin = getSupabaseAdmin();
  const [newEstimates, recentEstimates, clients, openInvoices, unread] = await Promise.all([
    admin.from("estimates").select("id", { count: "exact", head: true }).eq("status", "new"),
    admin.from("estimates").select("id, reference, name, company, status, my_low_cents, my_high_cents, created_at").order("created_at", { ascending: false }).limit(6),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "client"),
    admin.from("invoices").select("amount_due, amount_paid, currency, status").in("status", ["sent", "overdue"]),
    isDatabaseConfigured ? prisma.contactSubmission.count({ where: { read: false } }).catch(() => 0) : Promise.resolve(0),
  ]);
  const outstanding = (openInvoices.data ?? []).reduce((sum, i) => sum + (i.amount_due - i.amount_paid), 0);

  return (
    <AdminPage label="Admin console" title="Overview">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Stat label="New estimates" value={newEstimates.count ?? 0} href="/admin/estimates?status=new" accent={(newEstimates.count ?? 0) > 0} />
        <Stat label="Unread messages" value={unread} href="/admin/messages" accent={unread > 0} />
        <Stat label="Clients" value={clients.count ?? 0} href="/admin/clients" />
        <Stat label="Outstanding" value={money(outstanding)} href="/admin/invoices?status=open" />
      </div>

      <Panel title="Latest estimate requests" aside={<Link href="/admin/estimates" className="font-mono text-[10px] text-[var(--gold)] hover:underline">All →</Link>}>
        {recentEstimates.data?.length ? (
          <ul className="divide-y divide-[var(--border)] -my-2">
            {recentEstimates.data.map((e) => (
              <li key={e.id}>
                <Link href={`/admin/estimates/${e.id}`} className="flex items-center justify-between gap-4 py-3 hover:text-[var(--gold)]">
                  <span className="min-w-0">
                    <span className="block text-sm text-[var(--text)] truncate">{e.name}{e.company ? ` · ${e.company}` : ""}</span>
                    <span className="block font-mono text-[10px] text-[var(--text-muted)]">{e.reference} · {when(e.created_at)}</span>
                  </span>
                  <span className="flex items-center gap-3 shrink-0">
                    <span className="text-sm tabular-nums text-[var(--text)]">{money(e.my_low_cents)} – {money(e.my_high_cents)}</span>
                    <StatusPill status={e.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No estimates yet. Share <Link href="/estimate" className="text-[var(--gold)]">raghv.dev/estimate</Link> to get your first.</Empty>
        )}
      </Panel>
    </AdminPage>
  );
}
