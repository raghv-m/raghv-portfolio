"use client";
import { useState } from "react";
import { Send, Users, UserCheck } from "lucide-react";

interface Subscriber { id: string; email: string; name: string | null; active: boolean; subscribedAt: Date }

interface Props { subscribers: Subscriber[]; total: number; active: number }

export default function NewsletterClient({ subscribers, total, active }: Props) {
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; total: number } | null>(null);
  const [error, setError] = useState("");

  const send = async () => {
    if (!subject.trim() || !html.trim()) { setError("Subject and body are required"); return; }
    if (!confirm(`Send to ${active} active subscribers?`)) return;
    setError(""); setSending(true);
    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, html }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Send failed"); return; }
      setResult({ sent: json.sent, total: json.total });
      setSubject(""); setHtml("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="font-display text-2xl font-bold text-[var(--text)] mb-8">Newsletter</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="glass rounded-xl p-5 flex items-center gap-4">
            <Users className="w-8 h-8" style={{ color: "var(--gold)" }} />
            <div>
              <p className="font-display text-2xl font-bold text-[var(--text)]">{total}</p>
              <p className="font-mono text-[10px] text-[var(--text-muted)]">TOTAL SUBSCRIBERS</p>
            </div>
          </div>
          <div className="glass rounded-xl p-5 flex items-center gap-4">
            <UserCheck className="w-8 h-8" style={{ color: "var(--green)" }} />
            <div>
              <p className="font-display text-2xl font-bold text-[var(--text)]">{active}</p>
              <p className="font-mono text-[10px] text-[var(--text-muted)]">ACTIVE</p>
            </div>
          </div>
        </div>

        <div className="xl:grid xl:grid-cols-[1fr_360px] xl:gap-8">
          {/* Compose */}
          <div className="space-y-4 mb-8 xl:mb-0">
            <h2 className="font-display text-lg font-semibold text-[var(--text)]">Compose</h2>
            <div>
              <label className="font-mono text-[10px] text-[var(--text-muted)] block mb-1">SUBJECT</label>
              <input
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--gold)]"
                placeholder="Raghav's Cyber Daily — Issue #1"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="font-mono text-[10px] text-[var(--text-muted)] block mb-1">BODY (HTML)</label>
              <textarea
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--text-muted)] outline-none focus:border-[var(--gold)] resize-none"
                rows={14}
                placeholder={'<div style="font-family:monospace">Your content here</div>'}
                value={html}
                onChange={e => setHtml(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-[var(--red)]">{error}</p>}
            {result && <p className="text-sm text-[var(--green)]">Sent to {result.sent}/{result.total} subscribers.</p>}
            <button onClick={send} disabled={sending} className="btn-gold flex items-center gap-2">
              <Send className="w-4 h-4" /> {sending ? "Sending…" : `Send to ${active} subscribers`}
            </button>
          </div>

          {/* Subscriber list */}
          <div>
            <h2 className="font-display text-lg font-semibold text-[var(--text)] mb-4">Subscribers</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {subscribers.map(s => (
                <div key={s.id} className="glass rounded-xl px-4 py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--text)] truncate">{s.email}</p>
                    {s.name && <p className="font-mono text-[10px] text-[var(--text-muted)]">{s.name}</p>}
                  </div>
                  <span className="tag shrink-0 ml-3" style={s.active ? { color: "var(--green)", borderColor: "rgba(0,255,136,0.2)" } : {}}>{s.active ? "active" : "unsub"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
