import Link from "next/link";

import { AdminPage, Empty, StatusPill, money, tableClass, tdClass, thClass, when } from "@/components/admin/ui";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const FILTERS: Record<string, string[] | null> = { all: null, open: ["sent", "overdue"], draft: ["draft"], paid: ["paid"], cancelled: ["cancelled"] };

/** Sent but past its due date. */
function isLate(status: string, dueDate: string) {
  return status === "sent" && new Date(dueDate).getTime() < Date.now();
}

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "all" } = await searchParams;
  const admin = getSupabaseAdmin();
  let query = admin.from("invoices").select("id, invoice_number, status, amount_due, amount_paid, currency, due_date, created_at, client_id").order("created_at", { ascending: false }).limit(200);
  const filter = FILTERS[status];
  if (filter) query = query.in("status", filter as ("draft" | "sent" | "paid" | "overdue" | "cancelled")[]);
  const [{ data: invoices }, { data: profiles }] = await Promise.all([query, admin.from("profiles").select("id, email, full_name")]);
  const clientOf = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <AdminPage label="Billing" title="Invoices" actions={<Link href="/admin/invoices/new" className="btn-solid-gold">New invoice</Link>}>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {Object.keys(FILTERS).map((f) => (
          <Link key={f} href={`/admin/invoices${f === "all" ? "" : `?status=${f}`}`} className={`px-3 py-1 rounded-full border font-mono text-[10px] uppercase tracking-wider ${status === f ? "border-[var(--gold)] text-[var(--gold)]" : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"}`}>
            {f}
          </Link>
        ))}
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-x-auto">
        {invoices?.length ? (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>Invoice</th>
                <th className={thClass}>Client</th>
                <th className={thClass}>Amount</th>
                <th className={thClass}>Due</th>
                <th className={thClass}>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => {
                const client = clientOf.get(i.client_id);
                const late = isLate(i.status, i.due_date);
                return (
                  <tr key={i.id} className="hover:bg-[rgba(255,255,255,0.02)]">
                    <td className={tdClass}><Link href={`/admin/invoices/${i.id}`} className="font-medium hover:text-[var(--gold)]">{i.invoice_number}</Link></td>
                    <td className={tdClass}>{client?.full_name || client?.email || "–"}</td>
                    <td className={`${tdClass} tabular-nums`}>{money(i.amount_due, i.currency)}</td>
                    <td className={`${tdClass} whitespace-nowrap ${late ? "text-[var(--red)]" : "text-[var(--text-muted)]"}`}>{when(i.due_date)}{late ? " · late" : ""}</td>
                    <td className={tdClass}><StatusPill status={i.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <Empty>No invoices{status !== "all" ? ` (${status})` : ""}. Create one, or turn an estimate into one.</Empty>
        )}
      </div>
    </AdminPage>
  );
}
