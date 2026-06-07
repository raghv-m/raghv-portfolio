"use client";
import { useState } from "react";
import { Mail, CheckCircle, ArrowRight } from "lucide-react";

export default function SubscribeWidget({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined }),
      });
      if (!res.ok) { const j = await res.json(); setError(j.error ?? "Failed"); return; }
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className={`flex items-center gap-2 ${compact ? "text-sm" : ""}`}>
        <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "var(--green)" }} />
        <span className="text-[var(--text-muted)]">You're in. Check your inbox.</span>
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={submit} className="flex gap-2">
        <input
          type="email"
          required
          placeholder="Your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--gold)] placeholder:text-[var(--border)] min-w-0"
        />
        <button type="submit" disabled={loading} className="btn-gold text-sm px-4 py-2 shrink-0 flex items-center gap-1">
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        {error && <span className="text-xs text-[var(--red)] self-center">{error}</span>}
      </form>
    );
  }

  return (
    <div className="glass rounded-2xl p-8 text-center" style={{ border: "1px solid rgba(212,160,23,0.15)" }}>
      <Mail className="w-8 h-8 mx-auto mb-4" style={{ color: "var(--gold)" }} />
      <h3 className="font-display text-xl font-bold text-[var(--text)] mb-2">Raghav's Cyber Daily</h3>
      <p className="text-[var(--text-muted)] text-sm mb-6">Writeups, homelab experiments, and notes on breaking into offensive security — no spam, ever.</p>
      <form onSubmit={submit} className="space-y-3 max-w-sm mx-auto">
        <input type="text" placeholder="Your name (optional)" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--gold)] placeholder:text-[var(--border)]" />
        <input type="email" required placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--gold)] placeholder:text-[var(--border)]" />
        {error && <p className="text-xs text-[var(--red)]">{error}</p>}
        <button type="submit" disabled={loading} className="btn-gold w-full justify-center">
          {loading ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
    </div>
  );
}
