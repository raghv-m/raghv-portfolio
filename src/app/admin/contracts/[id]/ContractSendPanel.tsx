"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, PenLine, XCircle } from "lucide-react";

import { adminInput, Panel } from "@/components/admin/ui";

import { sendContractAction, voidContractAction } from "../actions";

export function ContractSendPanel({ id, status, defaultSigner, hasPdf }: { id: string; status: string; defaultSigner: string; hasPdf: boolean }) {
  const router = useRouter();
  const [signer, setSigner] = useState(defaultSigner);
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, success: string) =>
    start(async () => {
      const result = await fn();
      setMessage(result.ok ? { text: success } : { text: result.error ?? "Failed", error: true });
      router.refresh();
    });

  return (
    <Panel title="Sign & send">
      {status === "draft" && (
        <div className="space-y-4">
          <p className="text-xs text-[var(--text-muted)]">Sending locks the text, records its fingerprint, signs it as you, and emails the client a link to sign in their portal.</p>
          <label className="block">
            <span className="block font-mono text-[9px] tracking-wider text-[var(--text-muted)] uppercase mb-1">Your signature (full name)</span>
            <input value={signer} onChange={(e) => setSigner(e.target.value)} className={`${adminInput} font-serif italic text-lg`} />
          </label>
          <label className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 accent-[#d4a017]" />
            I&apos;ve checked the agreement and I agree to it on behalf of the Developer.
          </label>
          <button type="button" disabled={pending || !confirmed || signer.trim().length < 2} onClick={() => run(() => sendContractAction(id, signer), "Signed and sent to the client")} className="btn-solid-gold w-full justify-center inline-flex items-center gap-2">
            {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PenLine className="w-3.5 h-3.5" />} Sign &amp; send to client
          </button>
        </div>
      )}
      {status === "sent" && <p className="text-sm text-[var(--text-muted)]">Waiting for the client to sign in their portal. You&apos;ll both get the signed PDF by email.</p>}
      {status === "signed" && <p className="text-sm text-[var(--green)]">Signed by both parties. Next: send the deposit invoice.</p>}
      {status === "void" && <p className="text-sm text-[var(--text-muted)]">Void. Draft a new contract from the client&apos;s page if needed.</p>}

      <div className="mt-4 space-y-2">
        {hasPdf && (
          <a href={`/api/contracts/${id}/pdf`} target="_blank" rel="noopener noreferrer" className="btn-ghost w-full justify-center inline-flex items-center gap-2">
            <Download className="w-3.5 h-3.5" /> Signed PDF
          </a>
        )}
        {status !== "void" && (
          <button type="button" disabled={pending} onClick={() => window.confirm("Void this contract? It stays on record but is no longer in effect.") && run(() => voidContractAction(id), "Voided")} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--red)]">
            <XCircle className="w-3.5 h-3.5" /> Void contract
          </button>
        )}
      </div>
      {message && <p role="status" className={`mt-3 font-mono text-[11px] ${message.error ? "text-[var(--red)]" : "text-[var(--green)]"}`}>{message.text}</p>}
    </Panel>
  );
}
