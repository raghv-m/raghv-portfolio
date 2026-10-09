import Link from "next/link";

import { AdminPage, Empty, StatusPill, money, tableClass, tdClass, thClass, when } from "@/components/admin/ui";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function ContractsPage() {
  const admin = getSupabaseAdmin();
  const [{ data: contracts }, { data: profiles }] = await Promise.all([
    admin.from("contracts").select("id, number, title, status, variables, sent_at, client_signed_at, created_at, client_id").order("created_at", { ascending: false }).limit(200),
    admin.from("profiles").select("id, email, full_name"),
  ]);
  const clientOf = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <AdminPage label="Onboarding" title="Contracts">
      <p className="text-sm text-[var(--text-muted)] mb-6 max-w-2xl">
        Draft a contract from a client&apos;s page (Clients &amp; leads → a client → Draft contract). It fills in from their
        questionnaire and estimate. You sign when you send it; they sign in their portal.
      </p>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-x-auto">
        {contracts?.length ? (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>Contract</th>
                <th className={thClass}>Client</th>
                <th className={thClass}>Fee</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => {
                const vars = c.variables as { client?: { legalName?: string }; feeCents?: number; currency?: string };
                const client = clientOf.get(c.client_id);
                return (
                  <tr key={c.id} className="hover:bg-[rgba(255,255,255,0.02)]">
                    <td className={tdClass}>
                      <Link href={`/admin/contracts/${c.id}`} className="block hover:text-[var(--gold)]">
                        <span className="block font-medium">{c.number}</span>
                        <span className="block text-xs text-[var(--text-muted)]">{c.title}</span>
                      </Link>
                    </td>
                    <td className={tdClass}>{vars.client?.legalName || client?.full_name || client?.email}</td>
                    <td className={`${tdClass} tabular-nums`}>{vars.feeCents ? money(vars.feeCents, vars.currency) : "–"}</td>
                    <td className={tdClass}><StatusPill status={c.status === "sent" ? "awaiting signature" : c.status} /></td>
                    <td className={`${tdClass} text-[var(--text-muted)] whitespace-nowrap`}>{when(c.client_signed_at ?? c.sent_at ?? c.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <Empty>No contracts yet.</Empty>
        )}
      </div>
    </AdminPage>
  );
}
