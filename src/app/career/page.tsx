"use client";
import { useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDown, Star, Crosshair } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { SparklesCore } from "@/components/ui/sparkles";
import { MetalButton } from "@/components/ui/liquid-glass-button";

const SmokeBackground = dynamic(
  () => import("@/components/ui/spooky-smoke-animation").then((m) => m.SmokeBackground),
  { ssr: false }
);

const NODES = [
  {
    id: "current",
    label: "NOW",
    title: "Screening Officer + Active Learner",
    timeline: "Apr 2023 – Present",
    status: "CURRENT" as const,
    color: "var(--green)",
    badge: "YOU ARE HERE",
    desc: "Building the foundation in physical security operations while aggressively pursuing cybersecurity knowledge. Every shift at ADESA and Covenant Health is a lesson in incident response, access control, and documentation. The SOC mindset begins here.",
    skills: ["Incident Reporting", "Access Control", "SIEM Fundamentals", "Active Directory", "Linux Admin", "Python", "TCP/IP Networking"],
    certs: ["ISC2 CC ✓", "Google Cybersecurity ✓", "Security+ ✓"],
    note: "The guard booth teaches the same mindset as the SOC — monitor, detect, respond, document.",
  },
  {
    id: "soc1",
    label: "2026",
    title: "SOC Analyst — Tier 1",
    timeline: "Target: 2025–2026",
    status: "NEXT" as const,
    color: "var(--gold)",
    badge: null,
    desc: "Entry point to the blue team. Alert triage, SIEM operations, ticket escalation, shift documentation. Learning the environment from the ground up — building the adversarial awareness that will eventually move me to the red side.",
    skills: ["Alert Triage", "SIEM Operations", "Ticket Escalation", "Log Correlation", "IR Documentation", "Shift Reporting"],
    certs: ["CompTIA Security+"],
    note: "Edmonton-first. Open to remote. Primary short-term target.",
  },
  {
    id: "soc2",
    label: "2027",
    title: "SOC Analyst T2 / Threat Hunter",
    timeline: "2027–2028",
    status: "PLANNED" as const,
    color: "var(--blue)",
    badge: null,
    desc: "Deeper investigation, malware triage, threat hunting across the environment. Building the adversarial mindset that bridges blue to red — understanding how attackers think by watching them in action in the SIEM.",
    skills: ["Threat Hunting", "Malware Triage", "IR Lead", "SIEM Rule Authoring", "MITRE ATT&CK", "Threat Intelligence"],
    certs: ["CySA+", "CASP+"],
    note: "This stage builds the offensive intuition essential for penetration testing.",
  },
  {
    id: "pentest",
    label: "2028",
    title: "Penetration Tester / Red Team Analyst",
    timeline: "2028+",
    status: "GOAL" as const,
    color: "var(--gold)",
    badge: "★ PRIMARY GOAL",
    isMilestone: true,
    desc: "The long-term target. Offensive security assessments — identifying and exploiting vulnerabilities before real attackers do. Web app testing, network pentesting, Active Directory attacks, professional report writing.",
    skills: ["Vulnerability Assessment", "Exploit Development", "Metasploit", "Burp Suite", "Custom Tooling", "Professional Report Writing", "Client Communication"],
    certs: ["OSCP (north star certification)", "CEH", "eJPT"],
    note: "OSCP is the milestone that unlocks this role. Everything I'm building — the lab, the certs, the scripting — feeds directly into this.",
  },
  {
    id: "senior",
    label: "Long-Term",
    title: "Senior Pentester / Red Team Lead",
    timeline: "Long-term vision",
    status: "VISION" as const,
    color: "var(--gold-muted)",
    badge: null,
    desc: "Independent assessments, specialized domain expertise, and leading red team engagements. Web app, network, Active Directory, and cloud penetration testing at the highest level.",
    skills: ["Web App PenTest", "Network PenTest", "AD & Cloud PenTest", "Red Team Leadership", "Security Research"],
    certs: ["OSED", "OSEP", "CRTO", "CISSP"],
    note: "International ambitions — Dubai, Australia, or senior Canadian engagements.",
  },
];

