"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Shield, Code2, Server, Brain } from "lucide-react";
import { PageHead } from "@/components/casefile/PageHead";
import { Reveal } from "@/components/casefile/Reveal";
import { Stamp } from "@/components/casefile/Stamp";
import { Magnetic } from "@/components/casefile/Magnetic";
import { RailFill } from "@/components/casefile/RailFill";
import { EASE_OUT } from "@/components/casefile/motion";

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

type Category = "All" | "Security" | "Development" | "Infrastructure";

const PROJECTS: {
  id: number;
  featured?: boolean;
  title: string;
  subtitle: string;
  category: Category;
  status: string;
  statusColor: string;
  stack: string[];
  color: string;
  description: string;
  impact: string[];
  github?: string;
  live?: string;
  icon: typeof Shield;
}[] = [
  {
    id: 1,
    featured: true,
    title: "HomeLab Corp",
    subtitle: "Enterprise Security Simulation",
    category: "Security" as Category,
    status: "ACTIVE",
    statusColor: "var(--green)",
    stack: ["Windows Server 2022", "Ubuntu 22.04", "Wazuh", "Active Directory", "Kali Linux"],
    color: "var(--gold)",
    description: "A 4-node enterprise network simulation built on real hardware. DC-01 runs Active Directory with full domain infrastructure. WEB01 hosts production web services behind Nginx. KALI01 runs attack exercises that generate real telemetry. WAZUH01 aggregates all logs, runs detection rules, and fires alerts. This is not a virtual sandbox. It's a production-grade simulation environment.",
    impact: ["12+ custom Wazuh detection rules deployed", "SSH brute force detection with IP blocking", "Real-time file integrity monitoring on all endpoints", "GPO-managed security baseline across domain"],
    github: "https://github.com/HomeLab-Raghav",
    icon: Server,
  },
  {
    id: 2,
    featured: true,
    title: "SOC Training Platform",
    subtitle: "Cyberpunk Incident Response Simulator",
    category: "Security" as Category,
    status: "IN PROGRESS",
    statusColor: "var(--gold)",
    stack: ["Next.js 15", "React Three Fiber", "Zustand", "TypeScript", "Framer Motion"],
    color: "var(--blue)",
    description: "An immersive SOC analyst training platform with a cyberpunk aesthetic. Features real-time alert queues, an interactive network topology map in 3D, case management workflows, and SIEM log analysis exercises. Designed to simulate the experience of a Tier 1 SOC shift without needing access to enterprise tooling.",
    impact: ["3D network topology with Three.js", "Real-time alert simulation engine", "Case escalation workflow with state management", "Cyberpunk terminal UI with authentic SIEM aesthetics"],
    github: "https://github.com/HomeLab-Raghav",
    icon: Shield,
  },
  {
    id: 3,
    featured: true,
    title: "ImmigrateX",
    subtitle: "Immigration SaaS Platform",
    category: "Development" as Category,
    status: "SHIPPED",
    statusColor: "var(--green)",
    stack: ["Next.js", "PostgreSQL", "Stripe", "AWS S3", "Ubuntu Server"],
    color: "var(--blue)",
    description: "A full-stack SaaS platform for immigration professionals. Multi-tenant architecture with role-based access control, document management with encryption at rest, Stripe payment integration, and email automation. Deployed on Ubuntu with Nginx reverse proxy, SSL/TLS via Let's Encrypt, and PM2 process management.",
    impact: ["RBAC with Principle of Least Privilege", "Encrypted document storage on AWS S3", "Stripe payment integration with webhook handling", "Ubuntu server hardening: UFW, fail2ban, SSH key-only auth"],
    github: "https://github.com/HomeLab-Raghav",
    icon: Code2,
  },
  {
    id: 4,
    title: "RBAC Security App",
    subtitle: "Role-Based Access Control Demo",
    category: "Security" as Category,
    status: "SHIPPED",
    statusColor: "var(--green)",
    stack: ["Next.js", "NextAuth", "Prisma", "PostgreSQL"],
    color: "var(--gold)",
    description: "Production RBAC implementation demonstrating Principle of Least Privilege. Custom permission system with granular route-level and resource-level access control. Audit logging for all permission changes. Used as a reference implementation for client projects.",
    impact: ["Granular permission matrix with 6 roles", "Audit trail for all access control changes", "Parameterized queries throughout, zero raw SQL"],
    github: "https://github.com/HomeLab-Raghav",
    icon: Shield,
  },
  {
    id: 5,
    title: "Chattr",
    subtitle: "Real-Time Messaging Platform",
    category: "Development" as Category,
    status: "SHIPPED",
    statusColor: "var(--green)",
    stack: ["Next.js", "Socket.io", "Redis", "MongoDB", "Docker"],
    color: "var(--blue)",
    description: "Real-time messaging application with end-to-end encrypted channels, file sharing, and presence indicators. WebSocket server with Redis pub/sub for horizontal scaling. Security-first implementation: no message content logged on the server, ephemeral session keys.",
    impact: ["WebSocket authentication with JWT rotation", "Redis pub/sub for scalable real-time events", "No plaintext message storage, forward secrecy design"],
    github: "https://github.com/raghv-m/social_media_app",
    icon: Code2,
  },
  {
    id: 6,
    title: "Wazuh Detection Rules",
    subtitle: "Custom SIEM Rule Library",
    category: "Security" as Category,
    status: "ACTIVE",
    statusColor: "var(--green)",
    stack: ["Wazuh", "XML", "Python", "Ubuntu"],
    color: "var(--gold)",
    description: "Library of custom Wazuh detection rules authored for the home lab environment. Covers SSH brute force detection, Nmap scan detection, Hydra credential attack identification, web application attack patterns (Gobuster, Dirb), and Windows event log rules for domain controller anomalies.",
    impact: ["SSH brute force: detect after 5 failed attempts in 60s", "Nmap SYN scan detection via iptables integration", "Wazuh active response: automatic IP block on trigger"],
    github: "https://github.com/HomeLab-Raghav/docker-soc-lab",
    icon: Shield,
  },
  {
    id: 7,
    title: "3D Chess Engine",
    subtitle: "Three.js Browser Chess",
    category: "Development" as Category,
    status: "SHIPPED",
    statusColor: "var(--green)",
    stack: ["Three.js", "JavaScript", "WebGL", "Chess.js"],
    color: "var(--text-muted)",
    description: "Browser-based 3D chess game built with Three.js. Full chess rules with check/checkmate detection via chess.js. Smooth piece animations, interactive camera rotation, and legal move highlighting. Used as a deep-dive into 3D graphics and WebGL rendering, directly applicable to security visualization work.",
    impact: ["Custom 3D piece models in WebGL", "Full legal move validation engine", "Animated camera and piece movement system"],
    github: "https://github.com/raghv-m/chess",
    live: "https://chess-six-virid.vercel.app",
    icon: Brain,
  },
  {
    id: 8,
    title: "Security Log Parser",
    subtitle: "Python Log Analysis Tool",
    category: "Infrastructure" as Category,
    status: "ACTIVE",
    statusColor: "var(--green)",
    stack: ["Python 3", "pandas", "regex", "JSON"],
    color: "var(--blue)",
    description: "Python tool for parsing and normalizing security logs from multiple sources: Wazuh JSON exports, syslog, Windows Event XML. Outputs normalized CSV for import into analysis tools. Includes pattern matching for common attack signatures and timeline reconstruction for incident investigations.",
    impact: ["Multi-format log normalization pipeline", "Attack pattern signature matching library", "Timeline reconstruction for IR exercises"],
    github: "https://github.com/HomeLab-Raghav",
    icon: Code2,
  },
  {
    id: 12,
    featured: true,
    title: "Vic Cameleers",
    subtitle: "Removalist Company Website, Melbourne, Australia",
    category: "Development" as Category,
    status: "LIVE",
    statusColor: "var(--green)",
    stack: ["Design & Build", "Business Website", "Responsive", "Enquiry Path"],
    color: "var(--gold)",
    description: "A full website for a removals company in Cranbourne, Melbourne, designed and built end to end: what they move, where they cover, and a direct way for customers to reach the crew. My first international client, delivered from Edmonton to Australia, and still live.",
    impact: ["Live at viccameleers.com", "First international client (Australia)", "Designed and built end to end, solo", "Direct customer enquiry path, no middleman"],
    live: "https://viccameleers.com",
    icon: Code2,
  },
  {
    id: 9,
    title: "raghv.dev Portfolio",
    subtitle: "This Site: Premium Cybersecurity Brand",
    category: "Development" as Category,
    status: "SHIPPED",
    statusColor: "var(--green)",
    stack: ["Next.js 15", "React Three Fiber", "Framer Motion", "Prisma", "NextAuth"],
    color: "var(--gold)",
    description: "This portfolio, built with security as the primary requirement. Full security hardening: CSP headers, CSRF protection on forms, rate limiting (3 contacts/hour), IP hashing before storage, honeypot field, no raw IPs ever stored. The current design is a brutalist system in paper, ink and red, with an animated terminal HUD hero, scroll-driven reveals, and a procedural avatar that follows the reader across every page.",
    impact: ["CSP + HSTS + X-Frame-Options security headers", "CSRF tokens + Zod validation on all API routes", "Rate limiting with RateLimiterMemory (3/hour contact)", "IP hashing via salted hash, never raw IPs in DB"],
    github: "https://github.com/raghv-m/raghv-portfolio",
    icon: Shield,
  },
  {
    id: 10,
    title: "Network Scanner Script",
    subtitle: "Python Nmap Automation",
    category: "Infrastructure" as Category,
    status: "ACTIVE",
    statusColor: "var(--green)",
    stack: ["Python 3", "python-nmap", "JSON", "SQLite"],
    color: "var(--text-muted)",
    description: "Python wrapper around nmap that automates network discovery scans in the lab environment, stores results in SQLite, and diffs against previous scans to identify new hosts, open ports, or changed service versions. Used to maintain an accurate asset inventory of the home lab network.",
    impact: ["Automated scan scheduling via cron", "Change detection against historical scan baseline", "JSON report generation for Wazuh integration"],
    github: "https://github.com/HomeLab-Raghav",
    icon: Server,
  },
  {
    id: 11,
    title: "AD Security Baseline",
    subtitle: "Windows GPO Hardening Pack",
    category: "Infrastructure" as Category,
    status: "ACTIVE",
    statusColor: "var(--green)",
    stack: ["Windows Server 2022", "PowerShell", "Group Policy", "Wazuh"],
    color: "var(--gold)",
    description: "Group Policy Objects for hardening the home lab domain (HOMELAB.CORP). Implements CIS Benchmark recommendations: account lockout policies, password complexity, audit policy, SMB signing enforcement, LLMNR disable, PowerShell logging, and Windows Event Forwarding to Wazuh. All GPO settings documented and version-controlled.",
    impact: ["CIS Benchmark L1 compliance for domain accounts", "PowerShell ScriptBlock logging for all hosts", "Windows Event Forwarding → Wazuh alert pipeline"],
    github: "https://github.com/HomeLab-Raghav",
    icon: Shield,
  },
];

