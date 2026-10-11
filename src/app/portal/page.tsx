import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

import { signOutAction } from "@/app/auth/actions";
import { requirePortalUser } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Client portal", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const fmt = (cents: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 }).format(cents / 100);
// Plain dates (due dates) are formatted in UTC so Edmonton time doesn't shift them back a day.
const date = (iso: string) => new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeZone: /^\d{4}-\d{2}-\d{2}$/.test(iso) ? "UTC" : "America/Edmonton" }).format(new Date(iso));

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
  const [{ data: estimates }, { data: projects }, { data: invoices }, { data: questionnaires }, { data: contracts }, { data: updates }] = await Promise.all([
    supabase.from("estimates").select("id, reference, status, category_slug, pages, my_low_cents, my_high_cents, monthly_cents, created_at").order("created_at", { ascending: false }),
    supabase.from("projects").select("id, title, status, progress, end_date").order("created_at", { ascending: false }),
    supabase.from("invoices").select("id, invoice_number, status, amount_due, amount_paid, currency, due_date, pdf_path").order("created_at", { ascending: false }),
    supabase.from("questionnaires").select("id, status, sent_at").order("sent_at", { ascending: false }),
    supabase.from("contracts").select("id, number, title, status, sent_at, client_signed_at").neq("status", "void").order("created_at", { ascending: false }),
    // RLS limits this to the client's own projects; newest first, so the first per project is the latest.
    supabase.from("project_updates").select("project_id, title, created_at").order("created_at", { ascending: false }).limit(50),
  ]);
  const latestUpdate = new Map<string, { title: string; created_at: string }>();
  for (const u of updates ?? []) if (!latestUpdate.has(u.project_id)) latestUpdate.set(u.project_id, u);
  const todo = [
    ...(questionnaires ?? []).filter((q) => q.status === "sent").map((q) => ({ href: `/portal/questionnaire/${q.id}`, title: "Fill in your project questionnaire", detail: "About 10 minutes. I use it to prepare our agreement." })),
    ...(contracts ?? []).filter((c) => c.status === "sent").map((c) => ({ href: `/portal/contracts/${c.id}`, title: `Review and sign ${c.title}`, detail: `${c.number} is ready for your signature.` })),
  ];

  // Where the whole engagement stands, from first request to launch. Shown even before a
  // project exists, so the client always sees what's done and what's next.
  const project = projects?.[0];
  const signed = (contracts ?? []).find((c) => c.status === "signed");
  const pendingContract = (contracts ?? []).find((c) => c.status === "sent");
  const openQuestionnaire = (questionnaires ?? []).find((q) => q.status === "sent");
  const paidInvoice = (invoices ?? []).some((i) => i.status === "paid");
  const openInvoice = (invoices ?? []).some((i) => i.status === "sent" || i.status === "overdue");
  const launched = project?.status === "completed";
  const journey: { title: string; detail: string; done: boolean; href?: string }[] = [
    { title: "Request sent", detail: estimates?.length ? `Received ${date(estimates[estimates.length - 1].created_at)}` : "Start with an estimate", done: Boolean(estimates?.length), href: estimates?.length ? undefined : "/estimate" },
    { title: "Questionnaire", detail: (questionnaires ?? []).some((q) => q.status === "submitted") ? "Submitted, thank you" : openQuestionnaire ? "Waiting for your answers" : "Sent after your request is reviewed", done: (questionnaires ?? []).some((q) => q.status === "submitted"), href: openQuestionnaire ? `/portal/questionnaire/${openQuestionnaire.id}` : undefined },
    { title: "Agreement", detail: signed ? `Signed${signed.client_signed_at ? ` ${date(signed.client_signed_at)}` : ""}` : pendingContract ? "Ready for your signature" : "Prepared from your questionnaire", done: Boolean(signed), href: signed ? `/portal/contracts/${signed.id}` : pendingContract ? `/portal/contracts/${pendingContract.id}` : undefined },
    { title: "Deposit", detail: paidInvoice ? "Paid, thank you" : openInvoice ? "Invoice sent, see below" : "Invoiced once the agreement is signed", done: paidInvoice, href: openInvoice ? "#invoices" : undefined },
    { title: "Build", detail: project ? `${project.progress}% complete${latestUpdate.has(project.id) ? `: ${latestUpdate.get(project.id)!.title}` : ""}` : "Starts after the deposit", done: Boolean(project && (project.progress >= 100 || launched)), href: project ? `/portal/projects/${project.id}` : undefined },
    { title: "Launch", detail: launched ? "Your site is live" : project?.end_date ? `Target ${date(project.end_date)}` : "Date set in your agreement", done: launched, href: project ? `/portal/projects/${project.id}` : undefined },
  ];
  const current = journey.findIndex((s) => !s.done);

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

        <section className="mt-10 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6" aria-labelledby="journey-title">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="journey-title" className="font-mono text-[10px] tracking-wider text-[var(--gold)] uppercase">Your project</h2>
            {project && <Link href={`/portal/projects/${project.id}`} className="text-xs text-[var(--gold)] hover:underline">Full progress and timeline →</Link>}
          </div>
          <ol className="mt-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {journey.map((step, i) => {
              const state = step.done ? "done" : i === current ? "current" : "upcoming";
              const body = (
                <>
                  <span className={`size-7 shrink-0 rounded-full grid place-items-center border text-xs font-semibold ${state === "done" ? "bg-[var(--gold)] border-[var(--gold)] text-black" : state === "current" ? "border-[var(--gold)] text-[var(--gold)]" : "border-[var(--border)] text-[var(--text-muted)]"}`}>
                    {state === "done" ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className={`block text-sm font-medium ${state === "upcoming" ? "text-[var(--text-muted)]" : "text-[var(--text)]"}`}>{step.title}</span>
                    <span className="block text-xs text-[var(--text-muted)] leading-snug">{step.detail}</span>
                  </span>
                </>
              );
              return (
                <li key={step.title} aria-current={state === "current" ? "step" : undefined}>
                  {step.href ? (
                    <Link href={step.href} className="flex lg:flex-col gap-3 rounded-lg p-1 -m-1 hover:bg-[rgba(212,160,23,0.06)] transition-colors">{body}</Link>
                  ) : (
                    <div className="flex lg:flex-col gap-3">{body}</div>
                  )}
                </li>
              );
            })}
          </ol>
          {project && (
            <div className="mt-5">
              <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden"><div className="h-full bg-[var(--gold)]" style={{ width: `${project.progress}%` }} /></div>
              <p className="mt-1.5 text-xs text-[var(--text-muted)]">{project.title}: {project.progress}% complete</p>
            </div>
          )}
        </section>

        {todo.length > 0 && (
          <section className="mt-10">
            <h2 className="font-mono text-[10px] tracking-wider text-[var(--gold)] uppercase mb-3">To do</h2>
            <ul className="space-y-3">
              {todo.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="flex items-center justify-between gap-4 rounded-xl border border-[rgba(212,160,23,0.4)] bg-[rgba(212,160,23,0.05)] p-5 hover:border-[var(--gold)] transition-colors">
                    <span>
                      <span className="block text-[var(--text)] font-medium">{t.title}</span>
                      <span className="block text-sm text-[var(--text-muted)]">{t.detail}</span>
                    </span>
                    <span className="btn-gold shrink-0">Open</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

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
                    <Link href={`/portal/projects/${p.id}`} className="text-[var(--text)] hover:text-[var(--gold)]">{p.title} →</Link>
                    <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase">{p.status.replace("_", " ")}</p>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                    <div className="h-full bg-[var(--gold)]" style={{ width: `${p.progress}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{p.progress}% complete{p.end_date ? ` · target ${date(p.end_date)}` : ""}</p>
                  {latestUpdate.has(p.id) && (
                    <p className="mt-3 text-sm text-[var(--text-muted)]">
                      <span className="font-mono text-[10px] tracking-wider text-[var(--gold)] uppercase mr-2">Latest</span>
                      {latestUpdate.get(p.id)!.title} <span className="text-xs">· {date(latestUpdate.get(p.id)!.created_at)}</span>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {contracts && contracts.some((c) => c.status === "signed") && (
          <section className="mt-10">
            <h2 className="font-mono text-[10px] tracking-wider text-[var(--text-muted)] uppercase mb-3">Agreements</h2>
            <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--card)]">
              {contracts.filter((c) => c.status === "signed").map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <Link href={`/portal/contracts/${c.id}`} className="hover:text-[var(--gold)]">
                    <span className="block text-[var(--text)]">{c.title}</span>
                    <span className="block text-xs text-[var(--text-muted)]">{c.number}{c.client_signed_at ? ` · signed ${date(c.client_signed_at)}` : ""}</span>
                  </Link>
                  <a href={`/api/contracts/${c.id}/pdf`} className="text-xs text-[var(--gold)] hover:underline">PDF</a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section id="invoices" className="mt-10 scroll-mt-24">
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
