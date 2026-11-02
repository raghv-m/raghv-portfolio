"use client";

/**
 * ExperienceStory — /experience as an editorial documentary.
 *
 * Six chapters, one continuous record: the builder, the operations
 * foundation, security operations, leadership, the technical transition,
 * and the present direction. A scroll-linked rail tracks the active
 * chapter, skills can be picked to highlight where they were actually
 * used, and each chapter expands to its full record. Every date, duty
 * and credential here matches the resume. No percentages, no padded
 * numbers, no duties dressed up as something they were not.
 *
 * Motion: framer-motion (already installed). Reduced motion gets a
 * static, fully readable page.
 */
import { useRef, useState, type ReactNode } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useReducedMotion,
} from "framer-motion";

/* ------------------------------------------------------------------ */
/* Data — the real record, same facts as the resume.                   */
/* ------------------------------------------------------------------ */

type Role = { title: string; org: string; period: string; duties: string[] };
type Evidence = { label: string; href: string | null };
type Cert = { name: string; issuer: string; status: string };
type Chapter = {
  id: string;
  no: string;
  title: string;
  span: string;
  orgs: string;
  headline: string;
  narrative: string;
  roles: Role[];
  skills: string[];
  evidence: Evidence[];
  extra: string[];
  certs?: Cert[];
  focus?: string[];
};

