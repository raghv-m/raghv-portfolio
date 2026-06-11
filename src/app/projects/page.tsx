"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Code2, Server, Brain } from "lucide-react";
import dynamic from "next/dynamic";
const SparklesCore = dynamic(
  () => import("@/components/ui/sparkles").then((m) => m.SparklesCore),
  { ssr: false }
);
const SmokeBackground = dynamic(
  () => import("@/components/ui/spooky-smoke-animation").then((m) => m.SmokeBackground),
  { ssr: false }
);

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

type Category = "All" | "Security" | "Development" | "Infrastructure";

const PROJECTS = [
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
    description: "A 4-node enterprise network simulation built on real hardware. DC-01 runs Active Directory with full domain infrastructure. WEB01 hosts production web services behind Nginx. KALI01 runs attack exercises that generate real telemetry. WAZUH01 aggregates all logs, runs detection rules, and fires alerts. This is not a virtual sandbox — it's a production-grade simulation environment.",
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
    impact: ["Granular permission matrix with 6 roles", "Audit trail for all access control changes", "Parameterized queries throughout — zero raw SQL"],
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
    description: "Real-time messaging application with end-to-end encrypted channels, file sharing, and presence indicators. WebSocket server with Redis pub/sub for horizontal scaling. Security-first implementation — no message content logged on the server, ephemeral session keys.",
    impact: ["WebSocket authentication with JWT rotation", "Redis pub/sub for scalable real-time events", "No plaintext message storage — forward secrecy design"],
    github: "https://github.com/HomeLab-Raghav",
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
    impact: ["SSH brute force: detect after 5 failed attempts in 60s", "Nmap SYN scan detection via iptables integration", "Wazuh active response — automatic IP block on trigger"],
    github: "https://github.com/HomeLab-Raghav",
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
    description: "Browser-based 3D chess game built with Three.js. Full chess rules with check/checkmate detection via chess.js. Smooth piece animations, interactive camera rotation, and legal move highlighting. Used as a deep-dive into 3D graphics and WebGL rendering — directly applicable to security visualization work.",
    impact: ["Custom 3D piece models in WebGL", "Full legal move validation engine", "Animated camera and piece movement system"],
    github: "https://github.com/HomeLab-Raghav",
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
    description: "Python tool for parsing and normalizing security logs from multiple sources — Wazuh JSON exports, syslog, Windows Event XML. Outputs normalized CSV for import into analysis tools. Includes pattern matching for common attack signatures and timeline reconstruction for incident investigations.",
    impact: ["Multi-format log normalization pipeline", "Attack pattern signature matching library", "Timeline reconstruction for IR exercises"],
    github: "https://github.com/HomeLab-Raghav",
    icon: Code2,
  },
  {
    id: 9,
    title: "raghv.dev Portfolio",
    subtitle: "This Site — Premium Cybersecurity Brand",
    category: "Development" as Category,
    status: "SHIPPED",
    statusColor: "var(--green)",
    stack: ["Next.js 15", "React Three Fiber", "Framer Motion", "Prisma", "NextAuth"],
    color: "var(--gold)",
    description: "This portfolio — built with security and premium UX as primary requirements. Full security hardening: CSP headers, CSRF protection on forms, rate limiting (3 contacts/hour), IP hashing before storage, honeypot field, no raw IPs ever stored. R3F 3D particle field, custom gold cursor, grain overlay, and animated terminal.",
    impact: ["CSP + HSTS + X-Frame-Options security headers", "CSRF tokens + Zod validation on all API routes", "Rate limiting with RateLimiterMemory (3/hour contact)", "IP hashing via salted hash — never raw IPs in DB"],
    github: "https://github.com/HomeLab-Raghav",
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

function ProjectCard({ project, index }: { project: typeof PROJECTS[0]; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className={`glass rounded-xl overflow-hidden card-lift group ${project.featured ? "ring-1 ring-[rgba(212,160,23,0.15)]" : ""}`}
    >
      {/* Card header stripe */}
      <div className="h-1 w-full" style={{ background: project.color }} />

      <div className="p-6">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {project.featured && (
                <span className="font-mono text-[8px] tracking-widest text-[var(--gold)] bg-[rgba(212,160,23,0.1)] border border-[rgba(212,160,23,0.2)] px-1.5 py-0.5 rounded">
                  FEATURED
                </span>
              )}
              <span
                className="font-mono text-[8px] tracking-widest px-1.5 py-0.5 rounded"
                style={{ color: project.statusColor, background: `${project.statusColor}10`, border: `1px solid ${project.statusColor}25` }}
              >
                {project.status}
              </span>
            </div>
            <h3 className="font-display text-base font-bold text-[var(--text)] group-hover:text-[var(--gold)] transition-colors">
              {project.title}
            </h3>
            <p className="font-mono text-[10px] text-[var(--text-muted)]">{project.subtitle}</p>
          </div>
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${project.color}10`, border: `1px solid ${project.color}20` }}
          >
            <project.icon className="w-4 h-4" style={{ color: project.color }} />
          </div>
        </div>

        <p className="text-[var(--text-muted)] text-xs leading-relaxed mb-4">{project.description}</p>

        <div className="space-y-2 mb-4">
          {project.impact.slice(0, 3).map((i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: project.color }} />
              <p className="font-mono text-[9px] text-[var(--text-muted)]">{i}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {project.stack.map((s) => <span key={s} className="tag">{s}</span>)}
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-[var(--border)]">
          <a href={project.github} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors font-mono text-[9px]">
            <GithubIcon /> GitHub
          </a>
          <div className="flex-1" />
          <span className="font-mono text-[9px] text-[#333]"># {String(project.id).padStart(2, "0")}</span>
        </div>
      </div>
    </motion.article>
  );
}

export default function ProjectsPage() {
  const [filter, setFilter] = useState<Category>("All");

  const filtered = filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen pb-32">
      {/* Smoke + stars hero with bottom fade */}
      <div className="relative pt-24 pb-16 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            maskImage: "linear-gradient(to bottom, black 0%, black 58%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 58%, transparent 100%)",
          }}
        >
          <div className="absolute inset-0 opacity-40">
            <SmokeBackground smokeColor="#d4a017" />
          </div>
          <div className="absolute inset-0">
            <SparklesCore
              background="transparent"
              minSize={0.3}
              maxSize={1.2}
              particleDensity={45}
              particleColor="#d4a017"
              speed={0.4}
              className="w-full h-full"
            />
          </div>
        </div>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.95) 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-2">
            <p className="font-mono text-[10px] tracking-[0.35em] text-[var(--gold-muted)] mb-2">PROJECTS</p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              Operational <span className="gradient-gold">Evidence</span>
            </h1>
            <p className="text-[var(--text-muted)] max-w-xl leading-relaxed">
              11 projects spanning security engineering, full-stack development, and infrastructure operations.
              Built in the home lab, shipped to production, and documented in detail.
            </p>
            <div className="glow-line mt-6 max-w-24" />
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">

        {/* Category filter */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-10 flex-wrap"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`font-mono text-[10px] px-4 py-2 rounded-lg transition-all ${
                filter === cat
                  ? "bg-[var(--gold)] text-[var(--bg)]"
                  : "glass text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {cat}
              <span className="ml-2 opacity-50">
                {cat === "All" ? PROJECTS.length : PROJECTS.filter((p) => p.category === cat).length}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