const SKILLS = [
  { name: "Network Security", pct: 65 },
  { name: "SIEM & Log Analysis", pct: 60 },
  { name: "Incident Response", pct: 55 },
  { name: "Linux Administration", pct: 72 },
  { name: "Active Directory", pct: 60 },
  { name: "Python & Scripting", pct: 72 },
  { name: "Threat Detection", pct: 55 },
  { name: "Web Application Security", pct: 62 },
  { name: "Offensive Security", pct: 35 },
];

const CERTS = [
  { name: "Google Cybersecurity", abbr: "GCC", status: "DONE" },
  { name: "ISC2 CC", abbr: "CC", status: "DONE" },
  { name: "Security+", abbr: "SEC+", status: "DONE" },
  { name: "CySA+", abbr: "CySA+", status: "PLANNED" },
  { name: "eJPT", abbr: "eJPT", status: "PLANNED" },
  { name: "OSCP", abbr: "OSCP", status: "GOAL", star: true },
  { name: "OSED", abbr: "OSED", status: "FUTURE" },
  { name: "OSEP", abbr: "OSEP", status: "FUTURE" },
];

const STATUS_STYLE = {
  CURRENT: { border: "rgba(0,255,136,0.5)", bg: "rgba(0,255,136,0.06)", text: "var(--green)", dot: "var(--green)" },
  NEXT: { border: "rgba(212,160,23,0.5)", bg: "rgba(212,160,23,0.06)", text: "var(--gold)", dot: "var(--gold)" },
  PLANNED: { border: "rgba(68,136,255,0.35)", bg: "rgba(68,136,255,0.04)", text: "var(--blue)", dot: "var(--blue)" },
  GOAL: { border: "rgba(212,160,23,0.6)", bg: "rgba(212,160,23,0.08)", text: "var(--gold)", dot: "var(--gold)" },
  VISION: { border: "rgba(138,105,20,0.3)", bg: "rgba(138,105,20,0.04)", text: "var(--gold-muted)", dot: "var(--gold-muted)" },
};