const CHAPTERS: Chapter[] = [
  {
    id: "builder",
    no: "01",
    title: "The Builder",
    span: "2022 - Present",
    orgs: "Self-employed · Edmonton",
    headline: "Software came first.",
    narrative:
      "I started building in 2022, during my software diploma at NAIT. Personal projects turned into paid client work: full sites and apps for small businesses, planned, built, deployed and handed over with documentation the client can actually use. The security habits started here too, in how the apps handle accounts, access and input.",
    roles: [
      {
        title: "Freelance Web and Software Developer",
        org: "Self-employed · Edmonton, AB",
        period: "2022 - Present",
        duties: [
          "Build and secure websites and apps for small business clients. React, TypeScript and Node on most builds.",
          "Handle authentication, access control and input validation properly, not as an afterthought.",
          "Deal direct with non-technical clients: scope the work, build it, hand over docs they can follow.",
        ],
      },
      {
        title: "Mobile Application Developer (Capstone)",
        org: "Credwise Financial, through NAIT · Edmonton, AB",
        period: "Sep 2024 - Jan 2025",
        duties: [
          "Built a financial app with a student team. Python, SQL and the MERN stack.",
          "Hit every milestone the client set.",
        ],
      },
    ],
    skills: ["React / TypeScript", "Node.js", "Client delivery", "Linux administration", "Secure development"],
    evidence: [
      { label: "Vic Cameleers, a live client site", href: "https://viccameleers.com" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "GitHub", href: "https://github.com/HomeLab-Raghav" },
    ],
    extra: [
      "Stack across builds: React, TypeScript, JavaScript, Python, Flutter, Node.js, SQL, MongoDB, Firebase, Git.",
      "This site is one of the builds: raghv.dev runs a working estimator, contracts and invoicing behind the pages you are reading.",
    ],
  },
  {
    id: "operations",
    no: "02",
    title: "The Operations Foundation",
    span: "2022 - 2025",
    orgs: "Boston Pizza · Earls · St. Louis · Simon Co.",
    headline: "Kitchens taught pressure.",
    narrative:
      "Restaurant work is where the operating habits came from: process, standards, and holding quality when the room is full and the tickets keep coming. A materials handling job on construction sites ran alongside it, and still does.",
    roles: [
      {
        title: "Kitchen Supervisor (promoted from Line Cook)",
        org: "Boston Pizza · Edmonton, AB",
        period: "Sep 2022 - Dec 2023",
        duties: [
          "Trained new hires and coordinated stations at peak volume.",
          "Enforced food safety and compliance standards on the line.",
        ],
      },
      {
        title: "Line Cook",
        org: "Earls Kitchen + Bar and St. Louis Bar and Grill · Edmonton, AB",
        period: "Jan 2025 - Oct 2025",
        duties: [
          "Held two kitchen roles at the same time, high-volume service to strict quality standards, reliable attendance.",
        ],
      },
      {
        title: "Materials Handling / Construction Labourer",
        org: "Simon Co. · Edmonton, AB",
        period: "Mar 2023 - Present",
        duties: [
          "Receiving, staging and quality-checking deliveries on active construction sites.",
        ],
      },
    ],
    skills: ["Team training", "Food safety and compliance", "Inventory", "Physical work"],
    evidence: [{ label: "References available on request", href: null }],
    extra: [
      "What carries over: showing up, holding a standard when it is busy, and writing things down so the next shift can follow them.",
    ],
  },
  {
    id: "security-operations",
    no: "03",
    title: "Security Operations",
    span: "2023 - Present",
    orgs: "Impact Security Group · GardaWorld",
    headline: "Then I learned what it means to protect.",
    narrative:
      "Three years in physical security: screening at a hospital, access control at a vehicle auction, loss prevention in retail, and now supervising a municipal site. The work is watching, deciding what matters, and writing it down so it holds up. It is not cybersecurity employment, and this page does not dress it up as that. The habits transfer: monitoring, triage, escalation, documentation.",
    roles: [
      {
        title: "Site Supervisor",
        org: "GardaWorld · Strathcona County Hall, Sherwood Park, AB",
        period: "Sep 2026 - Present",
        duties: [
          "Run daily site operations at a municipal government site. Supervise guards and sort out shift coverage.",
          "Create, track and close tickets in GTrack. Handle Active Directory user accounts.",
          "Monitor Avigilon CCTV, work in Polaris and the mobile dispatch apps, respond to alarms and escalate by procedure.",
          "Write shift handover and incident reports that hold up to an audit.",
        ],
      },
      {
        title: "Loss Prevention Officer",
        org: "Impact Security Group (Dollarama) · Edmonton, AB",
        period: "Jan 2025 - Present",
        duties: [
          "Investigate theft using surveillance footage. Reports go to management and police.",
          "Watch live camera feeds and decide what needs escalating. You learn fast what normal looks like.",
        ],
      },
      {
        title: "Screening Officer / Tactical Guard",
        org: "Impact Security Group (Covenant Health, ADESA Nisku) · Edmonton, AB",
        period: "May 2023 - Present",
        duties: [
          "Check credentials for 100+ people a day at a hospital site. Keep the access logs clean.",
          "Write incident reports and witness statements. Some have gone to Edmonton Police.",
        ],
      },
    ],
    skills: ["Leadership", "CCTV monitoring", "Access control", "Incident reporting", "Active Directory", "Ticketing (GTrack)"],
    evidence: [{ label: "Employer records and references on request. Incident reports are confidential by nature.", href: null }],
    extra: [
      "The progression is real: guard, to loss prevention, to site supervisor running a municipal contract site with a team.",
    ],
  },
  {
    id: "leadership",
    no: "04",
    title: "Leadership",
    span: "Feb - Jul 2025",
    orgs: "Leopold's Tavern",
    headline: "Running the room, not just a station.",
    narrative:
      "The step from doing the work to running it. As Assistant Kitchen Manager I owned the shift: the people, the standards, the stock. It overlaps the security work on the calendar, and that overlap is the honest shape of these years: more than one job at a time, held to a standard in each.",
    roles: [
      {
        title: "Assistant Kitchen Manager",
        org: "Leopold's Tavern · Edmonton, AB",
        period: "Feb 2025 - Jul 2025",
        duties: [
          "Supervised 10+ staff on shift, assigned tasks and kept service moving at peak.",
          "Managed inventory counts and ordering support.",
          "Held food safety and compliance standards across the kitchen.",
        ],
      },
    ],
    skills: ["Leadership", "Scheduling", "Inventory", "Compliance"],
    evidence: [{ label: "References available on request", href: null }],
    extra: [
      "Same pattern as the security work that followed: a team, a standard, and paperwork that has to be right.",
    ],
  },
  {
    id: "transition",
    no: "05",
    title: "The Technical Transition",
    span: "2022 - Present",
    orgs: "NAIT · HomeLab Corp",
    headline: "Building the cyber side, hands on.",
    narrative:
      "The diploma gave the base. The rest is a home lab I built and run myself: a small network with Active Directory, a Wazuh SIEM watching it, and attack simulations I run, detect and write up. No classroom claims. The repos and write-ups below are the proof of work.",
    roles: [
      {
        title: "Diploma, Computer Software Engineering (Digital Media and IT)",
        org: "Northern Alberta Institute of Technology (NAIT) · Edmonton, AB",
        period: "2022 - 2024",
        duties: [
          "Software development diploma. The capstone shipped a working financial app for a real client.",
        ],
      },
      {
        title: "Security Operations Analyst (Home SOC Lab)",
        org: "HomeLab Corp · Edmonton, AB",
        period: "2024 - Present",
        duties: [
          "Built a SOC lab from scratch: Wazuh, Splunk, Windows Server with AD, Ubuntu, Kali, all in Docker. I triage the alerts myself and write up what I find.",
          "Write and tune my own detection rules. Getting the false positives down took real work.",
          "Ran 50+ attack simulations against the lab: credential attacks, lateral movement, persistence, each mapped to MITRE ATT&CK.",
        ],
      },
      {
        title: "IT Lab Administrator (Home Lab)",
        org: "HomeLab Corp · Edmonton, AB",
        period: "2024 - Present",
        duties: [
          "Run a multi-machine Windows and Linux setup: AD domain, Group Policy, user accounts, DNS and DHCP, configured by hand.",
          "Automate the repetitive parts with PowerShell. Write procedures down so they only get figured out once.",
        ],
      },
    ],
    skills: ["Linux", "Active Directory", "Wazuh / SIEM", "Log analysis", "Networking", "Scripting"],
    evidence: [
      { label: "docker-soc-lab", href: "https://github.com/HomeLab-Raghav/docker-soc-lab" },
      { label: "HomeLab documentation", href: "https://github.com/HomeLab-Raghav/HomeLab" },
      { label: "IR playbooks", href: "https://github.com/HomeLab-Raghav/SOC" },
      { label: "Write-ups", href: "/blog" },
    ],
    extra: [
      "Lab network: HOMELAB.CORP on 192.168.10.0/24, four nodes including the Wazuh server and a Kali attacker. Documented on GitHub with architecture diagrams and setup manuals.",
      "Networking from the lab bench, not a textbook: subnetting and IP addressing, DHCP, DNS, NAT and firewall rules, configured and broken and fixed on my own machines.",
    ],
  },
  {
    id: "present",
    no: "06",
    title: "The Present",
    span: "2026 -",
    orgs: "Edmonton · open to roles across Canada",
    headline: "Pointing all of it at a SOC desk.",
    narrative:
      "The direction is set: entry-level SOC and cybersecurity analyst work. It is a target, not a job I claim to hold, and the record above is why it is a credible one: years of monitoring and incident documentation, a working lab, and certifications with dates that check out.",
    roles: [],
    skills: ["Wazuh / SIEM", "Log analysis", "Incident reporting"],
    evidence: [
      { label: "Resume (PDF)", href: "/resume.pdf" },
      { label: "Certifications", href: "/certifications" },
      { label: "Contact", href: "/contact" },
    ],
    extra: [],
    certs: [
      { name: "CompTIA Security+ (SY0-701)", issuer: "CompTIA", status: "Certified Jun 15, 2026" },
      { name: "Certified in Cybersecurity (CC)", issuer: "ISC2", status: "Certified 2026" },
      { name: "Cybersecurity Professional Certificate", issuer: "Google", status: "Completed Jan 2026" },
      { name: "Intermediate First Aid and CPR", issuer: "Certification", status: "Issued Oct 2, 2026 · valid to Oct 2, 2029" },
      { name: "Microsoft SC-200", issuer: "Microsoft", status: "In progress" },
      { name: "TryHackMe SOC Level 1 pathway", issuer: "TryHackMe", status: "In progress" },
    ],
    focus: [
      "Current focus: Wazuh detection rules, alert triage practice, and the SC-200.",
      "Available for entry-level SOC analyst, cybersecurity analyst and IT support roles across Canada.",
      "On a post-graduation work permit. No sponsorship needed.",
    ],
  },
];

