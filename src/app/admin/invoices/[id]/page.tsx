import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { AdminPage, Panel, StatusPill, money, when } from "@/components/admin/ui";
import { getInvoiceForAdmin } from "@/lib/invoices/service";

import { InvoiceEditor } from "../InvoiceEditor";
import { InvoiceActions } from "./InvoiceActions";

export const dynamic = "force-dynamic";

export default async function InvoiceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const loaded = await getInvoiceForAdmin(id);
  if (!loaded) notFound();
  const { invoice, client } = loaded;

  return (
    <AdminPage
      label={`Invoice ${invoice.invoice_number}`}
      title={client?.full_name || client?.email || "Invoice"}
      back={{ href: "/admin/invoices", text: "All invoices" }}
      actions={<StatusPill status={invoice.status} />}
    >
      <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
        {invoice.status === "draft" ? (
          <InvoiceEditor
            mode="edit"
            invoiceId={invoice.id}
            initial={{
              dueDate: invoice.due_date.slice(0, 10),
              currency: invoice.currency === "usd" ? "usd" : "cad",
              notes: invoice.notes ?? "",
              lines: invoice.invoice_line_items.map((l) => ({ description: l.description, quantity: l.quantity, unitAmount: l.unit_amount })),
            }}
          />
        ) : (
          <Panel title="Line items">
            <table className="w-full text-sm">
              <tbody>
                {invoice.invoice_line_items.map((l, i) => (
                  <tr key={i} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 text-[var(--text)]">{l.description}</td>
                    <td className="py-2 text-right text-[var(--text-muted)]">{l.quantity} × {money(l.unit_amount, invoice.currency)}</td>
                    <td className="py-2 text-right tabular-nums text-[var(--text)]">{money(l.amount, invoice.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-right text-xl font-semibold tabular-nums text-[var(--text)]">{money(invoice.amount_due, invoice.currency)}</p>
            {invoice.notes && <p className="mt-4 text-sm text-[var(--text-muted)] whitespace-pre-wrap">{invoice.notes}</p>}
          </Panel>
        )}

        <div className="space-y-6">
          <Panel title="Details">
            <dl className="space-y-3 text-sm">
              <div><dt className="font-mono text-[9px] text-[var(--text-muted)] uppercase">Client</dt><dd className="text-[var(--text)]">{client?.full_name}<br />{client?.email && <Link href={`/admin/clients/${encodeURIComponent(client.email)}`} className="text-[var(--gold)] hover:underline">{client.email}</Link>}</dd></div>
              <div><dt className="font-mono text-[9px] text-[var(--text-muted)] uppercase">Total</dt><dd className="text-[var(--text)] tabular-nums">{money(invoice.amount_due, invoice.currency)}</dd></div>
              <div><dt className="font-mono text-[9px] text-[var(--text-muted)] uppercase">Due</dt><dd className="text-[var(--text)]">{when(invoice.due_date)}</dd></div>
              {invoice.sent_date && <div><dt className="font-mono text-[9px] text-[var(--text-muted)] uppercase">Sent</dt><dd className="text-[var(--text)]">{when(invoice.sent_date)}</dd></div>}
              {invoice.paid_date && <div><dt className="font-mono text-[9px] text-[var(--text-muted)] uppercase">Paid</dt><dd className="text-[var(--green)]">{when(invoice.paid_date)}</dd></div>}
            </dl>
          </Panel>
          <InvoiceActions id={invoice.id} status={invoice.status} hasPdf={Boolean(invoice.pdf_path)} />
        </div>
      </div>
    </AdminPage>
  );
}
