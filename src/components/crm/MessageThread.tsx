"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, Send } from "lucide-react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type ThreadMessage = { id: string; sender_id: string; body: string; created_at: string };

/**
 * A project's message thread. New messages arrive live over Supabase Realtime (RLS still
 * applies, so each side only receives messages for projects it can see). Sending goes through
 * the server action passed in.
 */
export function MessageThread({
  projectId,
  meId,
  names,
  initial,
  send,
}: {
  projectId: string;
  meId: string;
  names: Record<string, string>;
  initial: ThreadMessage[];
  send: (projectId: string, body: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [messages, setMessages] = useState(initial);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`messages:${projectId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `project_id=eq.${projectId}` }, (payload) => {
        const m = payload.new as ThreadMessage;
        setMessages((current) => (current.some((x) => x.id === m.id) ? current : [...current, m]));
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [projectId]);

  useEffect(() => bottom.current?.scrollIntoView({ block: "end" }), [messages.length]);

  const when = (iso: string) => new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Edmonton" }).format(new Date(iso));

  return (
    <div className="flex flex-col">
      <div className="max-h-[420px] overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && <p className="text-sm text-[var(--text-muted)] py-6 text-center">No messages yet. Say hello.</p>}
        {messages.map((m) => {
          const mine = m.sender_id === meId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${mine ? "bg-[rgba(212,160,23,0.12)] border border-[rgba(212,160,23,0.3)]" : "bg-[var(--bg)] border border-[var(--border)]"}`}>
                <p className="text-sm text-[var(--text)] whitespace-pre-wrap">{m.body}</p>
                <p className="mt-1 font-mono text-[9px] text-[var(--text-muted)]">{mine ? "You" : names[m.sender_id] ?? "Them"} · {when(m.created_at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          start(async () => {
            setError(null);
            const result = await send(projectId, draft);
            if (result.ok) setDraft("");
            else setError(result.error ?? "Couldn't send");
          });
        }}
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          rows={2}
          placeholder="Write a message… (Enter to send, Shift+Enter for a new line)"
          className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[rgba(212,160,23,0.5)] resize-none"
        />
        <button type="submit" disabled={pending || !draft.trim()} className="btn-solid-gold self-end inline-flex items-center gap-2" aria-label="Send message">
          {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </button>
      </form>
      {error && <p role="alert" className="mt-2 font-mono text-[11px] text-[var(--red)]">{error}</p>}
    </div>
  );
}
