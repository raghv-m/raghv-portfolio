"use client";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Target } from "lucide-react";

const CERTS = [
  {
    name: "ISC2 Certified in Cybersecurity (CC)",
    issuer: "ISC2",
    status: "EARNED",
    date: "2024",
    value: "Entry-level cybersecurity credential — first global cert. Validates security fundamentals, risk concepts, and incident response principles.",
    color: "var(--green)",
    glow: "rgba(0,255,136,0.2)",
  },
  {
    name: "Google Cybersecurity Professional Certificate",
    issuer: "Google / Coursera",
    status: "EARNED",
    date: "2024",
    value: "8-course program covering threat detection, network security, Python automation for security, SIEM tools, and Linux for security analysts.",
    color: "var(--green)",
    glow: "rgba(0,255,136,0.2)",
  },
  {
    name: "Alberta Security Guard License",
    issuer: "Province of Alberta",
    status: "EARNED",
    date: "2023",
    value: "Valid Alberta Security Guard License — demonstrates regulatory compliance, physical security operations, and incident reporting standards.",
    color: "var(--green)",
    glow: "rgba(0,255,136,0.2)",
  },
  {
    name: "TryHackMe SOC Level 1",
    issuer: "TryHackMe",
    status: "IN PROGRESS",
    date: "50+ labs",
    progress: 65,
    value: "Hands-on SOC analyst training covering alert triage, SIEM operations, network analysis, threat intelligence, and incident response.",
    color: "var(--gold)",
    glow: "rgba(212,160,23,0.15)",
  },
  {
    name: "CompTIA Security+ SY0-701",
    issuer: "CompTIA",
    status: "EARNED",
    date: "2025",
    value: "Industry-standard security certification. Covers threats, vulnerabilities, architecture, identity management, risk management, and cryptography.",
    color: "var(--green)",
    glow: "rgba(0,255,136,0.2)",
  },
  {
    name: "CompTIA CySA+ CS0-003",
    issuer: "CompTIA",
    status: "PLANNED",
    date: "After Security+",
    value: "Cybersecurity Analyst certification — threat detection, analysis, and response. Direct path to SOC Tier 2 readiness.",
    color: "var(--text-muted)",
    glow: "rgba(136,136,136,0.1)",
  },
  {
    name: "CompTIA CASP+ / CSAP",
    issuer: "CompTIA",
    status: "PLANNED",
    date: "Long-term",
    value: "Advanced security practitioner — security architecture, risk management, enterprise operations. Aligns with Security Engineer target role.",
    color: "var(--text-muted)",
    glow: "rgba(136,136,136,0.1)",
  },
  {
    name: "CISSP",
    issuer: "(ISC)²",
    status: "PLANNED",
    date: "5-year goal",
    value: "Gold standard security certification. Requires 5 years experience. Aligns with Security Architect long-term target.",
    color: "var(--text-muted)",
    glow: "rgba(136,136,136,0.1)",
  },
];

const STATUS_ICON = {
  EARNED: CheckCircle,
  "IN PROGRESS": Clock,
  PLANNED: Target,
};

const STATUS_COLOR = {
  EARNED: "var(--green)",
  "IN PROGRESS": "var(--gold)",
  PLANNED: "var(--text-muted)",
};

export default function CertificationsPage() {
  return (
    <div className="min-h-screen pt-24 pb-32">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-16">
          <p className="font-mono text-[10px] tracking-[0.35em] text-[var(--gold-muted)] mb-2">CERTIFICATIONS</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Credential <span className="gradient-gold">Arsenal</span>
          </h1>
          <p className="text-[var(--text-muted)] max-w-xl leading-relaxed">
            A structured certification path from foundational credentials to expert-level recognition.
          </p>
          <div className="glow-line mt-6 max-w-24" />
        </motion.div>

        {/* Legend */}
        <div className="flex gap-5 mb-10">
          {Object.entries(STATUS_COLOR).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="font-mono text-[10px] text-[var(--text-muted)]">{status}</span>
            </div>
          ))}
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {CERTS.map((cert, i) => {
            const Icon = STATUS_ICON[cert.status as keyof typeof STATUS_ICON];
            const earned = cert.status === "EARNED";
            return (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="glass rounded-xl p-5 card-lift relative overflow-hidden"
                style={{
                  boxShadow: earned ? `0 0 40px ${cert.glow}` : undefined,
                  border: earned ? `1px solid ${cert.color}30` : "1px solid var(--border)",
                }}
              >
                {/* Earned glow overlay */}
                {earned && (
                  <div className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at top right, ${cert.color}, transparent)` }} />
                )}

                <div className="flex items-start justify-between mb-3">
                  <span className="font-mono text-[9px] tracking-wider text-[var(--text-muted)]">
                    {cert.issuer}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" style={{ color: STATUS_COLOR[cert.status as keyof typeof STATUS_COLOR] }} />
                    <span className="font-mono text-[9px] tracking-wider" style={{ color: STATUS_COLOR[cert.status as keyof typeof STATUS_COLOR] }}>
                      {cert.status}
                    </span>
                  </div>
                </div>

                <h3 className="font-display text-sm font-semibold text-[var(--text)] mb-1 leading-snug">
                  {cert.name}
                </h3>
                <p className="font-mono text-[10px] text-[var(--gold)] mb-3">{cert.date}</p>

                {cert.progress !== undefined && (
                  <div className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="font-mono text-[9px] text-[var(--text-muted)]">PROGRESS</span>
                      <span className="font-mono text-[9px] text-[var(--gold)]">{cert.progress}%</span>
                    </div>
                    <div className="h-1 bg-[var(--card)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${cert.progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="h-full progress-bar"
                      />
                    </div>
                  </div>
                )}

                <p className="text-[var(--text-muted)] text-xs leading-relaxed">{cert.value}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
