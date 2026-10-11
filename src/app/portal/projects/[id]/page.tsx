import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { z } from "zod";

import { postClientMessageAction } from "@/app/portal/actions";
import { MessageThread } from "@/components/crm/MessageThread";
import { ProjectTimeline } from "@/components/crm/ProjectTimeline";
import { requirePortalUser } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Project", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// Plain dates (due dates) are formatted in UTC so Edmonton time doesn't shift them back a day.
const date = (iso: string) => new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeZone: /^\d{4}-\d{2}-\d{2}$/.test(iso) ? "UTC" : "America/Edmonton" }).format(new Date(iso));

/** The client's view of one project: progress, milestones, the progress timeline and messages. RLS-scoped. */
export default async function PortalProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { userId } = await requirePortalUser();
  const supabase = await createSupabaseServerClient();
  const { data: project } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (!project) notFound();
  const [{ data: milestones }, { data: messages }, { data: updates }] = await Promise.all([
    supabase.from("milestones").select("*").eq("project_id", id).order("sort_order"),
    supabase.from("messages").select("id, sender_id, body, created_at").eq("project_id", id).order("created_at"),
    supabase.from("project_updates").select("id, kind, title, body, link_url, created_at").eq("project_id", id).order("created_at", { ascending: false }),
  ]);
  // Anyone who isn't the client in this thread is Raghav.
  const names = Object.fromEntries((messages ?? []).filter((m) => m.sender_id !== userId).map((m) => [m.sender_id, "Raghav"]));

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/portal" className="font-mono text-[10px] tracking-wider text-[var(--text-muted)] hover:text-[var(--gold)]">← Back to portal</Link>
        <p className="mt-6 font-mono text-[10px] tracking-[0.2em] text-[var(--gold)]">PROJECT · {project.status.replace("_", " ").toUpperCase()}</p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--text)]">{project.title}</h1>
        {project.description && <p className="mt-2 text-[var(--text-muted)] max-w-2xl">{project.description}</p>}

        <div className="mt-8 grid lg:grid-cols-[1fr_1.2fr] gap-6 items-start">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex items-baseline justify-between">
              <h2 className="font-mono text-[10px] tracking-wider text-[var(--text-muted)] uppercase">Progress</h2>
              <span className="text-2xl font-semibold tabular-nums text-[var(--text)]">{project.progress}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-[var(--border)] overflow-hidden"><div className="h-full bg-[var(--gold)]" style={{ width: `${project.progress}%` }} /></div>
            {project.end_date && <p className="mt-2 text-xs text-[var(--text-muted)]">Target launch {date(project.end_date)}</p>}
            <ol className="mt-5 space-y-3">
              {(milestones ?? []).map((m) => (
                <li key={m.id} className="flex items-center gap-3">
                  <span className={`size-5 shrink-0 rounded-full grid place-items-center border ${m.completed ? "bg-[var(--gold)] border-[var(--gold)] text-black" : "border-[var(--border)]"}`}>{m.completed && <Check className="w-3 h-3" />}</span>
                  <span className={`text-sm ${m.completed ? "text-[var(--text-muted)]" : "text-[var(--text)]"}`}>{m.title}</span>
                  {m.completed && m.completed_at && <span className="ml-auto font-mono text-[10px] text-[var(--text-muted)]">{date(m.completed_at)}</span>}
                </li>
              ))}
            </ol>
          </section>
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="font-mono text-[10px] tracking-wider text-[var(--text-muted)] uppercase mb-4">Messages</h2>
            <MessageThread projectId={project.id} meId={userId} names={names} initial={messages ?? []} send={postClientMessageAction} />
          </section>
        </div>

        <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <h2 className="font-mono text-[10px] tracking-wider text-[var(--text-muted)] uppercase mb-5">Progress timeline</h2>
          <ProjectTimeline entries={updates ?? []} />
        </section>
      </div>
    </div>
  );
}