const SKILL_FILTERS = [
  "Leadership",
  "CCTV monitoring",
  "Access control",
  "Incident reporting",
  "Linux",
  "Active Directory",
  "Wazuh / SIEM",
  "Log analysis",
  "React / TypeScript",
  "Client delivery",
];

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function EvidenceRow({ items }: { items: Evidence[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6">
      <span className="cf-mono cf-fs-data uppercase tracking-wider" style={{ color: "var(--cf-red)" }}>
        Proof
      </span>
      {items.map((e) =>
        e.href ? (
          <a
            key={e.label}
            href={e.href}
            target={e.href.startsWith("http") ? "_blank" : undefined}
            rel={e.href.startsWith("http") ? "noreferrer" : undefined}
            className="cf-mono cf-fs-data underline underline-offset-4 decoration-1 hover:decoration-2"
            style={{ color: "var(--cf-ink)" }}
          >
            {e.label}
          </a>
        ) : (
          <span key={e.label} className="cf-mono cf-fs-data" style={{ color: "var(--cf-muted)" }}>
            {e.label}
          </span>
        ),
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter                                                             */
/* ------------------------------------------------------------------ */

function ChapterBlock({
  ch,
  dimmed,
  expanded,
  onToggle,
  onSkill,
  onEnter,
}: {
  ch: Chapter;
  dimmed: boolean;
  expanded: boolean;
  onToggle: () => void;
  onSkill: (s: string) => void;
  onEnter: () => void;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.section
      id={`chapter-${ch.id}`}
      onViewportEnter={onEnter}
      viewport={{ margin: "-40% 0px -50% 0px" }}
      className="relative"
      style={{
        opacity: dimmed ? 0.35 : 1,
        transition: "opacity 300ms ease",
        borderTop: "2px solid var(--cf-ink)",
        paddingTop: "2.25rem",
        paddingBottom: "2.75rem",
      }}
    >
      <div className="grid gap-8 lg:grid-cols-[190px_1fr]">
        {/* Meta column */}
        <div>
          <p className="cf-display leading-none" style={{ fontSize: "3.4rem", color: "var(--cf-red)" }}>
            {ch.no}
          </p>
          <p className="cf-mono cf-fs-data uppercase tracking-wider mt-3" style={{ color: "var(--cf-ink)" }}>
            {ch.span}
          </p>
          <p className="cf-mono cf-fs-data mt-1" style={{ color: "var(--cf-muted)" }}>
            {ch.orgs}
          </p>
        </div>

        {/* Body */}
        <div>
          <Reveal>
            <p className="cf-mono cf-fs-label uppercase tracking-widest" style={{ color: "var(--cf-muted)" }}>
              Chapter {ch.no} / {ch.title}
            </p>
            <h2 className="cf-display mt-2" style={{ fontSize: "clamp(1.9rem, 4.2vw, 3rem)", lineHeight: 1.04 }}>
              {ch.headline}
            </h2>
            <p className="mt-4 max-w-[62ch]" style={{ color: "var(--cf-ink-soft)", lineHeight: 1.65 }}>
              {ch.narrative}
            </p>
          </Reveal>

          {/* Roles */}
          <div className="mt-8 space-y-8">
            {ch.roles.map((r, i) => (
              <Reveal key={r.title} delay={Math.min(i * 0.06, 0.12)}>
                <div
                  className="pl-4"
                  style={{ borderLeft: "3px solid var(--cf-red)" }}
                >
                  <h3 className="font-bold" style={{ fontSize: "1.05rem" }}>
                    {r.title}
                  </h3>
                  <p className="cf-mono cf-fs-data mt-1" style={{ color: "var(--cf-muted)" }}>
                    {r.org} · {r.period}
                  </p>
                  <ul className="mt-3 space-y-1.5 max-w-[68ch]" style={{ color: "var(--cf-ink-soft)", lineHeight: 1.6 }}>
                    {r.duties.map((d) => (
                      <li key={d.slice(0, 32)} className="flex gap-2">
                        <span aria-hidden style={{ color: "var(--cf-red)" }}>-</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Certifications (Present chapter) */}
          {ch.certs && (
            <Reveal className="mt-8">
              <div style={{ border: "2px solid var(--cf-ink)", background: "var(--cf-paper-2)" }}>
                {ch.certs.map((c, i) => (
                  <div
                    key={c.name}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-3"
                    style={{ borderTop: i > 0 ? "1px solid var(--cf-faint)" : undefined }}
                  >
                    <p className="font-bold">{c.name}</p>
                    <p className="cf-mono cf-fs-data" style={{ color: "var(--cf-muted)" }}>
                      {c.issuer} · {c.status}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {/* Focus lines (Present chapter) */}
          {ch.focus && (
            <ul className="mt-6 space-y-1.5 max-w-[68ch]" style={{ color: "var(--cf-ink-soft)", lineHeight: 1.6 }}>
              {ch.focus.map((f) => (
                <li key={f.slice(0, 32)} className="flex gap-2">
                  <span aria-hidden style={{ color: "var(--cf-red)" }}>-</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mt-7">
            {ch.skills.map((s) => {
              const isFilter = SKILL_FILTERS.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  disabled={!isFilter}
                  onClick={() => onSkill(s)}
                  className="cf-mono cf-fs-data px-2.5 py-1"
                  style={{
                    border: "1px solid var(--cf-ink)",
                    background: "var(--cf-paper)",
                    color: "var(--cf-ink)",
                    cursor: isFilter ? "pointer" : "default",
                    opacity: isFilter ? 1 : 0.75,
                  }}
                  title={isFilter ? `Highlight chapters using ${s}` : undefined}
                >
                  {s}
                </button>
              );
            })}
          </div>

          <EvidenceRow items={ch.evidence} />

          {/* Expandable full record */}
          {ch.extra.length > 0 && (
            <div className="mt-6">
              <button
                type="button"
                onClick={onToggle}
                aria-expanded={expanded}
                className="cf-mono cf-fs-data uppercase tracking-wider px-3 py-2"
                style={{
                  border: "2px solid var(--cf-ink)",
                  background: expanded ? "var(--cf-ink)" : "var(--cf-paper)",
                  color: expanded ? "var(--cf-paper)" : "var(--cf-ink)",
                  boxShadow: expanded ? "none" : "3px 3px 0 var(--cf-red)",
                  cursor: "pointer",
                }}
              >
                {expanded ? "Close the record" : "Full record"}
              </button>
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    key="extra"
                    initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                    exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: reduced ? 0.15 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      className="mt-4 px-5 py-4 max-w-[72ch]"
                      style={{ border: "1px solid var(--cf-faint)", background: "var(--cf-paper-2)" }}
                    >
                      {ch.extra.map((x) => (
                        <p key={x.slice(0, 32)} className="mb-2 last:mb-0" style={{ color: "var(--cf-ink-soft)", lineHeight: 1.6 }}>
                          {x}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/* The documentary                                                     */
/* ------------------------------------------------------------------ */

export function ExperienceStory() {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start 0.85", "end 0.55"] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });
  const [active, setActive] = useState(CHAPTERS[0].id);
  const [skill, setSkill] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const toggleSkill = (s: string) => setSkill((cur) => (cur === s ? null : s));

  return (
    <div className="mt-16">
      {/* Skill finder */}
      <Reveal>
        <div
          className="px-5 py-4"
          style={{ border: "2px solid var(--cf-ink)", background: "var(--cf-paper-2)" }}
        >
          <p className="cf-mono cf-fs-label uppercase tracking-widest" style={{ color: "var(--cf-muted)" }}>
            Find the work by skill {skill ? <span style={{ color: "var(--cf-red)" }}>· showing: {skill}</span> : null}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {SKILL_FILTERS.map((s) => {
              const on = skill === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  aria-pressed={on}
                  className="cf-mono cf-fs-data px-2.5 py-1"
                  style={{
                    border: "1px solid var(--cf-ink)",
                    background: on ? "var(--cf-red)" : "var(--cf-paper)",
                    color: on ? "var(--cf-paper)" : "var(--cf-ink)",
                    cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              );
            })}
            {skill && (
              <button
                type="button"
                onClick={() => setSkill(null)}
                className="cf-mono cf-fs-data px-2.5 py-1 underline underline-offset-4"
                style={{ color: "var(--cf-muted)", cursor: "pointer" }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </Reveal>

      {/* Rail + chapters */}
      <div ref={wrapRef} className="relative mt-4 lg:grid lg:grid-cols-[64px_1fr] lg:gap-10">
        {/* Progress rail (desktop) */}
        <div className="hidden lg:block">
          <div className="sticky top-28 flex flex-col items-center" style={{ height: "62vh" }}>
            <div
              className="relative w-[3px] flex-1"
              style={{ background: "var(--cf-faint)" }}
              aria-hidden
            >
              <motion.div
                className="absolute top-0 left-0 w-full origin-top"
                style={{
                  height: "100%",
                  scaleY: reduced ? scrollYProgress : fill,
                  background: "var(--cf-red)",
                }}
              />
            </div>
            <div className="flex flex-col gap-3 mt-4">
              {CHAPTERS.map((c) => (
                <a
                  key={c.id}
                  href={`#chapter-${c.id}`}
                  className="cf-mono cf-fs-data"
                  style={{
                    color: active === c.id ? "var(--cf-red)" : "var(--cf-muted)",
                    fontWeight: active === c.id ? 700 : 400,
                  }}
                >
                  {c.no}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Chapters */}
        <div>
          {CHAPTERS.map((ch) => (
            <ChapterBlock
              key={ch.id}
              ch={ch}
              dimmed={skill !== null && !ch.skills.includes(skill)}
              expanded={open === ch.id}
              onToggle={() => setOpen((cur) => (cur === ch.id ? null : ch.id))}
              onSkill={toggleSkill}
              onEnter={() => setActive(ch.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