const PARTICLE_DATA = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  w: Math.random() * 3 + 1,
  h: Math.random() * 3 + 1,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  driftX: Math.random() * 20 - 10,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 4,
}));

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLE_DATA.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ width: p.w, height: p.h, background: "rgba(212,160,23,0.4)", left: p.left, top: p.top }}
          animate={{ y: [0, -30, 0], x: [0, p.driftX, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function NodeGraph() {
  const [expanded, setExpanded] = useState<string | null>("current");
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start 80%", "end 30%"] });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const NODE_HEIGHT = 160; // approx px per node for SVG calculations
  const SVG_H = NODES.length * NODE_HEIGHT;

  return (
    <div ref={containerRef} className="relative max-w-3xl mx-auto px-4 sm:px-6">
      {/* SVG connecting path — positioned absolute behind content */}
      <svg
        className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none hidden sm:block"
        width="2"
        height={SVG_H}
        style={{ zIndex: 0 }}
      >
        <motion.line
          x1="1"
          y1="0"
          x2="1"
          y2={SVG_H}
          stroke="rgba(212,160,23,0.25)"
          strokeWidth="2"
          strokeDasharray="4 4"
          style={{ pathLength }}
        />
      </svg>

      <div className="space-y-4 relative z-10">
        {NODES.map((node, i) => {
          const style = STATUS_STYLE[node.status];
          const isExpanded = expanded === node.id;
          const isCurrent = node.status === "CURRENT";
          const isGoal = node.status === "GOAL";

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              {/* Node connector dot (desktop center) */}
              <div className="hidden sm:flex justify-center mb-2">
                <motion.div
                  className="w-4 h-4 rounded-full z-20 relative"
                  style={{ background: style.dot, boxShadow: isCurrent || isGoal ? `0 0 12px ${style.dot}60` : "none", border: `2px solid ${style.dot}` }}
                  animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>

              {/* Card */}
              <button
                onClick={() => setExpanded(isExpanded ? null : node.id)}
                className="w-full text-left glass rounded-xl overflow-hidden transition-all"
                style={{ border: `1px solid ${style.border}`, background: style.bg }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                          className="font-mono text-[9px] tracking-widest px-2 py-0.5 rounded"
                          style={{ color: style.text, background: `${style.dot}15`, border: `1px solid ${style.border}` }}
                        >
                          {node.label}
                        </span>
                        {node.badge && (
                          <span
                            className="font-mono text-[8px] tracking-widest px-2 py-0.5 rounded flex items-center gap-1"
                            style={{ color: style.text, background: `${style.dot}20`, border: `1px solid ${style.border}` }}
                          >
                            {isGoal && <Star className="w-2.5 h-2.5" />}
                            {node.badge}
                          </span>
                        )}
                        <span className="font-mono text-[9px] text-[var(--text-muted)] ml-auto">{node.timeline}</span>
                      </div>
                      <h3 className="font-display text-base sm:text-lg font-bold text-[var(--text)]">{node.title}</h3>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="shrink-0 mt-1"
                    >
                      <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                    </motion.div>
                  </div>

                  {/* Certs preview */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {node.certs.map((c) => (
                      <span key={c} className="tag text-[9px]" style={{ color: style.text, borderColor: `${style.dot}30` }}>{c}</span>
                    ))}
                  </div>
                </div>

                {/* Expanded panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden border-t"
                      style={{ borderColor: style.border }}
                    >
                      <div className="p-5 space-y-4">
                        <p className="text-[var(--text-muted)] text-sm leading-relaxed">{node.desc}</p>

                        <div>
                          <p className="font-mono text-[9px] tracking-wider mb-2" style={{ color: style.text }}>KEY SKILLS</p>
                          <div className="flex flex-wrap gap-1.5">
                            {node.skills.map((s) => <span key={s} className="tag">{s}</span>)}
                          </div>
                        </div>

                        <div className="glass-gold rounded-lg px-4 py-3">
                          <p className="font-mono text-[10px] text-[var(--gold)] italic">&ldquo;{node.note}&rdquo;</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function SkillBars() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 grid sm:grid-cols-2 gap-x-10 gap-y-4">
      {SKILLS.map((skill, i) => (
        <motion.div
          key={skill.name}
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
        >
          <div className="flex justify-between mb-1.5">
            <span className="font-display text-sm text-[var(--text)]">{skill.name}</span>
          </div>
          <div className="h-1.5 bg-[var(--card)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${skill.pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.05 + 0.2 }}
              className="h-full rounded-full"
              style={{ background: "var(--gold)", boxShadow: "0 0 8px rgba(212,160,23,0.4)" }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function CertTimeline() {
  const CERT_STYLE: Record<string, { bg: string; text: string; border: string; glow: string; pulse?: boolean }> = {
    DONE: { bg: "var(--gold)", text: "#0a0a0a", border: "transparent", glow: "rgba(212,160,23,0.4)" },
    IN_PROGRESS: { bg: "transparent", text: "var(--gold)", border: "var(--gold)", glow: "rgba(212,160,23,0.2)", pulse: true },
    PLANNED: { bg: "transparent", text: "var(--text-muted)", border: "var(--border)", glow: "none" },
    GOAL: { bg: "transparent", text: "var(--gold)", border: "rgba(212,160,23,0.6)", glow: "rgba(212,160,23,0.3)" },
    FUTURE: { bg: "transparent", text: "#444", border: "#333", glow: "none" },
  };

  return (
    <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex items-center gap-0 min-w-max">
        {CERTS.map((cert, i) => {
          const s = CERT_STYLE[cert.status as keyof typeof CERT_STYLE];
          return (
            <div key={cert.abbr} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="font-mono text-[8px] text-[var(--text-muted)] text-center w-20">{cert.status.replace("_", " ")}</div>
                <motion.div
                  className="w-16 h-16 rounded-xl flex flex-col items-center justify-center relative"
                  style={{
                    background: s.bg,
                    border: `1.5px solid ${s.border}`,
                    boxShadow: s.glow !== "none" ? `0 0 16px ${s.glow}` : "none",
                  }}
                  animate={s.pulse ? { boxShadow: ["0 0 8px rgba(212,160,23,0.2)", "0 0 20px rgba(212,160,23,0.4)", "0 0 8px rgba(212,160,23,0.2)"] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {cert.star && <Star className="w-3 h-3 mb-0.5" style={{ color: s.text }} />}
                  <span className="font-mono text-[10px] font-bold text-center leading-tight" style={{ color: s.text }}>
                    {cert.abbr}
                  </span>
                </motion.div>
                <div className="font-mono text-[8px] text-center w-20 leading-tight" style={{ color: s.text }}>{cert.name}</div>
              </motion.div>

              {/* Connector */}
              {i < CERTS.length - 1 && (
                <div className="w-6 h-px mx-1 shrink-0" style={{ background: "var(--border)" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CareerPage() {
  return (
    <div className="min-h-screen pb-32">
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center pt-32 pb-20 px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            maskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
          }}
        >
          <div className="absolute inset-0 opacity-20">
            <SmokeBackground smokeColor="#d4a017" />
          </div>
          <div className="absolute inset-0">
            <SparklesCore
              background="transparent"
              minSize={0.3}
              maxSize={1.2}
              particleDensity={50}
              particleColor="#d4a017"
              speed={0.4}
              className="w-full h-full"
            />
          </div>
        </div>
        <FloatingParticles />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="font-mono text-[10px] tracking-[0.35em] text-[var(--gold-muted)] mb-4">CAREER PATH</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] mb-6">
              The Path to Becoming a<br />
              <span className="gradient-gold">Penetration Tester</span>
            </h1>
            <p className="text-[var(--text-muted)] text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-8">
              Every step has a purpose. Every cert, every lab, every late night — it all points here.
            </p>
            <div className="inline-flex items-center gap-2 glass-gold rounded-full px-5 py-2">
              <Crosshair className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span className="font-mono text-[11px] text-[var(--gold)] tracking-wider">OSCP IS THE NORTH STAR</span>
            </div>
          </motion.div>
          <div className="glow-line mt-8 max-w-32 mx-auto" />
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--gold-muted)] mb-1">ROADMAP</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Career Node Graph</h2>
            <p className="text-[var(--text-muted)] text-sm mt-1">Click any node to expand</p>
          </motion.div>
        </div>
        <NodeGraph />
      </section>

      {/* Skill bars */}
      <section className="py-16 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--gold-muted)] mb-1">CURRENT PROFICIENCY</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Skill Progress</h2>
          </motion.div>
        </div>
        <SkillBars />
      </section>

      {/* Cert timeline */}
      <section className="py-16 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--gold-muted)] mb-1">CERTIFICATION STACK</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">The Cert Timeline</h2>
            <p className="text-[var(--text-muted)] text-sm mt-1">OSCP is the milestone that changes the trajectory.</p>
          </motion.div>
          <CertTimeline />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">
              Currently targeting <span className="gradient-gold">SOC Analyst roles</span>
            </h2>
            <p className="text-[var(--text-muted)] mb-8 max-w-md mx-auto">
              Edmonton, AB — open to remote and relocation. Every role on this path is a step toward OSCP and beyond.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/contact" className="btn-gold">Get in Touch</Link>
              <Link href="/homelab" className="btn-ghost">See the Lab</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
