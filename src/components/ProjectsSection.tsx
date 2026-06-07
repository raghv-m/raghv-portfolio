"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ExternalLink, Shield, ShieldAlert, Lock, ChevronDown } from "lucide-react";

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

interface Project {
  id: number;
  name: string;
  type: string;
  description: string;
  securityTag: string;
  securityColor: string;
  stack: string[];
  defenseAngle: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  logs: string[];
  github?: string;
  live?: string;
}

const PROJECTS: Project[] = [
  {
    id: 1,
    name: "EZ Plumbing Inc",
    type: "Business Web App",
    description: "Full-stack business website with booking system, service catalog, and contact management for a local plumbing company.",
    securityTag: "INPUT VALIDATION",
    securityColor: "#00d4ff",
    stack: ["Next.js", "TypeScript", "Tailwind", "Vercel"],
    defenseAngle: "Form input sanitization, CSRF protection on booking forms, rate limiting on contact submissions.",
    severity: "LOW",
    logs: [
      "[INFO] Contact form submission | IP: 207.x.x.x | Input sanitized | PASS",
      "[INFO] Booking request | User-Agent validated | No injection detected",
      "[INFO] Rate limit check | /api/contact | 2/10 requests | ALLOW",
    ],
  },
  {
    id: 2,
    name: "Mr. Rooter Edmonton",
    type: "Service Platform",
    description: "Web platform for plumbing service company with scheduling, service area mapping, and lead capture.",
    securityTag: "API SECURITY",
    securityColor: "#0066ff",
    stack: ["React", "Node.js", "MongoDB", "Express"],
    defenseAngle: "API key protection, CORS policy enforcement, environment variable security, no sensitive data in client bundle.",
    severity: "LOW",
    logs: [
      "[INFO] API request | /api/leads | Auth header: valid | 200 OK",
      "[INFO] CORS preflight | Origin: mrrootoredmonton.ca | ALLOWED",
      "[INFO] Env config check | No secrets exposed in bundle | PASS",
    ],
  },
  {
    id: 3,
    name: "Fatima's Kitchen",
    type: "Restaurant Platform",
    description: "Online ordering and menu management platform for a local restaurant with payment integration.",
    securityTag: "PAYMENT SECURITY",
    securityColor: "#7c3aed",
    stack: ["Next.js", "Stripe", "Prisma", "PostgreSQL"],
    defenseAngle: "Stripe-hosted checkout (no card data touches server), PCI compliance by design, SQL injection prevention via Prisma ORM.",
    severity: "MEDIUM",
    logs: [
      "[INFO] Checkout session | Stripe hosted | PCI DSS compliant | PASS",
      "[INFO] DB query via ORM | Parameterized | SQLi risk: NONE",
      "[WARN] Direct DB access attempt blocked | Prisma middleware | DENY",
    ],
  },
  {
    id: 4,
    name: "ImmigrateX",
    type: "Legal Services App",
    description: "Immigration consulting platform with document management, case tracking, and secure client communication.",
    securityTag: "DATA PRIVACY",
    securityColor: "#ff3366",
    stack: ["Next.js", "Supabase", "TypeScript", "Tailwind"],
    defenseAngle: "Row-level security (RLS) in Supabase, encrypted file storage, auth-gated routes, PII handling with minimal data exposure.",
    severity: "HIGH",
    logs: [
      "[ALERT] Unauthenticated route access attempt | /case/:id | BLOCKED",
      "[INFO] RLS policy active | User can only read own cases | ENFORCED",
      "[INFO] File upload scan | Allowed types only | Malware scan: CLEAN",
      "[INFO] PII data access | Logged | User: client_4892 | Authorized",
    ],
  },
  {
    id: 5,
    name: "Chattr",
    type: "Real-time Chat App",
    description: "Real-time messaging application with channels, direct messages, and user presence indicators.",
    securityTag: "AUTH + WS SECURITY",
    securityColor: "#00d4ff",
    stack: ["Next.js", "Socket.io", "Redis", "JWT"],
    defenseAngle: "JWT-based auth with refresh rotation, WebSocket origin validation, message content sanitization to prevent XSS via chat.",
    severity: "HIGH",
    logs: [
      "[WARN] XSS payload detected in message | <script>alert(1)</script> | SANITIZED",
      "[INFO] WebSocket upgrade | Origin validated | Token verified | ALLOW",
      "[INFO] JWT refresh rotation | Old token invalidated | New issued",
      "[ALERT] Rapid message flood | User: u_1042 | Rate limit triggered | THROTTLE",
    ],
  },
  {
    id: 6,
    name: "3D Chess",
    type: "Browser Game",
    description: "Three-dimensional chess game built with Three.js, featuring full 3D rendering and move validation engine.",
    securityTag: "CLIENT INTEGRITY",
    securityColor: "#00ff88",
    stack: ["Three.js", "React", "TypeScript", "WebGL"],
    defenseAngle: "Client-side game logic isolation, no server-side state manipulation vectors, WebGL context security.",
    severity: "LOW",
    logs: [
      "[INFO] WebGL context initialized | Secure | No data exfiltration risk",
      "[INFO] Game state | Client-side only | No sensitive data processed",
      "[INFO] Move validation | Local engine | Integrity: VERIFIED",
    ],
  },
  {
    id: 7,
    name: "RBAC Security App",
    type: "Security System",
    description: "Role-Based Access Control application demonstrating enterprise permission management, audit logging, and admin dashboards.",
    securityTag: "ACCESS CONTROL",
    securityColor: "#ff3366",
    stack: ["Next.js", "PostgreSQL", "NextAuth", "Prisma"],
    defenseAngle: "Principle of least privilege enforced, audit log of all privilege changes, session management with secure cookies, admin actions require re-auth.",
    severity: "CRITICAL",
    logs: [
      "[CRITICAL] Privilege escalation attempt | User: u_204 | BLOCKED",
      "[INFO] Role assignment | admin → viewer | Logged | Actor: admin_1",
      "[ALERT] Admin action | Delete user | Re-auth required | CHALLENGE ISSUED",
      "[INFO] Audit log entry | Permission change | Immutable | WRITTEN",
      "[INFO] Session cookie | HttpOnly: true | Secure: true | SameSite: Strict",
    ],
  },
  {
    id: 8,
    name: "Portfolio Website",
    type: "Security Portfolio",
    description: "This site — a cybersecurity-focused portfolio designed as a SOC operations dashboard. Built to demonstrate security awareness in design and development.",
    securityTag: "SECURE BY DESIGN",
    securityColor: "#7c3aed",
    stack: ["Next.js 15", "Framer Motion", "TypeScript", "Tailwind"],
    defenseAngle: "CSP headers, no third-party scripts, minimal attack surface, HTTPS enforced, no tracking or analytics data collection.",
    severity: "LOW",
    logs: [
      "[INFO] CSP header | default-src 'self' | Active | ENFORCED",
      "[INFO] HTTPS redirect | HTTP → HTTPS | 301 | ENFORCED",
      "[INFO] Third-party scripts | None loaded | Attack surface: MINIMAL",
      "[INFO] Security headers scan | A+ rating | Verified",
    ],
  },
];

