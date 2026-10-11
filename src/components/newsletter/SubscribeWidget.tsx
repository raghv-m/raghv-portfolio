"use client";
import { useId, useRef, useState } from "react";
import { Mail, CheckCircle } from "lucide-react";

import { FieldError, focusFirstInvalid, invalidProps } from "@/components/ui/FieldError";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SubscribeWidget({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  // The widget can appear more than once on a page, so ids must be unique.
  const id = useId();
  const emailName = `${id}-email`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!EMAIL.test(email.trim())) {
      setError("Enter a valid email address, like you@example.com.");
      focusFirstInvalid(formRef.current);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(typeof j.error === "string" ? j.error : "Couldn't subscribe you. Please try again.");
        focusFirstInvalid(formRef.current);
        return;
      }
      setDone(true);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div role="status" className={`flex items-center gap-2 ${compact ? "text-sm" : ""}`}>
        <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "var(--green)" }} />
        <span className="text-[var(--text-muted)]">You&apos;re in. Check your inbox.</span>
      </div>
    );
  }

  const emailInput = (className: string, placeholder: string) => (
    <input
      id={emailName}
      type="email"
      required
      autoComplete="email"
      placeholder={placeholder}
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      {...invalidProps(emailName, error || undefined)}
      className={`${className} aria-[invalid=true]:border-[var(--red)]`}
    />
  );

  if (compact) {
    return (
      <form ref={formRef} onSubmit={submit} noValidate>
        <label htmlFor={emailName} className="sr-only">Email address</label>
        <div className="flex gap-2">
          {emailInput("flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--gold)] placeholder:text-[var(--border)] min-w-0", "Your email")}
          <button type="submit" disabled={loading} aria-label="Subscribe to the newsletter" className="btn-gold text-sm px-4 py-2 shrink-0 flex items-center gap-1" />
        </div>
        <FieldError name={emailName} message={error || undefined} />
      </form>
    );
  }

  return (
    <div className="glass rounded-2xl p-8 text-center" style={{ border: "1px solid rgba(212,160,23,0.15)" }}>
      <Mail className="w-8 h-8 mx-auto mb-4" style={{ color: "var(--gold)" }} />
      <h3 className="font-display text-xl font-bold text-[var(--text)] mb-2">Raghav&apos;s Cyber Daily</h3>
      <p className="text-[var(--text-muted)] text-sm mb-6">Writeups, homelab experiments, and notes on breaking into offensive security. No spam, ever.</p>
      <form ref={formRef} onSubmit={submit} noValidate className="space-y-3 max-w-sm mx-auto text-left">
        <label htmlFor={`${id}-name`} className="sr-only">Your name (optional)</label>
        <input id={`${id}-name`} type="text" autoComplete="name" placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--gold)] placeholder:text-[var(--border)]" />
        <label htmlFor={emailName} className="sr-only">Email address</label>
        {emailInput("w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--gold)] placeholder:text-[var(--border)]", "your@email.com")}
        <FieldError name={emailName} message={error || undefined} />
        <button type="submit" disabled={loading} className="btn-gold w-full justify-center">
          {loading ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
    </div>
  );
}
