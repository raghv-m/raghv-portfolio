import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { AdminPage, Empty, Panel, StatusPill, money, when } from "@/components/admin/ui";
import { getPerson } from "@/lib/clients";

import { InviteButton } from "./InviteButton";

export const dynamic = "force-dynamic";

export default async function PersonPage({ params }: { params: Promise<{ email: string }> }) {
  const email = decodeURIComponent((await params).email);
  if (!z.email().safeParse(email).success) notFound();
  const person = await getPerson(email);
  if (!person.profile && !person.estimates.length && !person.messages.length) notFound();

  const name = person.profile?.full_name || person.estimates[0]?.name || person.messages[0]?.name || email;
  const company = person.estimates.find((e) => e.company)?.company;

  return (
    <AdminPage
      label="Person"
      title={`${name}${company ? ` · ${company}` : ""}`}
      back={{ href: "/admin/clients", text: "Clients & leads" }}
      actions={
        <>
          <StatusPill status={person.profile?.role ?? "lead"} />
          <a href={`mailto:${email}`} className="btn-ghost">Email</a>
          <Link href={`/admin/invoices/new?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`} className="btn-gold">New invoice</Link>
          {person.profile && <InviteButton email={email} />}
        </>
      }
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title={`Estimate requests (${person.estimates.length})`}>
          {person.estimates.length ? (
            <ul className="divide-y divide-[var(--border)] -my-2">
              {person.estimates.map((e) => (
                <li key={e.id}>
                  <Link href={`/admin/estimates/${e.id}`} className="flex justify-between gap-3 py-3 hover:text-[var(--gold)]">
                    <span>
                      <span className="block text-sm">{e.reference}</span>
                      <span className="block text-xs text-[var(--text-muted)]">{when(e.created_at)} · {e.pages} pages</span>
                    </span>
                    <span className="text-right">
                      <span className="block text-sm tabular-nums">{money(e.one_time_low_cents)} – {money(e.one_time_high_cents)}</span>
                      <StatusPill status={e.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <Empty>No estimates.</Empty>}
        </Panel>

        <Panel title={`Invoices (${person.invoices.length})`}>
          {person.invoices.length ? (
            <ul className="divide-y divide-[var(--border)] -my-2">
              {person.invoices.map((i) => (
                <li key={i.id}>
                  <Link href={`/admin/invoices/${i.id}`} className="flex justify-between gap-3 py-3 hover:text-[var(--gold)]">
                    <span>
                      <span className="block text-sm">{i.invoice_number}</span>
                      <span className="block text-xs text-[var(--text-muted)]">Due {when(i.due_date)}</span>
                    </span>
                    <span className="text-right">
                      <span className="block text-sm tabular-nums">{money(i.amount_due, i.currency)}</span>
                      <StatusPill status={i.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <Empty>{person.profile ? "No invoices yet." : "No account yet. Creating an invoice creates one."}</Empty>}
        </Panel>

        <Panel title={`Messages (${person.messages.length})`} className="lg:col-span-2">
          {person.messages.length ? (
            <ul className="space-y-4">
              {person.messages.map((m) => (
                <li key={m.id} className="border-l-2 border-[rgba(212,160,23,0.4)] pl-4">
                  <p className="text-xs text-[var(--text-muted)]">{when(m.createdAt.toISOString())} · {m.subject}</p>
                  <p className="mt-1 text-sm text-[var(--text)] whitespace-pre-wrap">{m.message}</p>
                </li>
              ))}
            </ul>
          ) : <Empty>No contact-form messages.</Empty>}
        </Panel>

        {person.profile && (
          <Panel title="Account" className="lg:col-span-2">
            <p className="text-sm text-[var(--text-muted)]">
              Portal account created {when(person.profile.created_at)}. They sign in at <span className="text-[var(--text)]">raghv.dev/auth/login</span>.
              {person.projects.length ? ` ${person.projects.length} project(s) in the portal.` : ""}
            </p>
          </Panel>
        )}
      </div>
    </AdminPage>
  );
}
