import Link from "next/link";

import { AdminPage, Empty, StatusPill, tableClass, tdClass, thClass, when } from "@/components/admin/ui";
import { listPeople } from "@/lib/clients";

export const dynamic = "force-dynamic";

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string; show?: string }> }) {
  const { q = "", show = "all" } = await searchParams;
  const term = q.trim().toLowerCase();
  const people = (await listPeople()).filter(
    (p) =>
      (show === "all" || (show === "accounts" ? p.account : !p.account)) &&
      (!term || p.email.includes(term) || p.name.toLowerCase().includes(term) || (p.company ?? "").toLowerCase().includes(term)),
  );

  return (
    <AdminPage label="People" title="Clients & leads">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-1.5">
          {[["all", "Everyone"], ["accounts", "Have an account"], ["leads", "Leads only"]].map(([key, text]) => (
            <Link key={key} href={`/admin/clients${key === "all" ? "" : `?show=${key}`}`} className={`px-3 py-1 rounded-full border font-mono text-[10px] uppercase tracking-wider ${show === key ? "border-[var(--gold)] text-[var(--gold)]" : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"}`}>
              {text}
            </Link>
          ))}
        </div>
        <form className="flex gap-2">
          {show !== "all" && <input type="hidden" name="show" value={show} />}
          <input name="q" defaultValue={q} placeholder="Search name, email, company" className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm w-64 focus:outline-none focus:border-[rgba(212,160,23,0.5)]" />
        </form>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-x-auto">
        {people.length ? (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>Person</th>
                <th className={thClass}>Account</th>
                <th className={thClass}>Estimates</th>
                <th className={thClass}>Messages</th>
                <th className={thClass}>Invoices</th>
                <th className={thClass}>Last activity</th>
              </tr>
            </thead>
            <tbody>
              {people.map((p) => (
                <tr key={p.email} className="hover:bg-[rgba(255,255,255,0.02)]">
                  <td className={tdClass}>
                    <Link href={`/admin/clients/${encodeURIComponent(p.email)}`} className="block hover:text-[var(--gold)]">
                      <span className="block font-medium">{p.name || p.email}{p.company ? ` · ${p.company}` : ""}</span>
                      <span className="block font-mono text-[10px] text-[var(--text-muted)]">{p.email}</span>
                    </Link>
                  </td>
                  <td className={tdClass}><StatusPill status={p.account?.role ?? "lead"} /></td>
                  <td className={`${tdClass} tabular-nums`}>{p.estimates || "–"}</td>
                  <td className={`${tdClass} tabular-nums`}>{p.messages || "–"}</td>
                  <td className={`${tdClass} tabular-nums`}>{p.invoices || "–"}</td>
                  <td className={`${tdClass} whitespace-nowrap text-[var(--text-muted)]`}>{when(p.lastActivity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty>Nobody here yet.</Empty>
        )}
      </div>
    </AdminPage>
  );
}
