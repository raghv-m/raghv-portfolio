"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Trash2 } from "lucide-react";

import { deleteProjectUpdateAction, postProjectUpdateAction } from "@/app/admin/crm/actions";
import { adminInput, Panel } from "@/components/admin/ui";
import { ProjectTimeline, type TimelineEntry } from "@/components/crm/ProjectTimeline";
import { FieldError, focusFirstInvalid, invalidProps } from "@/components/ui/FieldError";
import { useConfirm, useToast } from "@/components/ui/feedback";

/** Post progress updates to the client's timeline and manage the history. */
export function ProjectUpdates({ projectId, entries }: { projectId: string; entries: TimelineEntry[] }) {
  const router = useRouter();
  const confirm = useConfirm();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ title: "", body: "", link: "", notify: true });
  const [titleError, setTitleError] = useState<string>();
  const formRef = useRef<HTMLFormElement>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setTitleError("Give the update a title, e.g. \"Homepage design ready for review\".");
      focusFirstInvalid(formRef.current);
      return;
    }
    setTitleError(undefined);
    start(async () => {
      const r = await postProjectUpdateAction(projectId, form);
      if (!r.ok) return toast(r.error, "error");
      if ("warning" in r && r.warning) toast(r.warning, "error");
      else toast(form.notify ? "Update posted and emailed to the client" : "Update posted");
      setForm({ title: "", body: "", link: "", notify: form.notify });
      router.refresh();
    });
  };

  const remove = async (entry: TimelineEntry) => {
    const ok = await confirm({ title: "Remove this update?", body: `"${entry.title}" disappears from the client's timeline.`, confirmLabel: "Remove update", cancelLabel: "Keep update", destructive: true });
    if (!ok) return;
    start(async () => {
      const r = await deleteProjectUpdateAction(entry.id);
      if (!r.ok) toast(r.error, "error");
      else toast("Update removed");
      router.refresh();
    });
  };

  return (
    <Panel title="Progress timeline (the client sees this)">
      <form ref={formRef} onSubmit={submit} noValidate className="space-y-3 mb-6">
        <div>
          <label htmlFor="update-title" className="block font-mono text-[9px] text-[var(--text-muted)] uppercase mb-1">What happened</label>
          <input id="update-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} {...invalidProps("update-title", titleError)} placeholder="Homepage design ready for review" maxLength={200} className={adminInput} />
          <FieldError name="update-title" message={titleError} />
        </div>
        <div>
          <label htmlFor="update-body" className="block font-mono text-[9px] text-[var(--text-muted)] uppercase mb-1">Details (optional)</label>
          <textarea id="update-body" rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="What's done, what's next, anything you need from them" className={adminInput} />
        </div>
        <div>
          <label htmlFor="update-link" className="block font-mono text-[9px] text-[var(--text-muted)] uppercase mb-1">Preview link (optional)</label>
          <input id="update-link" type="url" inputMode="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://preview.example.com" className={adminInput} />
        </div>
        <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <input type="checkbox" checked={form.notify} onChange={(e) => setForm({ ...form, notify: e.target.checked })} className="accent-[#d4a017]" />
          Email the client about this update
        </label>
        <button type="submit" disabled={pending} className="btn-gold btn-no-arrow inline-flex items-center gap-2">
          {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Post update
        </button>
      </form>
      <ProjectTimeline
        entries={entries}
        empty="Nothing yet. Post an update, complete a milestone or change the status and it shows here."
        action={(e) => (
          <button type="button" aria-label={`Remove "${e.title}"`} onClick={() => remove(e)} className="shrink-0 text-[var(--text-muted)] hover:text-[var(--red)]">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      />
    </Panel>
  );
}
