"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Mail, MapPin, Globe, Lock, CheckCircle, Download } from "lucide-react";
import dynamic from "next/dynamic";
import { SparklesCore } from "@/components/ui/sparkles";
const SmokeBackground = dynamic(
  () => import("@/components/ui/spooky-smoke-animation").then((m) => m.SmokeBackground),
  { ssr: false }
);

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

  useEffect(() => {
    fetch("/api/csrf").then((r) => r.json()).then((d) => setCsrf(d.token)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setError(d.error || "Something went wrong. Try emailing directly.");
        setState("error");
      }
    } catch {
      setError("Network error. Please try emailing directly.");
      setState("error");
    }
  };

  return (
    <div className="min-h-screen pb-40 section">
      {/* Smoke + stars hero with bottom fade */}
      <div className="relative pt-24 pb-16 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            maskImage: "linear-gradient(to bottom, black 0%, black 58%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 58%, transparent 100%)",
          }}
        >
          <div className="absolute inset-0 opacity-40">
            <SmokeBackground smokeColor="#00ff88" />
          </div>
          <div className="absolute inset-0">
            <SparklesCore
              background="transparent"
              minSize={0.3}
              maxSize={1.1}
              particleDensity={40}
              particleColor="#00ff88"
              speed={0.4}
              className="w-full h-full"
            />
          </div>
        </div>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(10,10,10,0.1) 0%, rgba(10,10,10,0.97) 100%)" }} />
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="font-mono text-[10px] tracking-[0.35em] text-[var(--gold-muted)] mb-2">CONTACT</p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              Establish <span className="gradient-gold">Connection</span>
            </h1>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 glass-gold rounded-full px-5 py-2 mt-2"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--green)] pulse-green" />
              <span className="font-mono text-[11px] text-[var(--green)] tracking-wider">
                AVAILABLE FOR OPPORTUNITIES — 2025/2026
              </span>
            </motion.div>
            <div className="glow-line mt-6 max-w-24 mx-auto" />
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-10" />
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Info panel — 2 cols */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            <div className="glass rounded-xl p-6">
              <p className="font-mono text-[9px] tracking-wider text-[var(--gold)] mb-5">CONTACT ENDPOINTS</p>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: "Email", value: "raaghvv0508@gmail.com", href: "mailto:raaghvv0508@gmail.com", color: "var(--gold)" },
                  { icon: MapPin, label: "Location", value: "Edmonton, AB, Canada", color: "var(--blue)" },
                  { icon: Globe, label: "Portfolio", value: "raghv.dev", href: "https://raghv.dev", color: "var(--gold)" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${item.color}12`, border: `1px solid ${item.color}25`, color: item.color }}>
                      <item.icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-mono text-[9px] text-[var(--text-muted)]">{item.label}</p>
                      {item.href
                        ? <a href={item.href} className="text-[var(--text)] text-xs hover:text-[var(--gold)] transition-colors">{item.value}</a>
                        : <p className="text-[var(--text)] text-xs">{item.value}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social links */}
            <div className="glass rounded-xl p-5">
              <p className="font-mono text-[9px] tracking-wider text-[var(--text-muted)] mb-4">SOCIAL · COMMUNITY</p>
              <div className="space-y-3">
                {[
                  { icon: GithubIcon, label: "GitHub", value: "HomeLab-Raghav", href: "https://github.com/HomeLab-Raghav", color: "var(--text-muted)" },
                  { icon: LinkedinIcon, label: "LinkedIn", value: "raghav-mahajan-17611b24b", href: "https://linkedin.com/in/raghav-mahajan-17611b24b", color: "var(--blue)" },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center glass group-hover:border-[rgba(212,160,23,0.3)] transition-all"
                      style={{ color: s.color }}>
                      <s.icon />
                    </div>
                    <div>
                      <p className="font-mono text-[9px] text-[var(--text-muted)]">{s.label}</p>
                      <p className="text-[var(--text)] text-xs group-hover:text-[var(--gold)] transition-colors">{s.value}</p>
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
            <div className="flex items-center gap-2 glass rounded-lg px-4 py-2.5">
              <Lock className="w-3 h-3 text-[var(--gold-muted)]" />
              <p className="font-mono text-[9px] text-[#444]">
                HTTPS · CSRF protected · IP hashed
              </p>
            </div>
          </motion.div>

          {/* Form — 3 cols */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <div className="glass rounded-xl overflow-hidden" style={{ border: "1px solid rgba(212,160,23,0.2)" }}>
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--border)] bg-[var(--card)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <span className="font-mono text-[10px] text-[var(--text-muted)] ml-2">secure-compose — raghv.dev</span>
                <Lock className="w-2.5 h-2.5 text-[var(--gold)] ml-auto" />
              </div>

              <div className="p-6">
                {state === "done" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 gap-4 text-center"
                  >
                    <CheckCircle className="w-14 h-14 text-[var(--green)]" style={{ filter: "drop-shadow(0 0 12px rgba(0,255,136,0.5))" }} />
                    <div>
                      <p className="font-mono text-sm text-[var(--green)] mb-1">MESSAGE TRANSMITTED</p>
                      <p className="font-mono text-[10px] text-[var(--text-muted)]">
                        {">"} Auto-reply sent to {form.email}
                      </p>
                      <p className="font-mono text-[10px] text-[var(--text-muted)]">
                        {">"} Expected response: 24–48 hours
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Honeypot */}
                    <input type="text" name="website" className="hidden" value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })} tabIndex={-1} autoComplete="off" />

                    <p className="font-mono text-[9px] text-[var(--text-muted)] mb-4">
                      {">"} COMPOSE ENCRYPTED MESSAGE
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { key: "name", label: "YOUR NAME", placeholder: "Jane Smith", type: "text" },
                        { key: "email", label: "EMAIL", placeholder: "jane@company.com", type: "email" },
                      ].map((f) => (
                        <div key={f.key}>
                          <label className="font-mono text-[9px] text-[var(--text-muted)] tracking-wider block mb-1.5">{f.label}</label>
                          <input
                            type={f.type}
                            required
                            placeholder={f.placeholder}
                            value={form[f.key as keyof typeof form]}
                            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--text)] text-sm font-mono placeholder-[#333] focus:outline-none focus:border-[rgba(212,160,23,0.4)] transition-colors"
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="font-mono text-[9px] text-[var(--text-muted)] tracking-wider block mb-1.5">SUBJECT</label>
                      <select
                        required
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--text)] text-sm font-mono focus:outline-none focus:border-[rgba(212,160,23,0.4)] transition-colors"
                      >
                        <option value="">Select a subject...</option>
                        {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="font-mono text-[9px] text-[var(--text-muted)] tracking-wider block mb-1.5">MESSAGE</label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Tell me about the role, project, or opportunity..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--text)] text-sm font-mono placeholder-[#333] focus:outline-none focus:border-[rgba(212,160,23,0.4)] transition-colors resize-none"
                      />
                    </div>

                    {state === "error" && (
                      <p className="font-mono text-[10px] text-[var(--red)] bg-[rgba(255,68,68,0.08)] px-3 py-2 rounded border border-[rgba(255,68,68,0.2)]">
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
