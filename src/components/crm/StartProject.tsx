"use client";

import { useState, useTransition } from "react";
import { FolderPlus, Loader2 } from "lucide-react";

import { createProjectAction } from "@/app/admin/crm/actions";
import { adminInput } from "@/components/admin/ui";

/** Starts a project for a client: from a signed contract (title, value, milestones fill in) or blank. */
export function StartProject({ clientId, contracts }: { clientId: string; contracts: { id: string; number: string; title: string }[] }) {
  const [contractId, setContractId] = useState(contracts[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap items-end gap-2">
      {contracts.length > 0 && (
        <label className="block">
          <span className="block font-mono text-[9px] text-[var(--text-muted)] uppercase mb-1">From signed contract</span>
          <select value={contractId} onChange={(e) => setContractId(e.target.value)} className={adminInput}>
            {contracts.map((c) => <option key={c.id} value={c.id}>{c.number} · {c.title}</option>)}
            <option value="">No contract (blank project)</option>
          </select>
        </label>
      )}
      {!contractId && (
        <label className="block flex-1 min-w-48">
          <span className="block font-mono text-[9px] text-[var(--text-muted)] uppercase mb-1">Project title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={adminInput} />
        </label>
      )}
      <button
        type="button"
        disabled={pending || (!contractId && !title.trim())}
        onClick={() =>
          start(async () => {
            const r = await createProjectAction({ clientId, contractId: contractId || null, title: title || undefined });
            if (r && !r.ok) setError(r.error);
          })
        }
        className="btn-solid-gold inline-flex items-center gap-2"
      >
        {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderPlus className="w-3.5 h-3.5" />} Start project
      </button>
      {error && <p className="w-full font-mono text-[11px] text-[var(--red)]">{error}</p>}
    </div>
  );
}
