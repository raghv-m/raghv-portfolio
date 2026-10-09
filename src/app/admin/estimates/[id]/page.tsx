import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { AdminPage, Panel, StatusPill, money, when } from "@/components/admin/ui";
import { BUDGET_LABELS, TIMELINE_LABELS } from "@/lib/estimator/schema";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

import { EstimateControls } from "./EstimateControls";

export const dynamic = "force-dynamic";

export default async function EstimateDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const admin = getSupabaseAdmin();
  const { data: e } = await admin.from("estimates").select("*").eq("id", id).maybeSingle();
  if (!e) notFound();

  const { data: items } = await admin.from("pricing_items").select("slug, label");
  const label = new Map((items ?? []).map((i) => [i.slug, i.label]));
  const names = (slugs?: string[] | null) => (slugs?.length ? slugs.map((s) => label.get(s) ?? s).join(", ") : "None");
  const address = [e.address_line1, e.address_line2, [e.city, e.region].filter(Boolean).join(", "), e.postal_code, e.country].filter(Boolean);
  const mapsUrl = e.place_id
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.join(", "))}&query_place_id=${encodeURIComponent(e.place_id)}`
    : address.length
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.join(", "))}`
      : null;

  return (
    <AdminPage
      label={`Estimate ${e.reference}`}
      title={`${e.name}${e.company ? ` · ${e.company}` : ""}`}
      back={{ href: "/admin/estimates", text: "All estimates" }}
      actions={<StatusPill status={e.status} />}
    >
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6">
          <Panel title="Their project">
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <Item term="Type">{label.get(e.category_slug) ?? e.category_slug}</Item>
              <Item term="Pages">{e.pages}</Item>
              <Item term="Features">{names(e.selections.features)}</Item>
              <Item term="Integrations">{names(e.selections.integrations)}</Item>
              <Item term="Hosting">{e.selections.hosting ? label.get(e.selections.hosting) ?? e.selections.hosting : "Not chosen"}</Item>
              <Item term="Extras">{names(e.selections.addons)}</Item>
              <Item term="Timeline">{e.timeline ? TIMELINE_LABELS[e.timeline] ?? e.timeline : "Not given"}</Item>
              <Item term="Budget">{e.budget ? BUDGET_LABELS[e.budget] ?? e.budget : "Not given"}</Item>
            </dl>
            <div className="mt-6">
              <p className="font-mono text-[9px] tracking-wider text-[var(--text-muted)] uppercase mb-2">In their words</p>
              <p className="text-sm text-[var(--text)] whitespace-pre-wrap leading-relaxed">{e.description || <span className="text-[var(--text-muted)]">No description.</span>}</p>
            </div>
          </Panel>

          <Panel title="Estimate they received">
            <table className="w-full text-sm">
              <tbody>
                {e.line_items.map((line, i) => (
                  <tr key={i} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 text-[var(--text)]">{line.label}{line.detail && <span className="block text-xs text-[var(--text-muted)]">{line.detail}</span>}</td>
                    <td className="py-2 text-right tabular-nums text-[var(--text)]">
                      {line.oneTimeCents ? money(line.oneTimeCents) : ""}
                      {line.monthlyCents ? <span className="block text-xs text-[var(--text-muted)]">{money(line.monthlyCents)}/mo</span> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-between items-baseline">
              <span className="text-[var(--text-muted)] text-sm">Market range shown</span>
              <span className="tabular-nums text-[var(--text-muted)] line-through">{money(e.one_time_low_cents)} – {money(e.one_time_high_cents)}</span>
            </div>
            <div className="mt-1 flex justify-between items-baseline">
              <span className="text-[var(--gold)] text-sm">Your price shown</span>
              <span className="text-lg font-semibold tabular-nums text-[var(--text)]">{money(e.my_low_cents)} – {money(e.my_high_cents)}</span>
            </div>
            {e.monthly_cents > 0 && <p className="text-right text-sm text-[var(--gold)] mt-1">+ {money(e.monthly_cents)}/month</p>}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Contact">
            <dl className="space-y-3 text-sm">
              <Item term="Email"><a href={`mailto:${e.email}?subject=Your project estimate ${e.reference}`} className="text-[var(--gold)] hover:underline break-all">{e.email}</a></Item>
              {e.phone && <Item term="Phone"><a href={`tel:${e.phone}`} className="hover:underline">{e.phone}</a></Item>}
              {address.length > 0 && (
                <Item term="Location">
                  {address.map((line) => <span key={line} className="block">{line}</span>)}
                  {mapsUrl && <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--gold)] hover:underline">Open in Google Maps ↗</a>}
                </Item>
              )}
              <Item term="Received">{when(e.created_at)}</Item>
              <Item term="Person"><Link href={`/admin/clients/${encodeURIComponent(e.email)}`} className="text-[var(--gold)] hover:underline">Full history →</Link></Item>
            </dl>
          </Panel>
          <EstimateControls id={e.id} email={e.email} status={e.status} notes={e.admin_notes ?? ""} invoiceId={e.invoice_id} />
        </div>
      </div>
    </AdminPage>
  );
}

function Item({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-mono text-[9px] tracking-wider text-[var(--text-muted)] uppercase">{term}</dt>
      <dd className="mt-0.5 text-[var(--text)]">{children}</dd>
    </div>
  );
}
