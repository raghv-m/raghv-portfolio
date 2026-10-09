"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { FileText, Loader2, Mail } from "lucide-react";

import { adminInput, Panel } from "@/components/admin/ui";

import { convertEstimateToInvoiceAction, sendPortalInviteAction, updateEstimateAction } from "../actions";

const STATUSES = ["new", "reviewed", "quoted", "converted", "declined"] as const;

export function EstimateControls({ id, email, status, notes, invoiceId }: { id: string; email: string; status: string; notes: string; invoiceId: string | null }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [draftNotes, setDraftNotes] = useState(notes);

  const run = (fn: () => Promise<{ ok: boolean; error?: string } | void>, success: string) =>
    start(async () => {
      const result = await fn();
      setMessage(result && !result.ok ? { text: result.error ?? "Failed", error: true } : { text: success });
    });

  return (
    <Panel title="Next steps">
      <div className="space-y-5">
        <div>
          <label htmlFor="status" className="font-mono text-[9px] tracking-wider text-[var(--text-muted)] uppercase">Status</label>
          <select id="status" defaultValue={status} disabled={pending} onChange={(e) => run(() => updateEstimateAction({ id, status: e.target.value }), "Status saved")} className={`${adminInput} mt-1`}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {invoiceId ? (
          <Link href={`/admin/invoices/${invoiceId}`} className="btn-gold w-full justify-center"><FileText className="w-3.5 h-3.5" /> Open its invoice</Link>
        ) : (
          <button type="button" disabled={pending} onClick={() => run(() => convertEstimateToInvoiceAction(id), "Invoice created")} className="btn-solid-gold w-full justify-center inline-flex items-center gap-2">
            {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />} Create client + draft invoice
          </button>
        )}
        <p className="text-[11px] text-[var(--text-muted)] -mt-3">Creates their account if needed and a draft you can adjust before sending.</p>

        <button type="button" disabled={pending} onClick={() => run(() => sendPortalInviteAction(email), "Portal invite sent")} className="btn-ghost w-full justify-center inline-flex items-center gap-2">
          <Mail className="w-3.5 h-3.5" /> Invite to client portal
        </button>

        <div>
          <label htmlFor="notes" className="font-mono text-[9px] tracking-wider text-[var(--text-muted)] uppercase">Private notes</label>
          <textarea id="notes" rows={5} value={draftNotes} onChange={(e) => setDraftNotes(e.target.value)} className={`${adminInput} mt-1`} placeholder="Call notes, scope changes, follow-ups…" />
          <button type="button" disabled={pending || draftNotes === notes} onClick={() => run(() => updateEstimateAction({ id, adminNotes: draftNotes }), "Notes saved")} className="btn-gold mt-2">Save notes</button>
        </div>

        {message && <p role="status" className={`font-mono text-[11px] ${message.error ? "text-[var(--red)]" : "text-[var(--green)]"}`}>{message.text}</p>}
      </div>
    </Panel>
  );
}
