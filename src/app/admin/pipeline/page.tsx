import Link from "next/link";

import { AdminPage, money, when } from "@/components/admin/ui";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

import { MoveDeal } from "./MoveDeal";

export const dynamic = "force-dynamic";

const STAGES = [
  { key: "new", label: "New lead" },
  { key: "reviewed", label: "Reviewed" },
  { key: "quoted", label: "Quoted" },
  { key: "converted", label: "Won" },
  { key: "declined", label: "Lost" },
] as const;

export default async function PipelinePage() {
  const { data: deals } = await getSupabaseAdmin()
    .from("estimates")
    .select("id, reference, name, company, email, status, my_low_cents, my_high_cents, created_at")
    .order("created_at", { ascending: false })
    .limit(300);
  const mid = (d: { my_low_cents: number; my_high_cents: number }) => Math.round((d.my_low_cents + d.my_high_cents) / 2);

  return (
    <AdminPage label="Sales" title="Pipeline">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-start">
        {STAGES.map((stage) => {
          const inStage = (deals ?? []).filter((d) => d.status === stage.key);
          return (
            <section key={stage.key} className="rounded-xl border border-[var(--border)] bg-[var(--card)] min-h-40">
              <header className="px-3 py-2.5 border-b border-[var(--border)]">
                <p className="font-mono text-[10px] tracking-wider uppercase text-[var(--text-muted)]">{stage.label} · {inStage.length}</p>
                <p className="text-sm font-semibold tabular-nums text-[var(--text)]">{money(inStage.reduce((s, d) => s + mid(d), 0))}</p>
              </header>
              <ul className="p-2 space-y-2">
                {inStage.map((d) => (
                  <li key={d.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
                    <Link href={`/admin/estimates/${d.id}`} className="block hover:text-[var(--gold)]">
                      <span className="block text-sm text-[var(--text)] truncate">{d.company || d.name}</span>
                      <span className="block font-mono text-[10px] text-[var(--text-muted)]">{d.reference} · {when(d.created_at)}</span>
                      <span className="block mt-1 text-sm tabular-nums text-[var(--gold)]">{money(mid(d))}</span>
                    </Link>
                    <MoveDeal id={d.id} current={d.status} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </AdminPage>
  );
}
