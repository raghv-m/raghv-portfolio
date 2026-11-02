"use client";
import { useId, useRef, useState } from "react";
import { Mail, CheckCircle } from "lucide-react";

import { FieldError, focusFirstInvalid, invalidProps } from "@/components/ui/FieldError";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SubscribeWidget({
  compact = false,
  onSuccess,
  onClose,
}: {
  compact?: boolean;
  onSuccess?: () => void;
  onClose?: () => void;
}) {
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
      onSuccess?.();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    if (compact) {
      return (
        <div role="status" className="flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "var(--cf-green, var(--green))" }} />
          <span style={{ color: "var(--cf-muted, var(--text-muted))" }}>You&apos;re in. Check your inbox.</span>
        </div>
      );
    }
    return (
      <div
        role="status"
        className="p-8 text-center"
        style={{ background: "var(--cf-paper-2, var(--card))", border: "2px solid var(--cf-ink, var(--border))" }}
      >
        <CheckCircle className="w-10 h-10 mx-auto mb-4" style={{ color: "var(--cf-red, var(--gold))" }} />
        <h3 className="cf-display text-[22px] mb-2" style={{ color: "var(--cf-ink, var(--text))" }}>
          You&apos;re in.
        </h3>
        <p className="text-sm mb-6" style={{ color: "var(--cf-muted, var(--text-muted))" }}>
          The welcome mail is on its way to {email.trim()}. After that, the Brief lands when there is something
          worth reading. No spam, ever.
        </p>
        {onClose ? (
          <button type="button" onClick={onClose} className="btn-gold w-full justify-center">
            Done, back to the site
          </button>
        ) : (
          <a href="/blog" className="btn-gold w-full justify-center">
            Browse the blog
          </a>
        )}
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
      className={className}
    />
  );

  if (compact) {
    return (
      <form ref={formRef} onSubmit={submit} noValidate>
        <label htmlFor={emailName} className="sr-only">Email address</label>
        <div className="flex gap-2">
          {emailInput("cf-input flex-1 min-w-0", "Your email")}
          <button type="submit" disabled={loading} aria-label="Subscribe to the newsletter" className="btn-gold text-sm px-4 py-2 shrink-0 flex items-center gap-1">{loading ? "…" : "→"}</button>
        </div>
        <FieldError name={emailName} message={error || undefined} />
      </form>
    );
  }

  return (
    <div className="p-8 text-center" style={{ background: "var(--cf-paper-2, var(--card))", border: "2px solid var(--cf-ink, var(--border))" }}>
      <Mail className="w-8 h-8 mx-auto mb-4" style={{ color: "var(--cf-red, var(--gold))" }} />
      <h3 className="cf-display text-[22px] mb-2" style={{ color: "var(--cf-ink, var(--text))" }}>Blue Team Brief</h3>
      <p className="text-sm mb-6" style={{ color: "var(--cf-muted, var(--text-muted))" }}>The week&apos;s real attacks in plain English: what happened, what to hunt for. Plus notes from the homelab. No spam, ever.</p>
      <form ref={formRef} onSubmit={submit} noValidate className="space-y-3 max-w-sm mx-auto text-left">
        <label htmlFor={`${id}-name`} className="sr-only">Your name (optional)</label>
        <input id={`${id}-name`} type="text" autoComplete="name" placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} className="cf-input" />
        <label htmlFor={emailName} className="sr-only">Email address</label>
        {emailInput("cf-input", "your@email.com")}
        <FieldError name={emailName} message={error || undefined} />
        <button type="submit" disabled={loading} className="btn-gold w-full justify-center">
          {loading ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
    </div>
  );
}
