"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";

import { adminInput, Panel } from "@/components/admin/ui";

import { createInvoiceForEmailAction, updateDraftInvoiceAction } from "./actions";

type Line = { description: string; quantity: string; unit: string };

const toCents = (v: string) => Math.round(Number(v.replace(/[$,\s]/g, "") || 0) * 100);
const dollars = (cents: number) => (cents / 100).toFixed(2);
const fmt = (cents: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", currencyDisplay: "narrowSymbol" }).format(cents / 100);

/**
 * Line-item editor used for new invoices (with a client email) and for editing drafts.
 * Totals are recomputed by the database trigger on save; the preview here is for convenience.
 */
export function InvoiceEditor({
  mode,
  invoiceId,
  initial,
}: {
  mode: "new" | "edit";
  invoiceId?: string;
  initial: {
    email?: string;
    name?: string;
    company?: string;
    dueDate: string;
    currency: "cad" | "usd";
    notes: string;
    lines: { description: string; quantity: number; unitAmount: number }[];
  };
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [client, setClient] = useState({ email: initial.email ?? "", name: initial.name ?? "", company: initial.company ?? "" });
  const [dueDate, setDueDate] = useState(initial.dueDate);
  const [currency, setCurrency] = useState(initial.currency);
  const [notes, setNotes] = useState(initial.notes);
  const [lines, setLines] = useState<Line[]>(
    initial.lines.length ? initial.lines.map((l) => ({ description: l.description, quantity: String(l.quantity), unit: dollars(l.unitAmount) })) : [{ description: "", quantity: "1", unit: "" }],
  );

  const total = useMemo(() => lines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * toCents(l.unit), 0), [lines]);
  const update = (i: number, key: keyof Line, value: string) => {
    setSaved(false);
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, [key]: value } : l)));
  };

  function save() {
    setError(null);
    const payload = {
      dueDate,
      currency,
      notes,
      lineItems: lines
        .filter((l) => l.description.trim())
        .map((l) => ({ description: l.description.trim(), quantity: Number(l.quantity) || 1, unitAmount: toCents(l.unit) })),
    };
    start(async () => {
      const result =
        mode === "new"
          ? await createInvoiceForEmailAction({ ...payload, email: client.email, name: client.name, company: client.company || undefined })
          : await updateDraftInvoiceAction({ ...payload, invoiceId });
      if (!result.ok) return setError(result.error);
      if (mode === "new" && result.id) router.push(`/admin/invoices/${result.id}`);
      else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return (
    <Panel title={mode === "new" ? "New invoice" : "Edit draft"}>
      <div className="space-y-6">
        {mode === "new" && (
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Client email *"><input type="email" value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} className={adminInput} /></Field>
            <Field label="Client name *"><input value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} className={adminInput} /></Field>
            <Field label="Business"><input value={client.company} onChange={(e) => setClient({ ...client, company: e.target.value })} className={adminInput} /></Field>
          </div>
        )}
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Due date"><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={adminInput} /></Field>
          <Field label="Currency">
            <select value={currency} onChange={(e) => setCurrency(e.target.value as "cad" | "usd")} className={adminInput}>
              <option value="cad">CAD</option>
              <option value="usd">USD</option>
            </select>
          </Field>
        </div>

        <div>
          <div className="grid grid-cols-[1fr_70px_120px_110px_32px] gap-2 font-mono text-[9px] tracking-wider text-[var(--text-muted)] uppercase px-1 mb-1">
            <span>Description</span><span>Qty</span><span>Unit $</span><span className="text-right">Amount</span><span />
          </div>
          <div className="space-y-2">
            {lines.map((line, i) => (
              <div key={i} className="grid grid-cols-[1fr_70px_120px_110px_32px] gap-2 items-center">
                <input value={line.description} onChange={(e) => update(i, "description", e.target.value)} placeholder="Work or item" className={adminInput} aria-label="Description" />
                <input inputMode="numeric" value={line.quantity} onChange={(e) => update(i, "quantity", e.target.value)} className={adminInput} aria-label="Quantity" />
                <input inputMode="decimal" value={line.unit} onChange={(e) => update(i, "unit", e.target.value)} placeholder="0.00" className={adminInput} aria-label="Unit price" />
                <span className="text-right text-sm tabular-nums text-[var(--text)]">{fmt((Number(line.quantity) || 0) * toCents(line.unit))}</span>
                <button type="button" aria-label="Remove line" onClick={() => setLines((ls) => ls.filter((_, idx) => idx !== i))} className="text-[var(--text-muted)] hover:text-[var(--red)]">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setLines((ls) => [...ls, { description: "", quantity: "1", unit: "" }])} className="mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--gold)] hover:underline">
            <Plus className="w-3.5 h-3.5" /> Add line
          </button>
          <div className="mt-4 flex justify-end items-baseline gap-4 border-t border-[var(--border)] pt-4">
            <span className="text-sm text-[var(--text-muted)]">Total</span>
            <span className="text-xl font-semibold tabular-nums text-[var(--text)]">{fmt(total)}</span>
          </div>
        </div>

        <Field label="Notes on the invoice"><textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={adminInput} /></Field>

        {error && <p role="alert" className="font-mono text-[11px] text-[var(--red)]">{error}</p>}
        <div className="flex items-center gap-3">
          <button type="button" disabled={pending} onClick={save} className="btn-solid-gold inline-flex items-center gap-2">
            {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} {mode === "new" ? "Create draft" : "Save draft"}
          </button>
          {saved && <span className="font-mono text-[11px] text-[var(--green)]">Saved</span>}
        </div>
      </div>
    </Panel>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block font-mono text-[9px] tracking-wider text-[var(--text-muted)] uppercase mb-1">{label}</span>
      {children}
    </label>
  );
}