const CATEGORIES: Category[] = ["All", "Security", "Development", "Infrastructure"];

/* Status stamps stay inside the poster palette: red for live/active work,
   the muted stamp tone for in-progress, ink for shipped. The label text
   carries the meaning, never a green. */
const STATUS_TONE: Record<string, "red" | "gold" | "ink"> = {
  ACTIVE: "red",
  LIVE: "red",
  "IN PROGRESS": "gold",
  SHIPPED: "ink",
};

const STAMP_R = [-4.5, -1.6, 2.3, -5.8, 0.7, -3.2, 1.8, -6, -2.7, 2.9, -0.9];
const STAMP_S = [0.97, 1.05, 0.93, 1.02, 0.95, 1.08, 0.94, 1.0, 1.04, 0.92, 1.06];
const STAMP_O = [0.9, 0.85, 0.94, 0.83, 0.92, 0.88, 0.96, 0.84, 0.91, 0.87, 0.93];
const STAMP_BW = [2.5, 3.1, 2.1, 3.4, 2.3, 2.8, 3.3, 2.0, 2.7, 3.0, 2.4];

function LinkRow({ project, big = false }: { project: typeof PROJECTS[0]; big?: boolean }) {
  const cls = big ? "cf-mono cf-fs-label" : "cf-mono cf-fs-data";
  return (
    <>
      {project.live && (
        <a href={project.live} target="_blank" rel="noopener noreferrer" className={`cf-ulink ${cls}`}>
          ↗ Live site
        </a>
      )}
      {project.github && (
        <a href={project.github} target="_blank" rel="noopener noreferrer" className={`cf-ulink flex items-center gap-1.5 ${cls}`}>
          <GithubIcon /> GitHub
        </a>
      )}
    </>
  );
}

