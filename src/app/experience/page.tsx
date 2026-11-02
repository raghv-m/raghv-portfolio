"use client";
import { useState } from "react";
import { motion, useInView, AnimatePresence, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { Briefcase, Shield, Code2, ChevronDown, ArrowRight } from "lucide-react";
import { PageHead } from "@/components/casefile/PageHead";
import { Reveal } from "@/components/casefile/Reveal";
import { Stamp } from "@/components/casefile/Stamp";
import { RailFill } from "@/components/casefile/RailFill";
import { CareerSection } from "@/components/sections/CareerSection";
import { EASE_OUT } from "@/components/casefile/motion";


const ROLES = [
  {
    icon: Shield,
    company: "Impact Security",
    role: "Screening Officer / Access Control Specialist",
    clients: "ADESA Auction & Covenant Health",
    location: "Nisku & Edmonton, AB",
    period: "Apr 2023 – Present",
    startKey: "2023-04-b",
    act: "security",
    color: "var(--gold)",
    accentHex: "#AD0117",
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
    role: "Loss Prevention Supervisor",
    clients: "Dollarama",
    location: "Edmonton, AB",
    period: "Apr 2023 – Present",
    startKey: "2023-04-a",
    act: "security",
    color: "var(--gold)",
    accentHex: "#AD0117",
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
    startKey: "2022-08",
    act: "cyber",
    color: "var(--blue)",
    accentHex: "#141414",
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
    startKey: "2025-02",
    act: "kitchen",
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
    startKey: "2022-09",
    act: "kitchen",
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
  {
    icon: Shield,
    company: "GardaWorld",
    role: "Site Supervisor",
    clients: "Strathcona County Hall",
    location: "Sherwood Park, AB",
    period: "Sep 2026 \u2013 Present",
    startKey: "2026-09",
    act: "security",
    color: "var(--gold)",
    accentHex: "#AD0117",
    type: "SECURITY OPS",
    active: true,
    summary: "Running a municipal government site on the night shift: supervising the guard team, sorting shift coverage, and keeping the post to audit standard.",
    bullets: [
      "Run daily site operations and supervise guards on shift",
      "Create, track and close tickets in GTrack; handle Active Directory user accounts",
      "Monitor Avigilon CCTV, work in Polaris and the mobile dispatch apps, respond to alarms",
      "Write shift handover and incident reports that hold up to an audit",
    ],
    transfer: [
      { from: "AD account work", to: "Identity and access basics" },
      { from: "Ticket handling", to: "SOC ticketing" },
      { from: "Incident reports", to: "IR documentation" },
    ],
    tags: ["Team Supervision", "Active Directory", "Ticketing", "CCTV"],
  },
  {
    icon: Shield,
    company: "HomeLab Corp (Home Lab)",
    role: "Security Operations Analyst, Home SOC Lab",
    clients: "Self-directed lab",
    location: "Edmonton, AB",
    period: "2024 \u2013 Present",
    startKey: "2024-01",
    act: "cyber",
    color: "var(--gold)",
    accentHex: "#AD0117",
    type: "CYBER LAB",
    active: true,
    summary: "A full SOC built at home: Wazuh watching a four-machine network, detection rules written and tuned by hand, and 50+ practice attacks, every one written up.",
    bullets: [
      "Built the lab network from zero: Windows domain, web server, Kali attack box, Wazuh in Docker",
      "Write and tune SIEM detection rules; worked the false positives down",
      "Ran 50+ attack simulations and mapped each one to MITRE ATT&CK",
      "Documented every run on GitHub with diagrams and setup notes",
    ],
    transfer: [
      { from: "Lab alerts", to: "Alert triage" },
      { from: "Attack write-ups", to: "Incident reports" },
      { from: "Detection rules", to: "SIEM rule authoring" },
    ],
    tags: ["Wazuh", "Detection Rules", "MITRE ATT&CK", "Log Analysis"],
  },
];

/* Storyboard order: the story in three acts, the kitchen, the security
   officer years, the turn to cyber, chronological inside each act. The
   board runs forward to the present, then closes on the target frame. */
const ACTS = [
  {
    id: "kitchen",
    title: "Act I: The Kitchen",
    line: "Line cook, then kitchen supervisor, then assistant kitchen manager. The years that taught speed, standards, and running a team when it gets loud.",
    scene: "/images/storyboard/chef.webp",
    sceneAlt: "Illustration of Raghav as a chef working the line in a commercial kitchen, tossing a flaming pan",
    sceneCaption: "SCENE 01 / THE LINE",
  },
  {
    id: "security",
    title: "Act II: The Security Officer",
    line: "The uniform years: retail loss prevention, screening at a hospital and a vehicle auction, and a county hall site of his own to run at night.",
    scene: "/images/storyboard/security.webp",
    sceneAlt: "Illustration of Raghav as a security officer in uniform, watching a bank of CCTV monitors",
    sceneCaption: "SCENE 02 / THE POST",
  },
  {
    id: "cyber",
    title: "Act III: The Turn to Cyber",
    line: "Client sites by day and a home SOC lab by night: the same watchfulness, pointed at networks instead of doors.",
    scene: "/images/storyboard/soc.webp",
    sceneAlt: "Illustration of Raghav as a SOC analyst with a headset, seated at a three-monitor desk",
    sceneCaption: "SCENE 03 / THE DESK",
  },
];

const STORY = (() => {
  let next = 0;
  return ACTS.map((act) => {
    const frames = ROLES.filter((r) => r.act === act.id).sort((a, b) => a.startKey.localeCompare(b.startKey));
    const startIndex = next;
    next += frames.length;
    return { ...act, frames, startIndex };
  });
})();

const TOTAL_FRAMES = ROLES.length;

const STATS = [
  { value: "3+", label: "Years in Security" },
  { value: "7", label: "Roles Held" },
  { value: "100+", label: "Incidents Documented" },
  { value: "2026", label: "SOC Target" },
];

/* Every ACTIVE stamp gets its own rotation, scale, opacity and border weight. */
const STAMP_R = [-4.5, -1.6, 2.1];
const STAMP_S = [1.04, 0.95, 1.07];
const STAMP_O = [0.93, 0.86, 0.96];
const STAMP_BW = [2.4, 3.2, 2.9];

function startYear(period: string) {
  const m = period.match(/\d{4}/);
  return m ? m[0] : "";
}

function FramePanel({ role, index, total }: { role: typeof ROLES[0]; index: number; total: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.05, ease: EASE_OUT }}
      className="cf-tl-item"
      style={{ paddingBottom: 34 }}
    >
      {/* Node on the rail: red while the role is still running.
          U5 (upscale pass): the arrival starts at 0.92 scale with a
          critically-damped settle, not a 0.3 rubber-band pop. */}
      <motion.span
        className="cf-tl-node"
        data-hot={role.active ? "true" : undefined}
        aria-hidden="true"
        initial={reduce ? false : { scale: 0.92, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ type: "spring", stiffness: 380, damping: 26, delay: 0.12 }}
      />

      {/* Date block: left of the rail on desktop, stacked on mobile */}
      <div className="cf-tl-date">
        <p className="cf-display" style={{ fontSize: 30, lineHeight: 1, color: "var(--cf-ink)" }}>
          {startYear(role.period)}
        </p>
        <p className="cf-mono cf-fs-data mt-2" style={{ color: "var(--cf-red)" }}>
          FRAME {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
        <p className="cf-mono cf-fs-data text-[var(--cf-muted)] mt-1">{role.period}</p>
        <p className="cf-mono cf-fs-data text-[var(--cf-muted)] mt-1">{role.location}</p>
      </div>

      {/* Storyboard panel */}
      <div
        className="cf-panel"
        data-hot={role.active ? "true" : undefined}
        style={{
          border: "2px solid var(--cf-ink)",
          background: "var(--cf-paper-2)",
        }}
      >
        <div className="h-[3px] w-full" style={{ background: "var(--cf-ink)" }} />

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className="w-11 h-11 flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "transparent", border: "1.5px solid var(--cf-ink)" }}
              >
                <role.icon className="w-4.5 h-4.5" style={{ color: "var(--cf-ink)" }} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span
                    className="cf-mono cf-fs-data tracking-[0.2em] px-2 py-0.5"
                    style={{ color: "var(--cf-ink)", background: "transparent", border: "1px solid var(--cf-faint)" }}
                  >
                    {role.type}
                  </span>
                  {role.active && (
                    <Stamp
                      tone="red"
                      r={STAMP_R[index % STAMP_R.length]}
                      s={STAMP_S[index % STAMP_S.length]}
                      o={STAMP_O[index % STAMP_O.length]}
                      bw={STAMP_BW[index % STAMP_BW.length]}
                      delay={120 + index * 110}
                      className="cf-fs-data px-2 py-0.5"
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
          </div>

          {/* The story of the frame, always on the board */}
          <p className="text-[var(--cf-ink-soft)] text-sm leading-relaxed mt-4">{role.summary}</p>

          {/* Evidence chips */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {role.tags.map((t) => (
              <span key={t} className="tag cf-fs-data">{t}</span>
            ))}
          </div>

          {/* Expand the full frame */}
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            className="cf-mono cf-fs-data tracking-widest mt-5 flex items-center gap-2"
            style={{ color: "var(--cf-red)" }}
          >
            {open ? "CLOSE FRAME" : "FULL FRAME — DUTIES + SKILL TRANSFER"}
            <ChevronDown
              className="w-3.5 h-3.5 transition-transform duration-300"
              style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="overflow-hidden"
            >
              <div
                className="px-6 pb-6 pt-5 space-y-6"
                style={{ borderTop: "1px solid var(--cf-faint)" }}
              >
                <div>
                  <p className="cf-mono cf-fs-data tracking-[0.2em] mb-3" style={{ color: "var(--cf-ink)" }}>
                    RESPONSIBILITIES
                  </p>
                  <ul className="space-y-2.5">
                    {role.bullets.map((b, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, ease: EASE_OUT }}
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

                <div
                  className="p-4"
                  style={{ background: "var(--cf-paper)", border: "1px solid var(--cf-faint)" }}
                >
                  <p className="cf-mono cf-fs-data tracking-[0.2em] mb-3" style={{ color: "var(--cf-ink)" }}>
                    CYBERSECURITY SKILL TRANSFER
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {role.transfer.map((t, i) => (
                      <div key={i} className="flex items-center gap-2 cf-fs-label cf-mono">
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
          lede="The work history as a storyboard in three acts: the kitchen, the security officer years, and the turn to cyber. Seven frames on one rail, in story order as you scroll. Each frame carries the story, the evidence chips, and the full duty list one click down."
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
            className="absolute -top-4 right-4 sm:right-10 z-10 cf-fs-label"
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
                <p className="cf-mono cf-fs-data text-[var(--cf-muted)] tracking-wider mt-1 uppercase">{s.label}</p>
              </div>
            ))}
          </div>
          {/* Forensic-fix: the 100+ figure, defined. The number itself is unchanged. */}
          <p className="cf-mono cf-fs-data text-[var(--cf-muted)] mt-3">
            100+ incidents documented — incident reports filed across his physical security roles since 2023.
          </p>
        </Reveal>

        {/* Storyboard rail */}
        <Reveal delay={0.05} className="mt-16">
          <div className="cf-tl">
            <RailFill />
            {STORY.map((act) => (
              <div key={act.id}>
                <div className="cf-tl-item" style={{ paddingBottom: 6 }}>
                  <span className="cf-tl-node" aria-hidden="true" />
                  <div className="cf-tl-date">
                    <p className="cf-mono cf-fs-data" style={{ color: "var(--cf-red)" }}>
                      THE STORY
                    </p>
                  </div>
                  <div>
                    <h2 className="cf-display text-2xl" style={{ color: "var(--cf-ink)" }}>
                      {act.title}
                    </h2>
                    <p className="text-[var(--cf-ink-soft)] text-sm leading-relaxed mt-2" style={{ maxWidth: "62ch" }}>
                      {act.line}
                    </p>
                    <div
                      className="cf-panel mt-5"
                      style={{ border: "2px solid var(--cf-ink)", background: "var(--cf-paper-2)" }}
                    >
                      <img src={act.scene} alt={act.sceneAlt} className="block w-full" loading="lazy" />
                      <p
                        className="cf-mono cf-fs-data px-4 py-2.5"
                        style={{ color: "var(--cf-red)", borderTop: "2px solid var(--cf-ink)" }}
                      >
                        {act.sceneCaption}
                      </p>
                    </div>
                  </div>
                </div>
                {act.frames.map((role, j) => (
                  <FramePanel key={role.startKey} role={role} index={act.startIndex + j} total={TOTAL_FRAMES + 1} />
                ))}
              </div>
            ))}

            {/* Closing frame: the target the whole board points at */}
            <div className="cf-tl-item">
              <motion.span
                className="cf-tl-node"
                data-hot="true"
                aria-hidden="true"
                initial={{ scale: 0.92, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 380, damping: 26, delay: 0.12 }}
              />
              <div className="cf-tl-date">
                <p className="cf-display" style={{ fontSize: 30, lineHeight: 1, color: "var(--cf-red)" }}>
                  2026
                </p>
                <p className="cf-mono cf-fs-data mt-2" style={{ color: "var(--cf-red)" }}>
                  FRAME {String(TOTAL_FRAMES + 1).padStart(2, "0")} / {String(TOTAL_FRAMES + 1).padStart(2, "0")}
                </p>
                <p className="cf-mono cf-fs-data text-[var(--cf-muted)] mt-1">Target: 2025–2026</p>
              </div>
              <div
                className="cf-panel"
                data-hot="true"
                style={{
                  border: "3px dashed var(--cf-ink)",
                  background: "transparent",
                }}
              >
                <div className="h-[4px] w-full" style={{ background: "var(--cf-red)" }} />
                <div className="p-6">
                <p className="cf-mono cf-fs-data tracking-[0.2em] mb-2" style={{ color: "var(--cf-red)" }}>
                  NEXT FRAME — NOT YET SHOT
                </p>
                <h3 className="cf-display text-xl text-[var(--cf-ink)]">SOC Analyst, Tier 1</h3>
                <p className="text-[var(--cf-ink-soft)] text-sm leading-relaxed mt-2" style={{ maxWidth: "62ch" }}>
                  The role every frame on this rail is aimed at. The lab, the certs, and the
                  incident mindset that started in a kitchen and a guard booth, pointed at a
                  SOC desk in Edmonton or remote.
                </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Career roadmap (merged in from the old /career page, round 2) */}
        <CareerSection />
      </div>
    </div>
  );
}
