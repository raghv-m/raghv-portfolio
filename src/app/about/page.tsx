"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";

const STAGES = [
  {
    id: 1,
    label: "STAGE 01",
    title: "The Kitchen",
    period: "2022–2025",
    color: "var(--text-muted)",
    accent: "#8a6914",
    narrative: `I learned how to operate under pressure long before I ever opened a terminal. Running a kitchen line during Friday dinner rush — orders stacking, tickets flying, three timers in your head at once — that's where operational discipline gets hard-wired.

I managed kitchen staff at Leopold's and worked the line at Boston Pizza, Earls, and St. Louis. The job wasn't glamorous, but it taught me something no certification can: how to stay calm when everything is on fire, document what happened, and figure out the root cause later.

I didn't know it then, but I was already developing the incident response mindset. In a SOC, an alert fires — you triage, escalate, and write the post-mortem. In a kitchen, an order goes wrong — you fix it fast, you communicate clearly, you document why. Same mental model. Different domain.`,
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
    narrative: `Getting my Alberta Security Guard license was the first time I wore a professional identity I could build on. Impact Security, ADESA Auction, Covenant Health — I was monitoring systems, managing access, and writing incident reports. The work was physical, but the thinking was analytical.

I started noticing the parallels immediately. CCTV monitoring is log monitoring. Access control is IAM. Incident escalation is SOC escalation. The language was different but the mechanics were identical.

The 5 W's framework I used to write incident reports — Who, What, When, Where, Why — is the same structure used in digital IR documentation. I was doing security operations before I knew what that phrase meant in a technical context. That realization made me want to go deeper.`,
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
    narrative: `I taught myself to code during the pandemic and never stopped. What started as curiosity became a freelance practice — building full-stack applications for clients, managing Ubuntu servers, and learning the hard way that security has to be designed in, not bolted on.

I built ImmigrateX, a Next.js SaaS platform with authentication, RBAC, and payment integrations. I ran the server — UFW rules, SSL/TLS certs, PM2 process management, cron jobs. I configured monitoring and set up alerts when things broke at 3am.

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
    narrative: `This is where everything converged. ISC2 CC. Google Cybersecurity. CompTIA Security+. A home lab running on real hardware — Windows Server 2022 domain controller, Ubuntu web server, Kali Linux attack box, Wazuh SIEM. Not a virtual sandbox. A production-grade simulation lab I built myself.

I'm running Wazuh agents on every endpoint. I write detection rules. I generate attack traffic and watch it hit the SIEM. I run Nmap, Hydra, and Gobuster against my own network and see exactly what the defender sees on the other side.

Security+ is earned. TryHackMe SOC Level 1 is 65% complete. Every lab builds the muscle memory for the role I'm targeting. I don't want to study security — I want to practice it. The home lab is where that happens.`,
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
    narrative: `This is the role I'm building toward. SOC Analyst — Tier 1 at a company in Edmonton, or remote. Every cert I'm earning, every lab I'm running, every detection rule I'm writing is aimed at this exact outcome.

I'm not just studying the theory. I understand what a SOC shift looks like. I know how to triage an alert, how to write an escalation ticket, how to build a timeline from log data, and how to document an incident from detection to closure.

The path after that is mapped out — T2, Security Engineer, Security Architect. But right now, the mission is to land the first role, build real experience, and prove that the home lab, the certs, and the mindset that started in a kitchen and a guard booth actually matter at the SOC level.

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
      className="min-h-screen flex items-center py-24"
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className={`grid lg:grid-cols-2 gap-16 items-center ${index % 2 === 1 ? "lg:grid-flow-col-dense" : ""}`}>
          {/* Visual side */}
          <motion.div
            initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2 }}
            className={`flex flex-col items-center gap-6 ${index % 2 === 1 ? "lg:col-start-2" : ""}`}
          >
            {/* Stage number */}
            <div className="relative">
              <div
                className="w-40 h-40 rounded-full flex items-center justify-center relative"
                style={{
                  background: `radial-gradient(circle, ${stage.accent}08 0%, transparent 70%)`,
                  border: `1px solid ${stage.accent}20`,
                }}
              >
                <div style={{ color: stage.accent }}>
                  {stage.icon}
                </div>
                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: `1px solid ${stage.accent}40` }}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.1, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <div
                className="absolute -top-2 -right-2 font-mono text-[10px] tracking-widest px-2 py-0.5 rounded"
                style={{ background: `${stage.accent}15`, color: stage.accent, border: `1px solid ${stage.accent}30` }}
              >
                {stage.label}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 justify-center max-w-xs">
              {stage.tags.map((t) => (
                <span
                  key={t}
                  className="font-mono text-[9px] px-2 py-0.5 rounded"
                  style={{ color: stage.accent, background: `${stage.accent}10`, border: `1px solid ${stage.accent}20` }}
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: index % 2 === 0 ? 40 : -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.3 }}
            className={index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}
          >
            <p className="font-mono text-[10px] tracking-[0.3em] mb-2" style={{ color: stage.accent }}>
              {stage.period}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[var(--text)] mb-6">
              {stage.title}
            </h2>
            <div className="space-y-4">
              {stage.narrative.split("\n\n").map((para, i) => (
                <p key={i} className="text-[var(--text-muted)] leading-relaxed text-[15px]">
                  {para}
                </p>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Divider line (not on last) */}
        {index < STAGES.length - 1 && (
          <div className="mt-20 flex items-center gap-4">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="font-mono text-[9px] text-[#333] tracking-widest">↓</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>
        )}
      </div>
    </motion.section>
  );
}

export default function AboutPage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section ref={heroRef} className="pt-32 pb-16 px-6 text-center section relative overflow-hidden">
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(212,160,23,0.04) 0%, transparent 70%)" }} />
        </motion.div>
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="font-mono text-[10px] tracking-[0.35em] text-[var(--gold-muted)] mb-4">ABOUT</p>
            <h1 className="font-display text-5xl sm:text-6xl font-bold mb-6 leading-[1.05]">
              The Story Behind<br />
              <span className="gradient-gold">The Analyst</span>
            </h1>
            <p className="text-[var(--text-muted)] text-lg leading-relaxed mb-8">
              From kitchen operations to security operations — five stages of a non-traditional path
              into cybersecurity, told in first person.
            </p>
            <div className="glow-line mb-12 max-w-24 mx-auto" />
          </motion.div>

          {/* Stage nav */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {STAGES.map((s) => (
              <a
                key={s.id}
                href={`#stage-${s.id}`}
                className="font-mono text-[10px] px-3 py-1.5 rounded-full transition-all hover:border-[rgba(212,160,23,0.3)]"
                style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
              >
                {s.label} · {s.title}
              </a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stages */}
      {STAGES.map((stage, i) => (
        <div key={stage.id} id={`stage-${stage.id}`}>
          <StageSection stage={stage} index={i} />
        </div>
      ))}

      {/* CTA */}
      <section className="py-24 px-6 border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--gold-muted)] mb-4">WHAT&apos;S NEXT</p>
            <h2 className="font-display text-3xl font-bold mb-4">
              Ready to see the <span className="gradient-gold">work</span>?
            </h2>
            <p className="text-[var(--text-muted)] mb-8">
              The story is the context. The lab, the certs, and the projects are the evidence.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/projects" className="btn-gold">
                View Projects <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href="/resume.pdf"
                download="Raghav_Mahajan_Resume.pdf"
                className="btn-ghost flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Download Resume
              </a>
              <Link href="/homelab" className="btn-ghost">
                Explore the Home Lab
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