/* Vic Cameleers, pulled off the rail and given the featured panel: the one
   client site that is live on the public internet, with its link loud. */
function FeaturedVic({ project }: { project: typeof PROJECTS[0] }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, ease: EASE_OUT }}
      style={{
        border: "3px solid var(--cf-ink)",
        background: "var(--cf-paper-2)",
        boxShadow: "10px 10px 0 var(--cf-shadow)",
      }}
    >
      <div style={{ height: 5, background: "var(--cf-red)" }} />
      <div className="p-6 sm:p-8 grid lg:grid-cols-[1fr_320px] gap-8">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span
              className="cf-mono cf-fs-data tracking-widest px-2 py-0.5"
              style={{ background: "var(--cf-red)", color: "var(--cf-paper)" }}
            >
              FEATURED — CLIENT WORK
            </span>
            <Stamp tone="red" r={-2.7} s={1.0} o={0.92} bw={2.7} delay={150} className="cf-fs-data">
              {project.status}
            </Stamp>
          </div>
          <h2 className="cf-display text-3xl sm:text-4xl text-[var(--cf-ink)] leading-none">
            {project.title}
          </h2>
          <p className="cf-mono cf-fs-label text-[var(--cf-muted)] mt-2">{project.subtitle}</p>
          <p className="text-[var(--cf-ink-soft)] text-sm leading-relaxed mt-4" style={{ maxWidth: "62ch" }}>
            {project.description}
          </p>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mt-5">
            {project.impact.map((i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 mt-1.5 shrink-0" style={{ background: "var(--cf-red)" }} />
                <p className="cf-mono cf-fs-data text-[var(--cf-ink-soft)]">{i}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1 mt-5">
            {project.stack.map((s) => <span key={s} className="tag">{s}</span>)}
          </div>
        </div>

        {/* The live link, set as a red block the size of a billboard corner */}
        <div className="flex flex-col justify-center gap-4">
          <a
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-5 group"
            style={{ background: "var(--cf-red)", boxShadow: "6px 6px 0 var(--cf-ink)" }}
          >
            <span className="cf-mono cf-fs-data tracking-widest block" style={{ color: "var(--cf-paper)", opacity: 0.8 }}>
              LIVE PREVIEW
            </span>
            <span className="cf-display text-2xl block mt-1 group-hover:underline" style={{ color: "var(--cf-paper)" }}>
              viccameleers.com ↗
            </span>
            <span className="cf-mono cf-fs-data block mt-2" style={{ color: "var(--cf-paper)", opacity: 0.8 }}>
              REMOVALS · CRANBOURNE / MELBOURNE, AU
            </span>
          </a>
          <p className="cf-mono cf-fs-data text-[var(--cf-muted)] leading-relaxed">
            First international client. Designed, built and shipped solo from
            Edmonton, still live and taking enquiries.
          </p>
        </div>
      </div>
    </motion.article>
  );
}

/* One project on the storyboard rail. The project data carries no dates, so
   the rail column keys on the case number instead of inventing years. */
function ProjectFrame({ project, index }: { project: typeof PROJECTS[0]; index: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      className="cf-tl-item"
      style={{ paddingBottom: 30 }}
    >
      <motion.span
        className="cf-tl-node"
        data-hot={project.featured ? "true" : undefined}
        aria-hidden="true"
        initial={reduce ? false : { scale: 0.92, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 380, damping: 26, delay: 0.12 }}
      />

      <div className="cf-tl-date">
        <p className="cf-display" style={{ fontSize: 30, lineHeight: 1, color: "var(--cf-ink)" }}>
          {String(project.id).padStart(2, "0")}
        </p>
        <p className="cf-mono cf-fs-data mt-2" style={{ color: "var(--cf-red)" }}>
          CASE {String(project.id).padStart(2, "0")}
        </p>
        <p className="cf-mono cf-fs-data text-[var(--cf-muted)] mt-1">{project.category.toUpperCase()}</p>
        <p className="cf-mono cf-fs-data text-[var(--cf-muted)] mt-1">{project.status}</p>
      </div>

      <article
        className="cf-panel group relative"
        data-hot={project.featured ? "true" : undefined}
        style={{
          background: "var(--cf-paper-2)",
          border: project.featured ? "3px solid var(--cf-ink)" : "2px solid var(--cf-ink)",
        }}
      >
        <div style={{ height: 4, background: project.color }} />
        <div className="p-6">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {project.featured && (
                  <span className="cf-mono cf-fs-data tracking-widest px-1.5 py-0.5"
                    style={{ color: "var(--cf-gold)", border: "1px solid var(--cf-gold)" }}>
                    FEATURED
                  </span>
                )}
                <Stamp
                  tone={STATUS_TONE[project.status] ?? "ink"}
                  r={STAMP_R[index % STAMP_R.length]}
                  s={STAMP_S[index % STAMP_S.length]}
                  o={STAMP_O[index % STAMP_O.length]}
                  bw={STAMP_BW[index % STAMP_BW.length]}
                  delay={index * 60}
                  className="cf-fs-data"
                >
                  {project.status}
                </Stamp>
              </div>
              <h2 className="cf-display text-xl text-[var(--cf-ink)] group-hover:text-[var(--cf-red)] transition-colors">
                {project.title}
              </h2>
              <p className="cf-mono cf-fs-data text-[var(--cf-muted)]">{project.subtitle}</p>
            </div>
            <div
              className="w-9 h-9 flex items-center justify-center shrink-0"
              style={{ background: "var(--cf-paper)", border: "1px solid var(--cf-ink)" }}
            >
              <project.icon className="w-4 h-4" style={{ color: project.color }} />
            </div>
          </div>

          <p className="text-[var(--cf-ink-soft)] text-xs leading-relaxed mb-4" style={{ maxWidth: "78ch" }}>
            {project.description}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-2 mb-4">
            {project.impact.map((i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 mt-1.5 shrink-0" style={{ background: "var(--cf-red)" }} />
                <p className="cf-mono cf-fs-data text-[var(--cf-ink-soft)]">{i}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-1 mb-4">
            {project.stack.map((s) => <span key={s} className="tag">{s}</span>)}
          </div>

          <div className="flex items-center gap-3 pt-3" style={{ borderTop: "1px solid var(--cf-faint)" }}>
            <LinkRow project={project} />
            <div className="flex-1" />
            <span className="cf-mono cf-fs-data" style={{ color: "var(--cf-red)" }}>
              # {String(project.id).padStart(2, "0")}
            </span>
          </div>
        </div>
      </article>
    </motion.div>
  );
}

export default function ProjectsPage() {
  const [filter, setFilter] = useState<Category>("All");

  const vic = PROJECTS.find((p) => p.title === "Vic Cameleers")!;
  const showVic = filter === "All" || filter === vic.category;
  const rail = PROJECTS.filter((p) => p.id !== vic.id && (filter === "All" || p.category === filter));

  return (
    <div className="pb-32">
      <div className="cf-wrap">
        <PageHead
          kicker="Projects"
          title={<>Operational <span className="cf-u-red">Evidence</span></>}
          lede="12 projects spanning security engineering, full-stack development, and infrastructure operations, laid out as a storyboard: the live client site up top, then every case on one rail. Every project carries a working link out — live preview where one exists, source code where it does not."
        >
          <div style={{ marginTop: 26 }}>
            <Stamp tone="red" r={-4.8} s={1.03} o={0.9} bw={2.9} delay={250}>
              12 cases filed
            </Stamp>
          </div>
        </PageHead>

        {/* Category filter */}
        <Reveal delay={0.05}>
          <div className="flex gap-2 mb-10 flex-wrap" style={{ marginTop: 36 }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                aria-pressed={filter === cat}
                className="cf-chip cf-mono cf-fs-data"
                style={filter === cat
                  ? { background: "var(--cf-ink)", color: "var(--cf-paper)", borderColor: "var(--cf-ink)" }
                  : undefined}
              >
                {cat}
                <span className="ml-2 opacity-50">
                  {cat === "All" ? PROJECTS.length : PROJECTS.filter((p) => p.category === cat).length}
                </span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* Featured: the live client site */}
        {showVic && (
          <Reveal delay={0.05} className="mb-14">
            <FeaturedVic project={vic} />
          </Reveal>
        )}

        {/* Storyboard rail: every remaining case on one line, in file order */}
        <div className="cf-tl" key={filter}>
          <RailFill />
          {rail.map((project, i) => (
            <ProjectFrame key={project.id} project={project} index={i} />
          ))}
        </div>

        <Reveal className="mt-14">
          <div className="flex flex-wrap items-center justify-between gap-4 p-6" style={{ border: "2px solid var(--cf-ink)", background: "var(--cf-paper-2)" }}>
            <p className="cf-body" style={{ maxWidth: "52ch" }}>
              Want a site like one of these? The estimate takes two minutes and shows my price next to the market rate.
            </p>
            <Magnetic strength={18}>
              <Link href="/estimate" className="cf-btn">Start an estimate</Link>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
