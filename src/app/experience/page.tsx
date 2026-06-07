"use client";
import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Briefcase, Shield, Code2, ChevronDown, MapPin, Calendar } from "lucide-react";

const ROLES = [
  {
    icon: Shield,
    company: "Impact Security",
    role: "Screening Officer / Access Control Specialist",
    clients: "ADESA Auction & Covenant Health",
    location: "Nisku & Edmonton, AB",
    period: "Apr 2023 – Present",
    color: "var(--gold)",
    type: "SECURITY OPS",
    summary: "Front-line physical security operations at high-volume commercial and healthcare facilities. This role built the operational mindset I bring to cybersecurity — alert monitoring, incident escalation, and documentation under pressure.",
    bullets: [
      "Monitored CCTV systems and restricted zones for unauthorized access across multi-building campuses",
      "Investigated and escalated security incidents using the 5 W's methodology — same framework used in digital SOC triage",
      "Managed access control for 100+ daily entrants, enforcing least-privilege physical access",
      "Produced audit-ready written incident reports — chain of custody documentation",
      "Coordinated with law enforcement and emergency services on active incidents",
    ],
    transfer: [
      "Alert monitoring → SIEM alert triage",
      "Incident escalation → SOC escalation procedures",
      "Access control → Identity & Access Management",
      "Written reports → IR documentation",
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
    type: "SECURITY OPS",
    summary: "Loss prevention and real-time surveillance at retail environments — constant threat assessment, behavioral analysis, and rapid response.",
    bullets: [
      "Performed real-time surveillance using CCTV and physical patrol — active threat hunting mindset",
      "Identified and responded to shoplifting incidents, disruptive behavior, and safety threats",
      "Completed detailed incident reports for legal and compliance documentation",
      "Maintained high situational awareness — translated to network anomaly detection thinking",
    ],
    transfer: [
      "Behavioral analysis → Threat actor TTPs",
      "Surveillance → Log monitoring",
      "Incident reports → IR write-ups",
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
    type: "SECURE DEV",
    summary: "Full-stack web and software development with a security-conscious approach — this is where I learned secure development practices, Linux server administration, and applied OWASP principles to production systems.",
    bullets: [
      "Built full-stack applications with security controls: CSRF/XSS mitigation, encrypted authentication, input validation",
      "Administered Ubuntu Linux servers: UFW firewall rules, SSL/TLS certificate management, PM2 process management, cron scheduling",
      "Monitored system logs and configured alerts for server health and security events",
      "Developed Python and Bash automation scripts for deployment, log parsing, and API integrations",
      "Projects: ImmigrateX (Next.js SaaS), Chattr (real-time messaging), 3D Chess (Three.js), RBAC Security App",
      "Implemented Role-Based Access Control (RBAC) — Principle of Least Privilege in production",
    ],
    transfer: [
      "Secure SDLC → Vulnerability management",
      "Linux server admin → SOC endpoint knowledge",
      "Log monitoring → SIEM log analysis",
      "RBAC implementation → Identity security",
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
    type: "LEADERSHIP",
    summary: "High-pressure operational leadership managing a team of 10+ during peak service. Built skills in process compliance, cross-functional coordination, and performance under pressure.",
    bullets: [
      "Led a team of 10+ kitchen staff during high-volume service periods",
      "Maintained health and safety compliance documentation — audit-ready records",
      "Coordinated with front-of-house for cross-functional operational efficiency",
      "Resolved operational incidents quickly under pressure — core SOC skillset",
    ],
    transfer: [
      "Team leadership → SOC team coordination",
      "Compliance docs → Security policy adherence",
      "Pressure performance → Incident response speed",
    ],
    tags: ["Team Leadership", "Compliance", "Operations", "Pressure Performance"],
  },
  {
    icon: Briefcase,
    company: "Boston Pizza · Earls · St. Louis Bar & Grill",
    role: "Kitchen Supervisor / Line Cook",
    clients: "Restaurant Operations",
    location: "Edmonton, AB",
    period: "Sep 2022 – Dec 2025",
    color: "var(--text-muted)",
    type: "OPERATIONS",
    summary: "Multi-site kitchen operations across three chains — developed operational discipline, process documentation, and systems thinking under service pressure.",
    bullets: [
      "Maintained consistency and quality standards across high-volume shifts",
      "Supervised station workflow and ensured health code compliance",
      "Developed process documentation habits that translate directly to security runbooks",
    ],
    transfer: [
      "Process discipline → Security runbook execution",
      "Quality standards → Security baseline enforcement",
    ],
    tags: ["Operations", "Process Documentation", "Compliance", "Team Coordination"],
  },
];

function RoleCard({ role, index }: { role: typeof ROLES[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="flex gap-6"
    >
      {/* Timeline node */}
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10"
          style={{ background: `${role.color}15`, border: `1px solid ${role.color}30` }}>
          <role.icon className="w-4 h-4" style={{ color: role.color }} />
        </div>
        {index < ROLES.length - 1 && (
          <div className="w-px flex-1 mt-2" style={{ background: "linear-gradient(to bottom, var(--border), transparent)", minHeight: 32 }} />
        )}
      </div>

      {/* Card */}
      <div className="flex-1 pb-8">
        <div
          className="glass rounded-xl overflow-hidden card-lift"
          onClick={() => setOpen(!open)}
          style={{ cursor: "pointer" }}
        >
          {/* Header */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="tag tag-gold mb-2 inline-block">{role.type}</span>
                <h3 className="font-display text-base font-semibold text-[var(--text)] leading-tight">
                  {role.role}
                </h3>
                <p className="text-[var(--gold)] text-sm font-medium mt-0.5">{role.company}</p>
                {role.clients !== role.company && (
                  <p className="text-[var(--text-muted)] text-xs mt-0.5">{role.clients}</p>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] shrink-0 mt-1 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
            </div>

            <div className="flex flex-wrap gap-4 mt-3">
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
            <div className="flex flex-wrap gap-1.5 mt-4">
              {role.tags.map((t) => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>

          {/* Expanded content */}
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-[var(--border)] px-5 pb-5 pt-4 space-y-5"
            >
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">{role.summary}</p>

              <div>
                <p className="font-mono text-[10px] text-[var(--gold)] tracking-wider mb-2">RESPONSIBILITIES</p>
                <ul className="space-y-2">
                  {role.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-[var(--text-muted)] text-sm">
                      <span className="w-1 h-1 rounded-full bg-[var(--gold)] mt-2 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-gold rounded-lg p-4">
                <p className="font-mono text-[10px] text-[var(--gold)] tracking-wider mb-2">
                  CYBERSECURITY SKILLS TRANSFER
                </p>
                <div className="grid sm:grid-cols-2 gap-1.5">
                  {role.transfer.map((t) => (
                    <p key={t} className="font-mono text-[10px] text-[var(--text-muted)]">→ {t}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ExperiencePage() {
  return (
    <div className="min-h-screen pt-24 pb-32 section">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-16">
          <p className="font-mono text-[10px] tracking-[0.35em] text-[var(--gold-muted)] mb-2">EXPERIENCE</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Operator <span className="gradient-gold">History</span>
          </h1>
          <p className="text-[var(--text-muted)] max-w-xl leading-relaxed">
            Every role has built the mindset of a security professional — from physical access control to secure software development.
            Click each card to see the full breakdown and cybersecurity skill transfer.
          </p>
          <div className="glow-line mt-6 max-w-24" />
        </motion.div>

        <div className="space-y-0">
          {ROLES.map((role, i) => (
            <RoleCard key={i} role={role} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