const SEVERITY_COLORS = {
  LOW: "#00ff88",
  MEDIUM: "#ffd700",
  HIGH: "#ff9500",
  CRITICAL: "#ff3366",
};

function ProjectCard({ project, index, inView }: { project: Project; index: number; inView: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="glass rounded-xl overflow-hidden card-hover cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded flex items-center justify-center"
              style={{ background: `${project.securityColor}15`, border: `1px solid ${project.securityColor}30` }}
            >
              {project.severity === "CRITICAL" || project.severity === "HIGH"
                ? <ShieldAlert className="w-3.5 h-3.5" style={{ color: project.securityColor }} />
                : <Shield className="w-3.5 h-3.5" style={{ color: project.securityColor }} />}
            </div>
            <div>
              <p className="font-mono text-[9px] text-[#475569] tracking-wider">{project.type}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Severity */}
            <span
              className="font-mono text-[9px] tracking-wider px-2 py-0.5 rounded"
              style={{
                color: SEVERITY_COLORS[project.severity],
                background: `${SEVERITY_COLORS[project.severity]}15`,
                border: `1px solid ${SEVERITY_COLORS[project.severity]}30`,
              }}
            >
              {project.severity}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#475569] transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        <h3 className="text-white font-semibold text-sm mb-2">{project.name}</h3>
        <p className="text-[#94a3b8] text-xs leading-relaxed mb-3">{project.description}</p>

        {/* Security tag */}
        <div className="flex items-center gap-1.5 mb-3">
          <Lock className="w-3 h-3" style={{ color: project.securityColor }} />
          <span
            className="font-mono text-[9px] tracking-wider"
            style={{ color: project.securityColor }}
          >
            {project.securityTag}
          </span>
        </div>

        {/* Stack */}
        <div className="flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="font-mono text-[9px] px-2 py-0.5 rounded glass text-[#475569] border border-[rgba(255,255,255,0.05)]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Expanded: defense angle + logs */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-[rgba(0,212,255,0.1)] p-5 space-y-4">
              {/* Defense angle */}
              <div>
                <p className="font-mono text-[9px] text-[#00d4ff] tracking-wider mb-2">
                  // THREAT &amp; DEFENSE ANALYSIS
                </p>
                <p className="text-[#94a3b8] text-xs leading-relaxed">{project.defenseAngle}</p>
              </div>

              {/* SIEM-style logs */}
              <div className="glass rounded-lg p-3 border border-[rgba(0,212,255,0.1)]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                  <p className="font-mono text-[9px] text-[#475569] tracking-wider">SIEM LOG OUTPUT</p>
                </div>
                <div className="space-y-1">
                  {project.logs.map((log, i) => (
                    <p key={i} className="font-mono text-[10px] leading-relaxed">
                      <span
                        className={
                          log.startsWith("[CRITICAL]")
                            ? "text-[#ff3366]"
                            : log.startsWith("[ALERT]")
                            ? "text-[#ff9500]"
                            : log.startsWith("[WARN]")
                            ? "text-[#ffd700]"
                            : "text-[#00d4ff]"
                        }
                      >
                        {log.split("]")[0]}]
                      </span>
                      <span className="text-[#475569]">{log.slice(log.indexOf("]") + 1)}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-mono text-[10px] text-[#475569] hover:text-[#94a3b8] transition-colors"
                  >
                    <GithubIcon /> SOURCE
                  </a>
                )}
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-mono text-[10px] text-[#00d4ff] hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" /> LIVE SITE
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ProjectsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="projects" ref={ref} className="relative py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <p className="font-mono text-[10px] tracking-[0.35em] text-[#00d4ff] mb-2">
            03 / PROJECTS
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Incident Board
          </h2>
          <div className="h-px w-24 bg-gradient-to-r from-[#00d4ff] to-transparent mb-4" />
          <p className="text-[#475569] text-sm font-mono">
            Click any card to expand SIEM logs and defense analysis
          </p>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-3 mb-10"
        >
          {Object.entries(SEVERITY_COLORS).map(([sev, color]) => (
            <div key={sev} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="font-mono text-[10px] text-[#475569]">{sev}</span>
            </div>
          ))}
        </motion.div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
