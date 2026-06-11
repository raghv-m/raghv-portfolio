"use client";
import { useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { Briefcase, Shield, Code2, ChevronDown, MapPin, Calendar, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
const SparklesCore = dynamic(
  () => import("@/components/ui/sparkles").then((m) => m.SparklesCore),
  { ssr: false }
);

const SmokeBackground = dynamic(
  () => import("@/components/ui/spooky-smoke-animation").then((m) => m.SmokeBackground),
  { ssr: false }
);

const ROLES = [
  {
    icon: Shield,
    company: "Impact Security",
    role: "Screening Officer / Access Control Specialist",
    clients: "ADESA Auction & Covenant Health",
    location: "Nisku & Edmonton, AB",
    period: "Apr 2023 – Present",
    color: "var(--gold)",
    accentHex: "#d4a017",
    type: "SECURITY OPS",
    active: true,
    summary: "Front-line physical security operations at high-volume commercial and healthcare facilities. Built the operational mindset I bring to cybersecurity — alert monitoring, incident escalation, and documentation under pressure.",
    bullets: [
      "Monitored CCTV systems and restricted zones for unauthorized access across multi-building campuses",
      "Investigated and escalated security incidents using the 5 W's methodology — same framework used in digital SOC triage",
      "Managed access control for 100+ daily entrants, enforcing least-privilege physical access",
      "Produced audit-ready written incident reports — chain of custody documentation",
      "Coordinated with law enforcement and emergency services on active incidents",
    ],
    transfer: [
      { from: "CCTV monitoring", to: "SIEM alert triage" },
      { from: "Incident escalation", to: "SOC escalation procedures" },
      { from: "Access control", to: "Identity & Access Management" },
      { from: "Written reports", to: "IR documentation" },
    ],
    tags: ["CCTV Monitoring", "Incident Response", "Access Control", "Audit Reports", "Escalation"],
  },
  {
    icon: Shield,
    company: "Impact Security",
    role: "Tactical Security Guard — Surveillance & Incident Response",
    clients: "Retail Locations",
    location: "Edmonton, AB",
    period: "Apr 2023 – Present",
    color: "var(--gold)",
    accentHex: "#d4a017",
    type: "SECURITY OPS",
    active: true,
    summary: "Loss prevention and real-time surveillance at retail environments — constant threat assessment, behavioral analysis, and rapid response.",
    bullets: [
      "Performed real-time surveillance using CCTV and physical patrol — active threat hunting mindset",
      "Identified and responded to shoplifting incidents, disruptive behavior, and safety threats",
      "Completed detailed incident reports for legal and compliance documentation",
      "Maintained high situational awareness — translated to network anomaly detection thinking",
    ],
    transfer: [
      { from: "Behavioral analysis", to: "Threat actor TTPs" },
      { from: "Surveillance patrols", to: "Log monitoring" },
      { from: "Incident reports", to: "IR write-ups" },
    ],
    tags: ["Surveillance", "Threat Assessment", "Retail Security", "Incident Reporting"],
  },
  {
    icon: Code2,
    company: "Self-Employed",
    role: "Freelance Web & Software Developer",
    clients: "Multiple Clients",
    location: "Edmonton, AB",
    period: "Aug 2022 – Present",
    color: "var(--blue)",
    accentHex: "#4488ff",
    type: "SECURE DEV",
    active: true,
    summary: "Full-stack development with a security-conscious approach — where I learned secure development practices, Linux server administration, and applied OWASP principles to production systems.",
    bullets: [
      "Built full-stack apps with CSRF/XSS mitigation, encrypted authentication, and Zod input validation",
      "Administered Ubuntu Linux servers: UFW firewall, SSL/TLS certs, PM2, cron scheduling",
      "Monitored system logs and configured alerts for server health and security events",
      "Developed Python and Bash automation scripts for deployment, log parsing, and API integrations",
      "Projects: ImmigrateX (Next.js SaaS), Chattr (real-time messaging), 3D Chess (Three.js), RBAC Security App",
      "Implemented Role-Based Access Control — Principle of Least Privilege in production",
    ],
    transfer: [
      { from: "Secure SDLC", to: "Vulnerability management" },
      { from: "Linux server admin", to: "SOC endpoint knowledge" },
      { from: "Log monitoring", to: "SIEM log analysis" },
      { from: "RBAC implementation", to: "Identity security" },
    ],
    tags: ["Next.js", "Ubuntu Linux", "UFW", "SSL/TLS", "Python", "Bash", "RBAC", "OWASP"],
  },
  {
    icon: Briefcase,
    company: "Leopold's Tavern",
    role: "Assistant Kitchen Manager",
    clients: "Restaurant Operations",
    location: "Edmonton, AB",
    period: "Feb 2025 – Jul 2025",
    color: "var(--text-muted)",
    accentHex: "#666",
    type: "LEADERSHIP",
    active: false,
    summary: "High-pressure operational leadership managing a team of 10+ during peak service. Built process compliance, cross-functional coordination, and performance under pressure.",
    bullets: [
      "Led a team of 10+ kitchen staff during high-volume service periods",
      "Maintained health and safety compliance documentation — audit-ready records",
      "Coordinated with front-of-house for cross-functional operational efficiency",
      "Resolved operational incidents quickly under pressure — core SOC skillset",
    ],
    transfer: [
      { from: "Team leadership", to: "SOC team coordination" },
      { from: "Compliance docs", to: "Security policy adherence" },
      { from: "Pressure performance", to: "Incident response speed" },
    ],
    tags: ["Team Leadership", "Compliance", "Operations", "Pressure Performance"],
  },
  {
    icon: Briefcase,
    company: "Boston Pizza · Earls · St. Louis",
    role: "Kitchen Supervisor / Line Cook",
    clients: "Restaurant Operations",
    location: "Edmonton, AB",
    period: "Sep 2022 – Dec 2025",
    color: "var(--text-muted)",
    accentHex: "#555",
    type: "OPERATIONS",
    active: false,
    summary: "Multi-site kitchen operations — developed operational discipline, process documentation, and systems thinking under service pressure.",
    bullets: [
      "Maintained consistency and quality standards across high-volume shifts",
      "Supervised station workflow and ensured health code compliance",
      "Developed process documentation habits that translate directly to security runbooks",
    ],
    transfer: [
      { from: "Process discipline", to: "Security runbook execution" },
      { from: "Quality standards", to: "Security baseline enforcement" },
    ],
    tags: ["Operations", "Process Documentation", "Compliance", "Team Coordination"],
  },
];

const STATS = [
  { value: "3+", label: "Years in Security" },
  { value: "5", label: "Roles Held" },
  { value: "100+", label: "Incidents Documented" },
  { value: "2026", label: "SOC Target" },
];

function RoleCard({ role, index }: { role: typeof ROLES[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <div
        className="glass rounded-2xl overflow-hidden cursor-pointer group"
        onClick={() => setOpen(!open)}
        style={{
          border: `1px solid ${role.accentHex}22`,
          boxShadow: open ? `0 0 30px ${role.accentHex}12` : undefined,
        }}
      >
        {/* Top accent line */}
        <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${role.accentHex}80, transparent)` }} />

        {/* Card header */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${role.accentHex}15`, border: `1px solid ${role.accentHex}30` }}
              >
                <role.icon className="w-4.5 h-4.5" style={{ color: role.color }} />
              </div>

              <div>
                {/* Badges row */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="font-mono text-[9px] tracking-[0.2em] px-2 py-0.5 rounded"
                    style={{ color: role.color, background: `${role.accentHex}15`, border: `1px solid ${role.accentHex}30` }}
                  >
                    {role.type}
                  </span>
                  {role.active && (
                    <span className="font-mono text-[9px] tracking-wider text-[var(--green)] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] inline-block" style={{ boxShadow: "0 0 6px rgba(0,255,136,0.6)" }} />
                      ACTIVE
                    </span>
                  )}
                </div>

                <h3 className="font-display text-base sm:text-lg font-semibold text-[var(--text)] leading-snug mb-1">
                  {role.role}
                </h3>
                <p className="font-medium text-sm" style={{ color: role.color }}>{role.company}</p>
                {role.clients !== role.company && (
                  <p className="text-[var(--text-muted)] text-xs mt-0.5">{role.clients}</p>
                )}
              </div>
            </div>

            <ChevronDown
              className="w-4 h-4 text-[var(--text-muted)] shrink-0 mt-1 transition-transform duration-300"
              style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 mt-4 pl-[60px]">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-[var(--text-muted)]" />
              <span className="font-mono text-[10px] text-[var(--text-muted)]">{role.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-[var(--text-muted)]" />
              <span className="font-mono text-[10px] text-[var(--text-muted)]">{role.period}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-4 pl-[60px]">
            {role.tags.map((t) => (
              <span key={t} className="tag text-[9px]">{t}</span>
            ))}
          </div>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="border-t border-[var(--border)] px-6 pb-6 pt-5 space-y-6">
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{role.summary}</p>

                {/* Bullets */}
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] mb-3" style={{ color: role.color }}>
                    RESPONSIBILITIES
                  </p>
                  <ul className="space-y-2.5">
                    {role.bullets.map((b, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3 text-[var(--text-muted)] text-sm"
                      >
                        <span
                          className="w-1 h-1 rounded-full shrink-0 mt-2"
                          style={{ background: role.color }}
                        />
                        {b}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Skill transfer grid */}
                <div
                  className="rounded-xl p-4"
                  style={{ background: `${role.accentHex}08`, border: `1px solid ${role.accentHex}20` }}
                >
                  <p className="font-mono text-[10px] tracking-[0.2em] mb-3" style={{ color: role.color }}>
                    CYBERSECURITY SKILL TRANSFER
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {role.transfer.map((t, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] font-mono">
                        <span className="text-[var(--text-muted)]">{t.from}</span>
                        <ArrowRight className="w-3 h-3 shrink-0" style={{ color: role.color }} />
                        <span style={{ color: role.color }}>{t.to}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function ExperiencePage() {
  return (
    <div className="min-h-screen pb-32">
      {/* ── Smoke Hero ────────────────────────────────────────── */}
      <div className="relative min-h-[52vh] flex items-center overflow-hidden">
        {/* Smoke + stars with bottom fade */}
        <div
          className="absolute inset-0"
          style={{
            maskImage: "linear-gradient(to bottom, black 0%, black 62%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 62%, transparent 100%)",
          }}
        >
          <div className="absolute inset-0">
            <SmokeBackground smokeColor="#4488ff" />
          </div>
          <div className="absolute inset-0 pointer-events-none">
            <SparklesCore
              background="transparent"
              minSize={0.3}
              maxSize={1.1}
              particleDensity={45}
              particleColor="#4488ff"
              speed={0.4}
              className="w-full h-full"
            />
          </div>
        </div>
        {/* Subtle dark vignette — not a blackout */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 100% 100% at 50% 50%, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0.78) 100%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(10,10,10,1))" }}
        />

        <div className="max-w-4xl mx-auto px-6 relative z-10 pt-28 pb-10 w-full">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="font-mono text-[10px] tracking-[0.35em] text-[var(--gold-muted)] mb-3">EXPERIENCE</p>
            <h1 className="font-display text-5xl sm:text-6xl font-bold mb-4 leading-[1.05]">
              Operator <span className="gradient-gold">History</span>
            </h1>
            <p className="text-[var(--text-muted)] max-w-lg text-base leading-relaxed mb-8">
              Every role has built the mindset of a security professional — from physical access control
              to secure software development. Click any card to expand.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-3">
              {STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  className="glass rounded-xl px-5 py-3 text-center"
                >
                  <p className="font-display text-xl font-bold text-[var(--gold)]">{s.value}</p>
                  <p className="font-mono text-[9px] text-[var(--text-muted)] tracking-wider mt-0.5">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Role Cards ────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 mt-10 space-y-4">
        {ROLES.map((role, i) => (
          <RoleCard key={i} role={role} index={i} />
        ))}
      </div>
    </div>
  );
}
