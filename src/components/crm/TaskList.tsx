"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Plus, Trash2 } from "lucide-react";

import { addTaskAction, deleteTaskAction, toggleTaskAction } from "@/app/admin/crm/actions";
import { adminInput } from "@/components/admin/ui";

export type Task = { id: string; title: string; due_at: string | null; priority: "low" | "normal" | "high"; done_at: string | null; person_email: string | null };

const due = (iso: string) => new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeZone: "America/Edmonton" }).format(new Date(iso));
const isOverdue = (iso: string | null) => Boolean(iso && new Date(iso).getTime() < Date.now());

/** Follow-up tasks: add, tick off, delete. Pass `email` to scope it to one person. */
export function TaskList({ tasks, email, showPerson }: { tasks: Task[]; email?: string; showPerson?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("normal");
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const r = await fn();
      setError(r.ok ? null : r.error ?? "Failed");
      router.refresh();
    });

  return (
    <div>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          run(() => addTaskAction({ email: email ?? null, title, dueAt: dueAt ? `${dueAt}T09:00:00-07:00` : null, priority }));
          setTitle("");
          setDueAt("");
        }}
      >
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Follow up, send proposal, call back…" className={`${adminInput} flex-1 min-w-48`} />
        <input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className={`${adminInput} w-40`} aria-label="Due date" />
        <select value={priority} onChange={(e) => setPriority(e.target.value as Task["priority"])} className={`${adminInput} w-28`} aria-label="Priority">
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>
        <button type="submit" disabled={pending} className="btn-gold inline-flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Add</button>
      </form>
      {error && <p className="mt-2 font-mono text-[11px] text-[var(--red)]">{error}</p>}
      <ul className="mt-4 divide-y divide-[var(--border)]">
        {tasks.length === 0 && <li className="py-4 text-sm text-[var(--text-muted)]">Nothing to do. Nice.</li>}
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-3 py-2.5 group">
            <button
              type="button"
              aria-label={t.done_at ? "Mark not done" : "Mark done"}
              onClick={() => run(() => toggleTaskAction(t.id, !t.done_at, t.person_email))}
              className={`size-5 shrink-0 rounded border grid place-items-center ${t.done_at ? "bg-[var(--gold)] border-[var(--gold)] text-black" : "border-[var(--border)] hover:border-[var(--gold)]"}`}
            >
              {t.done_at && <Check className="w-3.5 h-3.5" />}
            </button>
            <span className="flex-1 min-w-0">
              <span className={`block text-sm ${t.done_at ? "line-through text-[var(--text-muted)]" : "text-[var(--text)]"}`}>
                {t.priority === "high" && !t.done_at && <span className="text-[var(--red)] mr-1">●</span>}
                {t.title}
              </span>
              <span className="block font-mono text-[10px] text-[var(--text-muted)]">
                {t.due_at ? <span className={!t.done_at && isOverdue(t.due_at) ? "text-[var(--red)]" : ""}>Due {due(t.due_at)}</span> : "No due date"}
                {showPerson && t.person_email && <> · <Link href={`/admin/clients/${encodeURIComponent(t.person_email)}`} className="hover:text-[var(--gold)]">{t.person_email}</Link></>}
              </span>
            </span>
            <button type="button" aria-label="Delete task" onClick={() => run(() => deleteTaskAction(t.id, t.person_email))} className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--red)]"><Trash2 className="w-3.5 h-3.5" /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}
