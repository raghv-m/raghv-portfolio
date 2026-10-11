import type { ReactNode } from "react";
import { CheckCircle2, ExternalLink, Flag, Sparkles } from "lucide-react";

export type TimelineEntry = {
  id: string;
  kind: "update" | "milestone" | "status";
  title: string;
  body: string | null;
  link_url: string | null;
  created_at: string;
};

const when = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Edmonton" }).format(new Date(iso));

const ICON = { update: Sparkles, milestone: CheckCircle2, status: Flag } as const;
const TONE = {
  update: "text-[var(--gold)] border-[rgba(212,160,23,0.45)]",
  milestone: "text-[var(--green)] border-[rgba(0,255,136,0.35)]",
  status: "text-[var(--text-muted)] border-[var(--border)]",
} as const;

/**
 * A project's progress history, newest first: posted updates, completed milestones and status
 * changes. No hooks, so it renders in the client portal (server) and the admin page (client).
 */
export function ProjectTimeline({ entries, action, empty }: { entries: TimelineEntry[]; action?: (e: TimelineEntry) => ReactNode; empty?: string }) {
  if (!entries.length) {
    return <p className="text-sm text-[var(--text-muted)]">{empty ?? "No updates yet. Progress will show up here as work happens."}</p>;
  }
  return (
    <ol className="relative">
      {entries.map((e, i) => {
        const Icon = ICON[e.kind];
        const last = i === entries.length - 1;
        return (
          <li key={e.id} className="relative flex gap-4 pb-6">
            {!last && <span aria-hidden="true" className="absolute left-[15px] top-8 bottom-0 w-px bg-[var(--border)]" />}
            <span className={`relative z-10 size-8 shrink-0 rounded-full border bg-[var(--card)] grid place-items-center ${TONE[e.kind]}`}>
              <Icon className="w-4 h-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-start justify-between gap-3">
                <p className={`font-medium leading-snug ${e.kind === "status" ? "text-[var(--text-muted)] text-sm" : "text-[var(--text)]"}`}>{e.title}</p>
                {action?.(e)}
              </div>
              <time dateTime={e.created_at} className="mt-0.5 block font-mono text-[10px] text-[var(--text-muted)]">{when(e.created_at)}</time>
              {e.body && <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">{e.body}</p>}
              {e.link_url && (
                <a href={e.link_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm text-[var(--gold)] hover:underline">
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" /> View preview
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
