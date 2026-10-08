"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Plus, Save, Trash2 } from "lucide-react";

import { addMilestoneAction, deleteMilestoneAction, toggleMilestoneAction, updateProjectAction } from "@/app/admin/crm/actions";
import { adminInput, Panel } from "@/components/admin/ui";

const STATUSES = ["planning", "in_progress", "review", "completed", "on_hold", "cancelled"] as const;

type Project = { id: string; title: string; description: string | null; status: string; endDate: string; valueCents: number; progress: number };
type Milestone = { id: string; title: string; completed: boolean; dueDate: string | null };

export function ProjectControls({ project, milestones }: { project: Project; milestones: Milestone[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ title: project.title, description: project.description ?? "", status: project.status, endDate: project.endDate, value: (project.valueCents / 100).toFixed(2) });
  const [newMilestone, setNewMilestone] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, success?: string) =>
    start(async () => {
      const r = await fn();
      setMessage(r.ok ? success ?? null : r.error ?? "Failed");
      router.refresh();
    });

  return (
    <div className="space-y-6">
      <Panel title="Details">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block sm:col-span-2"><span className="block font-mono text-[9px] text-[var(--text-muted)] uppercase mb-1">Title</span><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={adminInput} /></label>
          <label className="block sm:col-span-2"><span className="block font-mono text-[9px] text-[var(--text-muted)] uppercase mb-1">Description (the client sees this)</span><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={adminInput} /></label>
          <label className="block"><span className="block font-mono text-[9px] text-[var(--text-muted)] uppercase mb-1">Status</span>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={adminInput}>{STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select>
          </label>
          <label className="block"><span className="block font-mono text-[9px] text-[var(--text-muted)] uppercase mb-1">Target launch</span><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={adminInput} /></label>
          <label className="block"><span className="block font-mono text-[9px] text-[var(--text-muted)] uppercase mb-1">Value ($)</span><input inputMode="decimal" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className={adminInput} /></label>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            run(
              () => updateProjectAction(project.id, { title: form.title, description: form.description || null, status: form.status, end_date: form.endDate || null, value_cents: Math.round(Number(form.value || 0) * 100) }),
              "Saved",
            )
          }
          className="btn-solid-gold mt-4 inline-flex items-center gap-2"
        >
          {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
        </button>
        {message && <span className="ml-3 font-mono text-[11px] text-[var(--text-muted)]">{message}</span>}
      </Panel>

      <Panel title={`Milestones · ${project.progress}% complete`}>
        <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden mb-4"><div className="h-full bg-[var(--gold)] transition-all" style={{ width: `${project.progress}%` }} /></div>
        <ul className="space-y-2">
          {milestones.map((m) => (
            <li key={m.id} className="flex items-center gap-3 group">
              <button
                type="button"
                aria-label={m.completed ? `Mark ${m.title} not done` : `Mark ${m.title} done`}
                onClick={() => run(() => toggleMilestoneAction(m.id, !m.completed, project.id))}
                className={`size-5 shrink-0 rounded border grid place-items-center ${m.completed ? "bg-[var(--gold)] border-[var(--gold)] text-black" : "border-[var(--border)] hover:border-[var(--gold)]"}`}
              >
                {m.completed && <Check className="w-3.5 h-3.5" />}
              </button>
              <span className={`flex-1 text-sm ${m.completed ? "text-[var(--text-muted)] line-through" : "text-[var(--text)]"}`}>{m.title}</span>
              <button type="button" aria-label={`Delete ${m.title}`} onClick={() => run(() => deleteMilestoneAction(m.id, project.id))} className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--red)]"><Trash2 className="w-3.5 h-3.5" /></button>
            </li>
          ))}
        </ul>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newMilestone.trim()) return;
            run(() => addMilestoneAction(project.id, newMilestone));
            setNewMilestone("");
          }}
        >
          <input value={newMilestone} onChange={(e) => setNewMilestone(e.target.value)} placeholder="Add a milestone" className={adminInput} />
          <button type="submit" className="btn-gold inline-flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Add</button>
        </form>
      </Panel>
    </div>
  );
}
