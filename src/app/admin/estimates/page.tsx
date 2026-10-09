import Link from "next/link";

import { AdminPage, Empty, StatusPill, money, tableClass, tdClass, thClass, when } from "@/components/admin/ui";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const FILTERS = ["all", "new", "reviewed", "quoted", "converted", "declined"] as const;

export default async function EstimatesPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status = "all", q = "" } = await searchParams;
  let query = getSupabaseAdmin()
    .from("estimates")
    .select("id, reference, status, name, email, company, category_slug, pages, one_time_low_cents, one_time_high_cents, my_low_cents, my_high_cents, monthly_cents, city, region, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status !== "all" && (FILTERS as readonly string[]).includes(status)) query = query.eq("status", status as Exclude<(typeof FILTERS)[number], "all">);
  if (q.trim()) {
    const term = q.trim().replace(/[%,()]/g, "");
    query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%,company.ilike.%${term}%,reference.ilike.%${term}%`);
  }
  const [{ data: estimates }, { data: categories }] = await Promise.all([
    query,
    getSupabaseAdmin().from("pricing_items").select("slug, label").eq("section", "category"),
  ]);
  const categoryLabel = new Map((categories ?? []).map((c) => [c.slug, c.label]));

  return (
    <AdminPage label="Leads" title="Estimate requests" actions={<Link href="/estimate" target="_blank" className="btn-ghost">Open the estimator ↗</Link>}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <Link
              key={f}
              href={`/admin/estimates${f === "all" ? "" : `?status=${f}`}`}
              className={`px-3 py-1 rounded-full border font-mono text-[10px] uppercase tracking-wider ${status === f ? "border-[var(--gold)] text-[var(--gold)]" : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"}`}
            >
              {f}
            </Link>
          ))}
        </div>
        <form className="flex gap-2">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="Search name, email, company, EST-…" className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm w-64 focus:outline-none focus:border-[rgba(212,160,23,0.5)]" />
        </form>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-x-auto">
        {estimates?.length ? (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>Request</th>
                <th className={thClass}>Project</th>
                <th className={thClass}>Estimate</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Received</th>
              </tr>
            </thead>
            <tbody>
              {estimates.map((e) => (
                <tr key={e.id} className="hover:bg-[rgba(255,255,255,0.02)]">
                  <td className={tdClass}>
                    <Link href={`/admin/estimates/${e.id}`} className="block hover:text-[var(--gold)]">
                      <span className="block font-medium">{e.name}{e.company ? ` · ${e.company}` : ""}</span>
                      <span className="block font-mono text-[10px] text-[var(--text-muted)]">{e.reference} · {e.email}</span>
                    </Link>
                  </td>
                  <td className={tdClass}>
                    <span className="block">{categoryLabel.get(e.category_slug) ?? e.category_slug}</span>
                    <span className="block text-xs text-[var(--text-muted)]">{e.pages} pages{e.city ? ` · ${e.city}${e.region ? `, ${e.region}` : ""}` : ""}</span>
                  </td>
                  <td className={`${tdClass} tabular-nums whitespace-nowrap`}>
                    {money(e.my_low_cents)} – {money(e.my_high_cents)}
                    <span className="block text-xs text-[var(--text-muted)] line-through">{money(e.one_time_low_cents)} – {money(e.one_time_high_cents)}</span>
                    {e.monthly_cents > 0 && <span className="block text-xs text-[var(--text-muted)]">+ {money(e.monthly_cents)}/mo</span>}
                  </td>
                  <td className={tdClass}><StatusPill status={e.status} /></td>
                  <td className={`${tdClass} whitespace-nowrap text-[var(--text-muted)]`}>{when(e.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty>No estimates{status !== "all" ? ` marked ${status}` : ""}{q ? ` matching “${q}”` : ""}.</Empty>
        )}
      </div>
    </AdminPage>
  );
}
