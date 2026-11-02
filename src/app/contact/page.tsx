"use client";
import { useState, useEffect, useRef } from "react";

import { FieldError, focusFirstInvalid, invalidProps } from "@/components/ui/FieldError";
import { PageHead } from "@/components/casefile/PageHead";
import { Stamp } from "@/components/casefile/Stamp";
import { motion } from "framer-motion";
import { Send, Mail, MapPin, Globe, Lock, CheckCircle, Download } from "lucide-react";
import { EASE_OUT } from "@/components/casefile/motion";

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const SUBJECTS = ["Job Opportunity", "Collaboration", "General Inquiry", "Other"];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", website: "" });
  const [csrf, setCsrf] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"name" | "email" | "subject" | "message", string>>>({});
  const formRef = useRef<HTMLFormElement>(null);

  // Same rules as the server (api/contact), so people see problems before sending.
  const validate = () => {
    const errors: typeof fieldErrors = {};
    if (!form.name.trim()) errors.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Enter a valid email address, like jane@company.com.";
    if (!form.subject) errors.subject = "Choose a subject.";
    if (form.message.trim().length < 10) errors.message = "Write at least a sentence (10 characters or more).";
    return errors;
  };

  useEffect(() => {
    fetch("/api/csrf").then((r) => r.json()).then((d) => setCsrf(d.token)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      focusFirstInvalid(formRef.current);
      return;
    }
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, _csrf: csrf }),
      });
      if (res.ok) {
        setState("done");
      } else {
        const d = await res.json();
        setError(typeof d.error === "string" ? d.error : "Your message couldn't be sent. Please try again, or email hello@raghv.dev.");
        setState("error");
      }
    } catch {
      setError("Couldn't reach the server. Check your connection and try again, or email hello@raghv.dev.");
      setState("error");
    }
  };

  return (
    <div className="cf-wrap pb-24">
      <PageHead
        kicker="Contact"
        title="Establish connection"
        lede="Job opportunity, a website you need built, or a question about the lab: this form reaches me directly. I reply within 24 to 48 hours."
      />

      <div className="mt-8 flex flex-wrap items-center gap-5">
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--cf-green)] animate-pulse" />
          <span className="cf-mono cf-fs-label tracking-wider" style={{ color: "var(--cf-green)" }}>
            AVAILABLE FOR OPPORTUNITIES · 2025/2026
          </span>
        </span>
        <Stamp tone="red" r={-2.3} s={0.97} o={0.9} bw={2.5}>Open to work</Stamp>
      </div>

      <div className="mt-12">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Info panel — 2 cols */}
          <motion.div
            initial={{ opacity: 0, x: -44, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT }}
            className="lg:col-span-2 space-y-4"
          >
            <div className="p-6" style={{ border: "1.5px solid var(--cf-ink)", background: "var(--cf-paper-2)" }}>
              <h2 className="cf-mono cf-fs-data font-bold tracking-wider mb-5" style={{ color: "var(--cf-red)" }}>CONTACT ENDPOINTS</h2>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: "Email", value: "hello@raghv.dev", href: "mailto:hello@raghv.dev", color: "var(--cf-gold)" },
                  { icon: MapPin, label: "Location", value: "Edmonton, AB, Canada", color: "var(--cf-gold)" },
                  { icon: Globe, label: "Portfolio", value: "raghv.dev", href: "https://www.raghv.dev", color: "var(--cf-gold)" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center shrink-0"
                      style={{ border: "1px solid var(--cf-faint)", background: "var(--cf-paper)", color: item.color }}>
                      <item.icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="cf-mono cf-fs-data" style={{ color: "var(--cf-muted)" }}>{item.label}</p>
                      {item.href
                        ? <a href={item.href} className="cf-ulink text-[13px]" style={{ color: "var(--cf-ink)" }}>{item.value}</a>
                        : <p className="text-[13px]" style={{ color: "var(--cf-ink)" }}>{item.value}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social links */}
            <div className="p-5" style={{ border: "1px solid var(--cf-faint)", background: "var(--cf-paper-2)" }}>
              <p className="cf-mono cf-fs-data tracking-wider mb-4" style={{ color: "var(--cf-muted)" }}>SOCIAL · COMMUNITY</p>
              <div className="space-y-3">
                {[
                  { icon: GithubIcon, label: "GitHub", value: "HomeLab-Raghav", href: "https://github.com/HomeLab-Raghav", color: "var(--cf-muted)" },
                  { icon: LinkedinIcon, label: "LinkedIn", value: "raghav-mahajan-17611b24b", href: "https://linkedin.com/in/raghav-mahajan-17611b24b", color: "var(--cf-gold)" },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 group">
                    <div className="w-8 h-8 flex items-center justify-center shrink-0"
                      style={{ border: "1px solid var(--cf-faint)", background: "var(--cf-paper)", color: s.color }}>
                      <s.icon />
                    </div>
                    <div>
                      <p className="cf-mono cf-fs-data" style={{ color: "var(--cf-muted)" }}>{s.label}</p>
                      <p className="text-[13px] group-hover:text-[var(--cf-red)] transition-colors" style={{ color: "var(--cf-ink)" }}>{s.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Resume download */}
            <a href="/resume.pdf" download="Raghav_Mahajan_Resume.pdf" className="btn-gold w-full justify-center">
              <Download className="w-3.5 h-3.5" /> Download Resume
            </a>

            {/* Security notice */}
            <div className="flex items-center gap-2 px-4 py-2.5" style={{ border: "1px solid var(--cf-faint)" }}>
              <Lock className="w-3 h-3" style={{ color: "var(--cf-gold)" }} />
              <p className="cf-mono cf-fs-data" style={{ color: "var(--cf-muted)" }}>
                HTTPS · CSRF protected · IP hashed
              </p>
            </div>
          </motion.div>

          {/* Form — 3 cols */}
          <motion.div
            initial={{ opacity: 0, x: 44, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT }}
            className="lg:col-span-3"
          >
            <div style={{ border: "2px solid var(--cf-ink)", background: "var(--cf-paper-2)" }}>
              {/* Dossier form header */}
              <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: "3px double var(--cf-ink)" }}>
                <h2 className="cf-mono cf-fs-data font-bold" style={{ color: "var(--cf-ink)" }}>FILE A MESSAGE</h2>
                <span className="cf-mono cf-fs-data" style={{ color: "var(--cf-muted)" }}>secure-compose · raghv.dev</span>
                <Lock className="w-3 h-3 ml-auto" style={{ color: "var(--cf-red)" }} />
              </div>

              <div className="p-6">
                {state === "done" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 gap-4 text-center"
                  >
                    <CheckCircle className="w-14 h-14" style={{ color: "var(--cf-green)" }} />
                    <div>
                      <p className="cf-mono text-sm font-bold mb-1" style={{ color: "var(--cf-green)" }}>MESSAGE TRANSMITTED</p>
                      <p className="cf-mono cf-fs-data" style={{ color: "var(--cf-muted)" }}>
                        {">"} Auto-reply sent to {form.email}
                      </p>
                      <p className="cf-mono cf-fs-data" style={{ color: "var(--cf-muted)" }}>
                        {">"} Expected response: 24 to 48 hours
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
                    {/* Honeypot */}
                    <input type="text" name="website" className="hidden" aria-hidden="true" value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })} tabIndex={-1} autoComplete="off" />

                    <p className="cf-mono cf-fs-data mb-4" style={{ color: "var(--cf-muted)" }}>
                      {">"} COMPOSE ENCRYPTED MESSAGE
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {([
                        { key: "name", label: "YOUR NAME", placeholder: "Jane Smith", type: "text", autoComplete: "name" },
                        { key: "email", label: "EMAIL", placeholder: "jane@company.com", type: "email", autoComplete: "email" },
                      ] as const).map((f) => (
                        <div key={f.key} className="cf-field">
                          <label htmlFor={`contact-${f.key}`} className="cf-label">{f.label}</label>
                          <input
                            id={`contact-${f.key}`}
                            name={f.key}
                            type={f.type}
                            required
                            autoComplete={f.autoComplete}
                            {...invalidProps(f.key, fieldErrors[f.key])}
                            placeholder={f.placeholder}
                            value={form[f.key as keyof typeof form]}
                            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                            className="cf-input font-mono aria-[invalid=true]:border-[var(--cf-red)]"
                          />
                          <FieldError name={f.key} message={fieldErrors[f.key]} />
                        </div>
                      ))}
                    </div>

                    <div className="cf-field">
                      <label htmlFor="contact-subject" className="cf-label">SUBJECT</label>
                      <select
                        id="contact-subject"
                        name="subject"
                        required
                        {...invalidProps("subject", fieldErrors.subject)}
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="cf-input font-mono aria-[invalid=true]:border-[var(--cf-red)]"
                      >
                        <option value="">Select a subject...</option>
                        {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <FieldError name="subject" message={fieldErrors.subject} />
                    </div>

                    <div className="cf-field">
                      <label htmlFor="contact-message" className="cf-label">MESSAGE</label>
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        {...invalidProps("message", fieldErrors.message)}
                        rows={5}
                        placeholder="Tell me about the role, project, or opportunity..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="cf-input font-mono resize-none aria-[invalid=true]:border-[var(--cf-red)]"
                      />
                      <FieldError name="message" message={fieldErrors.message} />
                    </div>

                    {state === "error" && (
                      <p role="alert" className="font-mono cf-fs-data text-[var(--red)] bg-[rgba(255,68,68,0.08)] px-3 py-2 rounded border border-[rgba(255,68,68,0.2)]">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={state === "sending"}
                      className="btn-gold w-full justify-center"
                    >
                      {state === "sending" ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-3.5 h-3.5 border border-[var(--gold)] border-t-transparent rounded-full"
                          />
                          ENCRYPTING AND TRANSMITTING...
                        </>
                      ) : (
                        <><Send className="w-3.5 h-3.5" /> TRANSMIT SECURE MESSAGE</>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}