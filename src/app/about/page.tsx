"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { Download } from "lucide-react";
import { PageHead } from "@/components/casefile/PageHead";
import { Reveal } from "@/components/casefile/Reveal";
import { Stamp } from "@/components/casefile/Stamp";


const STAGES = [
  {
    id: 1,
    label: "STAGE 01",
    title: "The Kitchen",
    period: "2022–2025",
    color: "var(--text-muted)",
    accent: "#8a6914",
    narrative: `I learned how to operate under pressure long before I ever opened a terminal. Running a kitchen line during Friday dinner rush, with orders stacking, tickets flying and three timers in your head at once. That's where operational discipline gets hard-wired.

I managed kitchen staff at Leopold's and worked the line at Boston Pizza, Earls, and St. Louis. The job wasn't glamorous, but it taught me something no certification can: how to stay calm when everything is on fire, document what happened, and figure out the root cause later.

I didn't know it then, but I was already developing the incident response mindset. In a SOC, an alert fires and you triage, escalate, and write the post-mortem. In a kitchen, an order goes wrong and you fix it fast, you communicate clearly, you document why. Same mental model. Different domain.`,
    icon: (
      <svg viewBox="0 0 120 120" className="w-24 h-24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="20" y="55" width="80" height="40" rx="4" strokeOpacity="0.4" />
        <path d="M30 55 C30 30 90 30 90 55" strokeOpacity="0.4" />
        <line x1="50" y1="55" x2="50" y2="95" strokeOpacity="0.2" />
        <line x1="70" y1="55" x2="70" y2="95" strokeOpacity="0.2" />
        <circle cx="40" cy="72" r="8" strokeOpacity="0.6" />
        <circle cx="60" cy="72" r="8" strokeOpacity="0.6" />
        <circle cx="80" cy="72" r="8" strokeOpacity="0.6" />
        <path d="M40 40 L40 30 M60 40 L60 25 M80 40 L80 30" strokeOpacity="0.3" />
      </svg>
    ),
    tags: ["Pressure Performance", "Process Documentation", "Team Leadership", "Operational Discipline"],
  },
  {
    id: 2,
    label: "STAGE 02",
    title: "The Guard",
    period: "2023–Present",
    color: "var(--gold-muted)",
    accent: "var(--gold)",
    narrative: `Getting my Alberta Security Guard license was the first time I wore a professional identity I could build on. Impact Security, ADESA Auction, Covenant Health. I was monitoring systems, managing access, and writing incident reports. The work was physical, but the thinking was analytical.

I started noticing the parallels immediately. CCTV monitoring is log monitoring. Access control is IAM. Incident escalation is SOC escalation. The language was different but the mechanics were identical.

The 5 W's framework I used to write incident reports (Who, What, When, Where, Why) is the same structure used in digital IR documentation. I was doing security operations before I knew what that phrase meant in a technical context. That realization made me want to go deeper.`,
    icon: (
      <svg viewBox="0 0 120 120" className="w-24 h-24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M60 15 L60 15 C40 15 25 30 25 50 L25 75 L60 105 L95 75 L95 50 C95 30 80 15 60 15Z" strokeOpacity="0.5" />
        <path d="M60 30 L60 30 C47 30 37 40 37 53 L37 70 L60 88 L83 70 L83 53 C83 40 73 30 60 30Z" strokeOpacity="0.3" />
        <circle cx="60" cy="58" r="8" strokeOpacity="0.6" />
        <path d="M47 80 L55 72 M73 80 L65 72" strokeOpacity="0.3" />
      </svg>
    ),
    tags: ["CCTV Monitoring", "Incident Reporting", "Access Control", "Physical Security"],
  },
  {
    id: 3,
    label: "STAGE 03",
    title: "The Developer",
    period: "2022–Present",
    color: "var(--blue)",
    accent: "var(--blue)",
    narrative: `I taught myself to code during the pandemic and never stopped. What started as curiosity became a freelance practice: building full-stack applications for clients, managing Ubuntu servers, and learning the hard way that security has to be designed in, not bolted on.

I built ImmigrateX, a Next.js SaaS platform with authentication, RBAC, and payment integrations. I ran the server myself: UFW rules, SSL/TLS certs, PM2 process management, cron jobs. I configured monitoring and set up alerts when things broke at 3am.

Every OWASP vulnerability I studied became concrete when I was the one patching it. SQL injection stopped being a concept when I understood parameterized queries not as a best practice, but as the only correct way to talk to a database. That's the developer-to-defender bridge: knowing how attacks work because you've written the code they target.`,
    icon: (
      <svg viewBox="0 0 120 120" className="w-24 h-24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="15" y="25" width="90" height="70" rx="6" strokeOpacity="0.4" />
        <rect x="15" y="25" width="90" height="14" rx="6" strokeOpacity="0.4" />
        <circle cx="26" cy="32" r="3" strokeOpacity="0.5" />
        <circle cx="36" cy="32" r="3" strokeOpacity="0.5" />
        <circle cx="46" cy="32" r="3" strokeOpacity="0.5" />
        <path d="M30 58 L42 68 L30 78" strokeOpacity="0.6" />
        <path d="M55 78 L90 78" strokeOpacity="0.4" />
        <path d="M55 65 L80 65" strokeOpacity="0.3" />
        <path d="M55 52 L75 52" strokeOpacity="0.2" />
      </svg>
    ),
    tags: ["Next.js", "Ubuntu Linux", "RBAC", "OWASP", "SSL/TLS", "Python", "Full-Stack"],
  },
  {
    id: 4,
    label: "STAGE 04",
    title: "The Analyst",
    period: "2024–Present",
    color: "var(--gold)",
    accent: "var(--gold)",
    narrative: `This is where everything converged. ISC2 CC. Google Cybersecurity. CompTIA Security+. A home lab running on real hardware: a Windows Server 2022 domain controller, Ubuntu web server, Kali Linux attack box, Wazuh SIEM. Not a virtual sandbox. A production-grade simulation lab I built myself.

I'm running Wazuh agents on every endpoint. I write detection rules. I generate attack traffic and watch it hit the SIEM. I run Nmap, Hydra, and Gobuster against my own network and see exactly what the defender sees on the other side.

Security+ is earned. TryHackMe SOC Level 1 is 65% complete. Every lab builds the muscle memory for the role I'm targeting. I don't want to just study security. I want to practice it. The home lab is where that happens.`,
    icon: (
      <svg viewBox="0 0 120 120" className="w-24 h-24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="20" y="35" width="80" height="55" rx="4" strokeOpacity="0.4" />
        <path d="M20 48 L100 48" strokeOpacity="0.3" />
        <path d="M30 60 L45 55 L55 62 L70 52 L85 58" strokeOpacity="0.6" />
        <circle cx="55" cy="62" r="3" fill="currentColor" fillOpacity="0.4" />
        <circle cx="45" cy="55" r="2.5" fill="currentColor" fillOpacity="0.3" />
        <circle cx="70" cy="52" r="3.5" fill="currentColor" fillOpacity="0.5" />
        <path d="M30 75 L50 75" strokeOpacity="0.2" />
        <path d="M30 82 L70 82" strokeOpacity="0.15" />
        <rect x="20" y="25" width="30" height="15" rx="2" strokeOpacity="0.3" />
        <path d="M25 32.5 L35 32.5 M38 32.5 L44 32.5" strokeOpacity="0.4" />
      </svg>
    ),
    tags: ["Wazuh SIEM", "Active Directory", "Threat Detection", "ISC2 CC", "Security+", "Home Lab"],
  },
  {
    id: 5,
    label: "STAGE 05",
    title: "The SOC Analyst",
    period: "Target: 2025–2026",
    color: "var(--green)",
    accent: "var(--green)",
    narrative: `This is the role I'm building toward. SOC Analyst, Tier 1, at a company in Edmonton, or remote. Every cert I'm earning, every lab I'm running, every detection rule I'm writing is aimed at this exact outcome.

I'm not just studying the theory. I understand what a SOC shift looks like. I know how to triage an alert, how to write an escalation ticket, how to build a timeline from log data, and how to document an incident from detection to closure.

The path after that is mapped out: T2, Security Engineer, Security Architect. But right now, the mission is to land the first role, build real experience, and prove that the home lab, the certs, and the mindset that started in a kitchen and a guard booth actually matter at the SOC level.

I'm ready. This portfolio is the proof.`,
    icon: (
      <svg viewBox="0 0 120 120" className="w-24 h-24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="60" cy="60" r="35" strokeOpacity="0.3" />
        <circle cx="60" cy="60" r="25" strokeOpacity="0.4" />
        <circle cx="60" cy="60" r="5" strokeOpacity="0.8" />
        <line x1="60" y1="25" x2="60" y2="35" strokeOpacity="0.5" />
        <line x1="60" y1="85" x2="60" y2="95" strokeOpacity="0.5" />
        <line x1="25" y1="60" x2="35" y2="60" strokeOpacity="0.5" />
        <line x1="85" y1="60" x2="95" y2="60" strokeOpacity="0.5" />
        <path d="M60 60 L80 45" strokeWidth="2" strokeOpacity="0.7" />
        <path d="M60 60 L68 52" strokeWidth="1" strokeOpacity="0.5" />
        <circle cx="60" cy="60" r="3" fill="currentColor" fillOpacity="0.6" />
      </svg>
    ),
    tags: ["Alert Triage", "SIEM Operations", "Incident Response", "Blue Team", "Documentation"],
  },
];

