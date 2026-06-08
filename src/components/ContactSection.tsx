"use client";
import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, MapPin, Globe, Send, Lock, CheckCircle, AlertCircle } from "lucide-react";

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const SUBJECTS = ["Job Opportunity", "Collaboration", "General Inquiry", "Other"] as const;

export default function ContactSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
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
      const data = await res.json();
      if (res.ok && data.ok) {
        setState("done");
      } else {
        setError(data.error || "Something went wrong. Please try again.");
        setState("error");
      }
    } catch {
      setError("Network error. Please email directly at raaghvv0508@gmail.com");
      setState("error");
    }
  };

  return (
    <section id="contact" ref={ref} className="relative py-28 px-6 pb-40 bg-[rgba(6,18,42,0.3)]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="font-mono text-[10px] tracking-[0.35em] text-[#00d4ff] mb-2">
            06 / CONTACT
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Establish Connection
          </h2>
          <div className="h-px w-24 bg-gradient-to-r from-[#00d4ff] to-transparent" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Info panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-5"
          >
            <div className="glass-bright rounded-xl p-6 corner-bracket">
              <p className="font-mono text-[9px] text-[#00d4ff] tracking-wider mb-5">
                CONTACT ENDPOINTS
              </p>

              <div className="space-y-4">
                {[
                  { iconEl: <Mail className="w-3.5 h-3.5" />, label: "EMAIL", value: "raaghvv0508@gmail.com", href: "mailto:raaghvv0508@gmail.com", color: "#00d4ff" },
                  { iconEl: <MapPin className="w-3.5 h-3.5" />, label: "LOCATION", value: "Edmonton, AB, Canada", color: "#7c3aed" },
                  { iconEl: <GithubIcon />, label: "GITHUB", value: "github.com/raghv-m", href: "https://github.com/raghv-m", color: "#94a3b8" },
                  { iconEl: <Globe className="w-3.5 h-3.5" />, label: "PORTFOLIO", value: "www.raghv.dev", href: "https://www.raghv.dev", color: "#0066ff" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: `${item.color}12`,
                        border: `1px solid ${item.color}25`,
                        color: item.color,
                      }}
                    >
                      {item.iconEl}
                    </div>
                    <div>
                      <p className="font-mono text-[8px] tracking-wider text-[#475569]">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#94a3b8] text-xs hover:text-white transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-[#94a3b8] text-xs">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="glass rounded-xl p-6 border border-[rgba(0,255,136,0.2)]">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
                <p className="font-mono text-[10px] text-[#00ff88] tracking-wider">
                  AVAILABILITY STATUS
                </p>
              </div>
              <p className="text-[#94a3b8] text-sm leading-relaxed">
                Actively seeking entry-level SOC Analyst or cybersecurity
                support roles in Edmonton, AB. Open to remote opportunities
                across Canada.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["SOC Analyst L1", "Security Operations", "Incident Response", "Remote / Edmonton"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[9px] px-2 py-1 rounded glass text-[#00ff88] border border-[rgba(0,255,136,0.2)]"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Encryption note */}
            <div className="flex items-center gap-2 glass rounded-lg px-4 py-3">
              <Lock className="w-3.5 h-3.5 text-[#7c3aed]" />
              <p className="font-mono text-[10px] text-[#475569]">
                HTTPS · CSRF protected · TLS 1.3 · IP hashed
              </p>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="glass-bright rounded-xl overflow-hidden border border-[rgba(0,212,255,0.2)]">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-[rgba(0,212,255,0.1)] bg-[rgba(0,212,255,0.03)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff3366]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffd700]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#00ff88]" />
                <span className="font-mono text-[10px] text-[#475569] ml-2">
                  secure-message — encrypt@raghv.dev
                </span>
                <div className="ml-auto flex items-center gap-1.5">
                  <Lock className="w-2.5 h-2.5 text-[#00d4ff]" />
                  <span className="font-mono text-[9px] text-[#00d4ff]">TLS 1.3</span>
                </div>
              </div>

              <div className="p-6">
                {state === "done" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center gap-4"
                  >
                    <CheckCircle className="w-12 h-12 text-[#00ff88]" />
                    <p className="font-mono text-sm text-[#00ff88]">MESSAGE TRANSMITTED</p>
                    <p className="text-[#94a3b8] text-xs">
                      Your message was received. I&apos;ll respond within 24 hours.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="font-mono text-[9px] text-[#475569] mb-4">
                      {">"} COMPOSE ENCRYPTED MESSAGE
                    </p>

                    {[
                      { key: "name", label: "YOUR NAME", placeholder: "John Doe", type: "text" },
                      { key: "email", label: "EMAIL ADDRESS", placeholder: "john@example.com", type: "email" },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="font-mono text-[9px] text-[#475569] tracking-wider block mb-1.5">
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          required
                          placeholder={field.placeholder}
                          value={form[field.key as keyof typeof form]}
                          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                          className="w-full bg-[rgba(0,212,255,0.03)] border border-[rgba(0,212,255,0.15)] rounded-lg px-4 py-2.5 text-[#e2e8f0] text-sm font-mono placeholder-[#1e293b] focus:outline-none focus:border-[rgba(0,212,255,0.4)] focus:bg-[rgba(0,212,255,0.06)] transition-all"
                        />
                      </div>
                    ))}

                    <div>
                      <label className="font-mono text-[9px] text-[#475569] tracking-wider block mb-1.5">
                        SUBJECT
                      </label>
                      <select
                        required
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full bg-[rgba(0,10,30,0.6)] border border-[rgba(0,212,255,0.15)] rounded-lg px-4 py-2.5 text-[#e2e8f0] text-sm font-mono focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-all"
                      >
                        <option value="" disabled>Select a subject...</option>
                        {SUBJECTS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-mono text-[9px] text-[#475569] tracking-wider block mb-1.5">
                        MESSAGE
                      </label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Tell me about the opportunity, project, or question..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full bg-[rgba(0,212,255,0.03)] border border-[rgba(0,212,255,0.15)] rounded-lg px-4 py-2.5 text-[#e2e8f0] text-sm font-mono placeholder-[#1e293b] focus:outline-none focus:border-[rgba(0,212,255,0.4)] focus:bg-[rgba(0,212,255,0.06)] transition-all resize-none"
                      />
                    </div>

                    {state === "error" && (
                      <div className="flex items-center gap-2 font-mono text-[10px] text-[#ff4444] bg-[rgba(255,68,68,0.08)] px-3 py-2 rounded border border-[rgba(255,68,68,0.2)]">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={state === "sending"}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-mono text-xs tracking-wider transition-all duration-300 border border-[rgba(0,212,255,0.4)] text-[#00d4ff] hover:bg-[rgba(0,212,255,0.08)] hover:shadow-[0_0_20px_rgba(0,212,255,0.2)] disabled:opacity-50"
                    >
                      {state === "sending" ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-3.5 h-3.5 border border-[#00d4ff] border-t-transparent rounded-full"
                          />
                          ENCRYPTING + TRANSMITTING...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          TRANSMIT SECURE MESSAGE
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
