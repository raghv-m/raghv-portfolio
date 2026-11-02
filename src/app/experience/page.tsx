"use client";
import { useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { Briefcase, Shield, Code2, ChevronDown, MapPin, Calendar, ArrowRight } from "lucide-react";
import { PageHead } from "@/components/casefile/PageHead";
import { Reveal } from "@/components/casefile/Reveal";
import { Stamp } from "@/components/casefile/Stamp";
import { CareerSection } from "@/components/sections/CareerSection";


const ROLES = [
  {
    icon: Shield,
    company: "Impact Security",
    role: "Screening Officer / Access Control Specialist",
    clients: "ADESA Auction & Covenant Health",
    location: "Nisku & Edmonton, AB",
    period: "Apr 2023 – Present",
    color: "var(--gold)",
    accentHex: "#2C3480",
    type: "SECURITY OPS",
    active: true,
    summary: "Front-line physical security operations at high-volume commercial and healthcare facilities. Built the operational mindset I bring to cybersecurity: alert monitoring, incident escalation, and documentation under pressure.",
    bullets: [
      "Monitored CCTV systems and restricted zones for unauthorized access across multi-building campuses",
      "Investigated and escalated security incidents using the 5 W's methodology, the same framework used in digital SOC triage",
      "Managed access control for 100+ daily entrants, enforcing least-privilege physical access",
      "Produced audit-ready written incident reports with chain of custody documentation",
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
    role: "Tactical Security Guard: Surveillance & Incident Response",
    clients: "Retail Locations",
    location: "Edmonton, AB",
    period: "Apr 2023 – Present",
    color: "var(--gold)",
    accentHex: "#2C3480",
    type: "SECURITY OPS",
    active: true,
    summary: "Loss prevention and real-time surveillance at retail environments: constant threat assessment, behavioral analysis, and rapid response.",
    bullets: [
      "Performed real-time surveillance using CCTV and physical patrol with an active threat hunting mindset",
      "Identified and responded to shoplifting incidents, disruptive behavior, and safety threats",
      "Completed detailed incident reports for legal and compliance documentation",
      "Maintained high situational awareness, which translated to network anomaly detection thinking",
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
    summary: "Full-stack development with a security-conscious approach. This is where I learned secure development practices, Linux server administration, and applied OWASP principles to production systems.",
    bullets: [
      "Built full-stack apps with CSRF/XSS mitigation, encrypted authentication, and Zod input validation",
      "Administered Ubuntu Linux servers: UFW firewall, SSL/TLS certs, PM2, cron scheduling",
      "Monitored system logs and configured alerts for server health and security events",
      "Developed Python and Bash automation scripts for deployment, log parsing, and API integrations",
      "Projects: ImmigrateX (Next.js SaaS), Chattr (real-time messaging), 3D Chess (Three.js), RBAC Security App",
      "Implemented Role-Based Access Control (Principle of Least Privilege) in production",
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
      "Maintained health and safety compliance documentation and audit-ready records",
      "Coordinated with front-of-house for cross-functional operational efficiency",
      "Resolved operational incidents quickly under pressure, a core SOC skill",
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
    summary: "Multi-site kitchen operations. Developed operational discipline, process documentation, and systems thinking under service pressure.",
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

/* Every ACTIVE stamp gets its own rotation, scale, opacity and border weight. */
const STAMP_R = [-4.5, -1.6, 2.1];
const STAMP_S = [1.04, 0.95, 1.07];
const STAMP_O = [0.93, 0.86, 0.96];
const STAMP_BW = [2.4, 3.2, 2.9];

function RoleCard({ role, index }: { role: typeof ROLES[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="overflow-hidden cursor-pointer group"
        onClick={() => setOpen(!open)}
        style={{
          border: "1.5px solid var(--cf-ink)",
          background: open ? "var(--cf-paper-2)" : "transparent",
        }}
      >
        {/* Top file rule */}
        <div className="h-[3px] w-full" style={{ background: "var(--cf-ink)" }} />

        {/* Card header */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Icon in a bordered square */}
              <div
                className="w-11 h-11 flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "transparent", border: "1.5px solid var(--cf-ink)" }}
              >
                <role.icon className="w-4.5 h-4.5" style={{ color: "var(--cf-ink)" }} />
              </div>

              <div>
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span
                    className="cf-mono text-[9px] tracking-[0.2em] px-2 py-0.5"
                    style={{ color: "var(--cf-ink)", background: "transparent", border: "1px solid var(--cf-faint)" }}
                  >
                    {role.type}
                  </span>
                  {role.active && (
                    <Stamp
                      tone="green"
                      r={STAMP_R[index % STAMP_R.length]}
                      s={STAMP_S[index % STAMP_S.length]}
                      o={STAMP_O[index % STAMP_O.length]}
                      bw={STAMP_BW[index % STAMP_BW.length]}
                      delay={120 + index * 110}
                      className="text-[9px] px-2 py-0.5"
                    >
                      Active
                    </Stamp>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-[var(--cf-ink)] leading-snug mb-1">
                  {role.role}
                </h3>
                <p className="font-medium text-sm" style={{ color: "var(--cf-ink)" }}>{role.company}</p>
                {role.clients !== role.company && (
                  <p className="text-[var(--cf-muted)] text-xs mt-0.5">{role.clients}</p>
                )}
              </div>
            </div>

            <ChevronDown
              className="w-4 h-4 text-[var(--cf-muted)] shrink-0 mt-1 transition-transform duration-300"
              style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 mt-4 pl-[60px]">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-[var(--cf-muted)]" />
              <span className="cf-mono text-[10px] text-[var(--cf-muted)]">{role.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-[var(--cf-muted)]" />
              <span className="cf-mono text-[10px] text-[var(--cf-muted)]">{role.period}</span>
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
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div
                className="px-6 pb-6 pt-5 space-y-6"
                style={{ borderTop: "1px solid var(--cf-faint)" }}
              >
                <p className="text-[var(--cf-ink-soft)] text-sm leading-relaxed">{role.summary}</p>

                {/* Bullets */}
                <div>
                  <p className="cf-mono text-[10px] tracking-[0.2em] mb-3" style={{ color: "var(--cf-ink)" }}>
                    RESPONSIBILITIES
                  </p>
                  <ul className="space-y-2.5">
                    {role.bullets.map((b, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-start gap-3 text-[var(--cf-ink-soft)] text-sm"
                      >
                        <span
                          className="w-1.5 h-1.5 shrink-0 mt-2"
                          style={{ background: "var(--cf-red)" }}
                        />
                        {b}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Skill transfer grid */}
                <div
                  className="p-4"
                  style={{ background: "var(--cf-paper-2)", border: "1px solid var(--cf-faint)" }}
                >
                  <p className="cf-mono text-[10px] tracking-[0.2em] mb-3" style={{ color: "var(--cf-ink)" }}>
                    CYBERSECURITY SKILL TRANSFER
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {role.transfer.map((t, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] cf-mono">
                        <span className="text-[var(--cf-muted)]">{t.from}</span>
                        <ArrowRight className="w-3 h-3 shrink-0" style={{ color: "var(--cf-red)" }} />
                        <span style={{ color: "var(--cf-ink)" }}>{t.to}</span>
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
    <div className="pb-24">
      <div className="cf-wrap">
        <PageHead
          kicker="Experience, work history"
          title={
            <>
              Operator <span className="cf-u-red">History</span>
            </>
          }
          lede="Every role has built the mindset of a security professional, from physical access control to secure software development. Click any card to expand."
        />

        {/* Stats: a mono ruled strip, with a stamp sitting on its top rule */}
        <Reveal delay={0.08} className="relative mt-12">
          <Stamp
            tone="red"
            r={-4.1}
            s={1.01}
            o={0.9}
            bw={2.6}
            delay={350}
            className="absolute -top-4 right-4 sm:right-10 z-10 text-[11px]"
          >
            On file
          </Stamp>
          <div
            className="grid grid-cols-2 sm:grid-cols-4"
            style={{ border: "2px solid var(--cf-ink)", background: "var(--cf-paper-2)" }}
          >
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className="px-5 py-4"
                style={{
                  borderLeft: i > 0 ? "1px solid var(--cf-faint)" : undefined,
                }}
              >
                <p className="cf-display text-2xl" style={{ color: "var(--cf-ink)" }}>{s.value}</p>
                <p className="cf-mono text-[9px] text-[var(--cf-muted)] tracking-wider mt-1 uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Role entries */}
        <Reveal delay={0.05} className="mt-12">
          <div className="space-y-5">
            {ROLES.map((role, i) => (
              <RoleCard key={i} role={role} index={i} />
            ))}
          </div>
        </Reveal>

        {/* Career roadmap (merged in from the old /career page, round 2) */}
        <CareerSection />
      </div>
    </div>
  );
}