function StageSection({ stage, index }: { stage: typeof STAGES[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      className="relative py-14 sm:py-16"
      style={{ borderTop: "2px solid var(--cf-ink)" }}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Grid-breaker: the target stamp sits on the section rule itself. */}
      {stage.id === 5 && (
        <Stamp
          tone="red"
          r={-3.7}
          s={1.03}
          o={0.91}
          bw={2.7}
          delay={250}
          className="absolute -top-4 right-4 sm:right-10 z-10 text-[11px]"
        >
          Target
        </Stamp>
      )}

      <div className="grid lg:grid-cols-[220px_1fr] gap-10 lg:gap-16 items-start">
        {/* File rail: icon in a bordered square, tags as plain mono chips */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-start gap-6"
        >
          <div
            className="w-[132px] h-[132px] flex items-center justify-center shrink-0"
            style={{
              border: "2px solid var(--cf-ink)",
              background: "var(--cf-paper-2)",
              color: "var(--cf-ink)",
            }}
          >
            {stage.icon}
          </div>

          <div className="flex flex-wrap gap-1.5 max-w-[220px]">
            {stage.tags.map((t) => (
              <span
                key={t}
                className="cf-mono text-[10px] px-2 py-1"
                style={{
                  color: "var(--cf-ink-soft)",
                  background: "transparent",
                  border: "1px solid var(--cf-faint)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Narrative */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="cf-kicker">
            {stage.label} · {stage.period}
          </p>
          <h2 className="cf-h2 mt-3 mb-6">{stage.title}</h2>
          <div className="space-y-4 max-w-3xl">
            {stage.narrative.split("\n\n").map((para, i) => (
              <p key={i} className="cf-body">
                {para}
              </p>
            ))}
          </div>
          <p className="cf-note mt-6">File section {index + 1} of {STAGES.length}</p>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default function AboutPage() {
  return (
    <div className="pb-24">
      <div className="cf-wrap">
        <PageHead
          kicker="About, subject history"
          title={
            <>
              The Story Behind<br />
              <span className="cf-u-red">The Analyst</span>
            </>
          }
          lede="From kitchen operations to security operations: five stages of a non-traditional path into cybersecurity, told in first person."
        />

        {/* File contents: the stage nav, kept as index rows with the same anchors */}
        <Reveal delay={0.05} className="mt-12 mb-4">
          <div className="cf-sec-head relative">
            <p className="cf-kicker">File contents</p>
            <h2 className="cf-h2 mt-2">Five Stages</h2>
            <Stamp
              tone="ink"
              r={2.6}
              s={0.98}
              o={0.88}
              bw={3.2}
              delay={300}
              className="absolute -top-5 right-2 sm:right-8 text-[11px]"
            >
              Subject history
            </Stamp>
          </div>
          <div>
            {STAGES.map((s) => (
              <a key={s.id} href={`#stage-${s.id}`} className="cf-idx-row">
                <span className="cf-idx-no">{s.label}</span>
                <span>
                  <span className="cf-idx-title">{s.title}</span>
                  <span className="cf-idx-desc">{s.period}</span>
                </span>
                <span className="cf-idx-arrow" aria-hidden="true">→</span>
              </a>
            ))}
          </div>
        </Reveal>

        {/* Stages */}
        {STAGES.map((stage, i) => (
          <div key={stage.id} id={`stage-${stage.id}`}>
            <StageSection stage={stage} index={i} />
          </div>
        ))}

        {/* CTA */}
        <Reveal delay={0.05}>
          <section className="py-16" style={{ borderTop: "2px solid var(--cf-ink)" }}>
            <p className="cf-kicker">What&apos;s next</p>
            <h2 className="cf-h2 mt-4 mb-4">
              Ready to see the <span className="cf-u-red">work</span>?
            </h2>
            <p className="cf-body max-w-2xl mb-8">
              The story is the context. The lab, the certs, and the projects are the evidence.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/portfolio" className="cf-btn">
                View Projects
              </Link>
              <a href="/resume.pdf" download="Raghav_Mahajan_Resume.pdf" className="cf-btn-ghost">
                <Download className="w-3.5 h-3.5" /> Download Resume
              </a>
              <Link href="/cybersecurity#home-lab" className="cf-btn-ghost">
                Explore the Home Lab
              </Link>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
