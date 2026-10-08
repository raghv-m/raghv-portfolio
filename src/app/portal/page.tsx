import type { Metadata } from "next";
import Link from "next/link";

import { signOutAction } from "@/app/auth/actions";
import { requirePortalUser } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Client portal", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const fmt = (cents: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 }).format(cents / 100);
const date = (iso: string) => new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeZone: "America/Edmonton" }).format(new Date(iso));

const STAGE: Record<string, { label: string; step: number }> = {
  new: { label: "Received", step: 1 },
  reviewed: { label: "Being reviewed", step: 2 },
  quoted: { label: "Quote sent", step: 3 },
  converted: { label: "Accepted · in progress", step: 4 },
  declined: { label: "Closed", step: 0 },
};

/**
 * The client's home: their estimate requests with progress, projects and invoices. Everything is
 * read as the signed-in user, so RLS only ever returns their own rows.
 */
export default async function PortalHome() {
  const { profile, email } = await requirePortalUser();
  const supabase = await createSupabaseServerClient();
  const [{ data: estimates }, { data: projects }, { data: invoices }] = await Promise.all([
    supabase.from("estimates").select("id, reference, status, category_slug, pages, my_low_cents, my_high_cents, monthly_cents, created_at").order("created_at", { ascending: false }),
    supabase.from("projects").select("id, title, status, progress, end_date").order("created_at", { ascending: false }),
    supabase.from("invoices").select("id, invoice_number, status, amount_due, amount_paid, currency, due_date, pdf_path").order("created_at", { ascending: false }),
  ]);

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-[var(--gold)]">CLIENT PORTAL</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--text)]">Hi {profile.full_name?.split(" ")[0] || "there"}</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Signed in as {email}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/estimate" className="btn-gold">New request</Link>
            <form action={signOutAction}><button type="submit" className="btn-ghost">Sign out</button></form>
          </div>
        </header>

        <section className="mt-10">
          <h2 className="font-mono text-[10px] tracking-wider text-[var(--text-muted)] uppercase mb-3">Your requests</h2>
          {estimates?.length ? (
            <ul className="space-y-3">
              {estimates.map((e) => {
                const stage = STAGE[e.status] ?? STAGE.new;
                return (
                  <li key={e.id} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
                    <div className="flex flex-wrap justify-between gap-3">
                      <div>
                        <p className="font-mono text-[10px] text-[var(--gold)]">{e.reference}</p>
                        <p className="mt-1 text-[var(--text)] capitalize">{e.category_slug.replace(/-/g, " ")} · {e.pages} pages</p>
                        <p className="text-xs text-[var(--text-muted)]">Sent {date(e.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-[var(--text)] tabular-nums">{fmt(e.my_low_cents)} – {fmt(e.my_high_cents)}</p>
                        {e.monthly_cents > 0 && <p className="text-xs text-[var(--text-muted)]">+ {fmt(e.monthly_cents)}/month</p>}
                      </div>
                    </div>
                    {stage.step > 0 && (
                      <div className="mt-5">
                        <div className="grid grid-cols-4 gap-1.5">
                          {[1, 2, 3, 4].map((n) => (
                            <span key={n} className={`h-1 rounded-full ${n <= stage.step ? "bg-[var(--gold)]" : "bg-[var(--border)]"}`} />
                          ))}
                        </div>
                        <p className="mt-2 font-mono text-[10px] tracking-wider text-[var(--text-muted)]">STATUS: <span className="text-[var(--text)]">{stage.label.toUpperCase()}</span></p>
                      </div>
                    )}
                    {stage.step === 0 && <p className="mt-4 font-mono text-[10px] text-[var(--text-muted)]">STATUS: CLOSED</p>}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No requests yet. <Link href="/estimate" className="text-[var(--gold)]">Get an estimate</Link>.</p>
          )}
        </section>

        {projects && projects.length > 0 && (
          <section className="mt-10">
            <h2 className="font-mono text-[10px] tracking-wider text-[var(--text-muted)] uppercase mb-3">Projects</h2>
            <ul className="space-y-3">
              {projects.map((p) => (
                <li key={p.id} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
                  <div className="flex justify-between gap-3">
                    <p className="text-[var(--text)]">{p.title}</p>
                    <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase">{p.status.replace("_", " ")}</p>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                    <div className="h-full bg-[var(--gold)]" style={{ width: `${p.progress}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{p.progress}% complete{p.end_date ? ` · target ${date(p.end_date)}` : ""}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10">
          <h2 className="font-mono text-[10px] tracking-wider text-[var(--text-muted)] uppercase mb-3">Invoices</h2>
          {invoices?.length ? (
            <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--card)]">
              {invoices.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="text-[var(--text)]">{i.invoice_number}</p>
                    <p className="text-xs text-[var(--text-muted)]">Due {date(i.due_date)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="tabular-nums text-[var(--text)]">{fmt(i.amount_due)}</span>
                    <span className="font-mono text-[10px] uppercase text-[var(--text-muted)]">{i.status}</span>
                    {i.pdf_path && <a href={`/api/invoices/${i.id}/pdf`} className="text-xs text-[var(--gold)] hover:underline">PDF</a>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No invoices yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
