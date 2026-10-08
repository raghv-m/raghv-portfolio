import Link from "next/link";

import { AdminPage, Empty, StatusPill, money, tableClass, tdClass, thClass, when } from "@/components/admin/ui";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const admin = getSupabaseAdmin();
  const [{ data: projects }, { data: profiles }] = await Promise.all([
    admin.from("projects").select("id, title, status, progress, value_cents, end_date, client_id, updated_at").order("updated_at", { ascending: false }),
    admin.from("profiles").select("id, email, full_name"),
  ]);
  const clientOf = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <AdminPage label="Delivery" title="Projects">
      <p className="text-sm text-[var(--text-muted)] mb-6 max-w-2xl">Start a project from a client&apos;s page once their contract is signed. Milestones drive the progress bar the client sees in their portal.</p>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-x-auto">
        {projects?.length ? (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>Project</th>
                <th className={thClass}>Client</th>
                <th className={thClass}>Progress</th>
                <th className={thClass}>Value</th>
                <th className={thClass}>Due</th>
                <th className={thClass}>Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const client = clientOf.get(p.client_id);
                return (
                  <tr key={p.id} className="hover:bg-[rgba(255,255,255,0.02)]">
                    <td className={tdClass}><Link href={`/admin/projects/${p.id}`} className="font-medium hover:text-[var(--gold)]">{p.title}</Link></td>
                    <td className={tdClass}>{client?.full_name || client?.email}</td>
                    <td className={`${tdClass} w-40`}>
                      <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden"><div className="h-full bg-[var(--gold)]" style={{ width: `${p.progress}%` }} /></div>
                      <span className="text-[10px] text-[var(--text-muted)]">{p.progress}%</span>
                    </td>
                    <td className={`${tdClass} tabular-nums`}>{p.value_cents ? money(p.value_cents) : "–"}</td>
                    <td className={`${tdClass} text-[var(--text-muted)] whitespace-nowrap`}>{p.end_date ? when(p.end_date) : "–"}</td>
                    <td className={tdClass}><StatusPill status={p.status.replace("_", " ")} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <Empty>No projects yet.</Empty>
        )}
      </div>
    </AdminPage>
  );
}
