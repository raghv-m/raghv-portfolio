import { AdminPage } from "@/components/admin/ui";

import { InvoiceEditor } from "../InvoiceEditor";

/** Two weeks from today, as YYYY-MM-DD. */
function defaultDueDate() {
  return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ email?: string; name?: string }> }) {
  const { email = "", name = "" } = await searchParams;
  const due = defaultDueDate();
  return (
    <AdminPage label="Billing" title="New invoice" back={{ href: "/admin/invoices", text: "All invoices" }}>
      <p className="text-sm text-[var(--text-muted)] mb-6 max-w-2xl">
        If the email doesn&apos;t have an account yet, one is created so they can see the invoice in their portal. It
        stays a draft until you press Send.
      </p>
      <InvoiceEditor mode="new" initial={{ email, name, dueDate: due, currency: "cad", notes: "", lines: [] }} />
    </AdminPage>
  );
}
