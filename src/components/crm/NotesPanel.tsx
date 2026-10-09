"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pin, PinOff, Trash2 } from "lucide-react";

import { addNoteAction, deleteNoteAction, toggleNotePinAction } from "@/app/admin/crm/actions";
import { adminInput } from "@/components/admin/ui";

type Note = { id: string; body: string; pinned: boolean; created_at: string };
const when = (iso: string) => new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Edmonton" }).format(new Date(iso));

/** Private notes about one person (calls, preferences, scope changes). Pinned notes stay on top. */
export function NotesPanel({ email, notes }: { email: string; notes: Note[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [pending, start] = useTransition();
  const sorted = [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.created_at.localeCompare(a.created_at));
  const run = (fn: () => Promise<unknown>) => start(async () => { await fn(); router.refresh(); });

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); if (!draft.trim()) return; run(() => addNoteAction(email, draft)); setDraft(""); }}>
        <textarea rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Call notes, what they care about, scope changes…" className={adminInput} />
        <button type="submit" disabled={pending || !draft.trim()} className="btn-gold mt-2">Add note</button>
      </form>
      <ul className="mt-4 space-y-3">
        {sorted.map((n) => (
          <li key={n.id} className={`rounded-lg border p-3 group ${n.pinned ? "border-[rgba(212,160,23,0.4)] bg-[rgba(212,160,23,0.04)]" : "border-[var(--border)]"}`}>
            <p className="text-sm text-[var(--text)] whitespace-pre-wrap">{n.body}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-[10px] text-[var(--text-muted)]">{when(n.created_at)}</span>
              <span className="flex gap-2 opacity-60 group-hover:opacity-100">
                <button type="button" aria-label={n.pinned ? "Unpin note" : "Pin note"} onClick={() => run(() => toggleNotePinAction(n.id, !n.pinned, email))} className="text-[var(--text-muted)] hover:text-[var(--gold)]">
                  {n.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                </button>
                <button type="button" aria-label="Delete note" onClick={() => window.confirm("Delete this note?") && run(() => deleteNoteAction(n.id, email))} className="text-[var(--text-muted)] hover:text-[var(--red)]">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
