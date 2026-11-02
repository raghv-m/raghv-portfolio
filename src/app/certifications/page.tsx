"use client";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Target, Award } from "lucide-react";
import { PageHead } from "@/components/casefile/PageHead";
import { Reveal } from "@/components/casefile/Reveal";
import { Stamp } from "@/components/casefile/Stamp";
import { CertWall } from "@/components/casefile/CertWall";


const CERTS = [
  {
    name: "ISC2 Certified in Cybersecurity (CC)",
    issuer: "ISC2",
    status: "EARNED",
    date: "2024",
    value: "Entry-level cybersecurity credential and my first global cert. Validates security fundamentals, risk concepts, and incident response principles.",
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
    value: "Valid Alberta Security Guard License. Demonstrates regulatory compliance, physical security operations, and incident reporting standards.",
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
    date: "Jun 2026",
    value: "Industry-standard security certification. Covers threats, vulnerabilities, architecture, identity management, risk management, and cryptography.",
    color: "var(--green)",
    glow: "rgba(0,255,136,0.2)",
  },
  {
    name: "CompTIA CySA+ CS0-003",
    issuer: "CompTIA",
    status: "PLANNED",
    date: "2026 Target",
    value: "Cybersecurity Analyst certification covering threat detection, analysis, and response. Direct path to SOC Tier 2 readiness.",
    color: "var(--text-muted)",
    glow: "rgba(136,136,136,0.1)",
  },
  {
    name: "CompTIA CASP+ / CSAP",
    issuer: "CompTIA",
    status: "PLANNED",
    date: "Long-term",
    value: "Advanced security practitioner: security architecture, risk management, enterprise operations. Aligns with Security Engineer target role.",
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

const STATUS_TONE: Record<string, "red" | "gold" | "green" | "ink"> = {
  EARNED: "green",
  "IN PROGRESS": "gold",
  PLANNED: "ink",
};

const STAMP_R = [-4.2, -1.8, 2.4, -5.6, 0.8, -3.1, 1.9, -6];
const STAMP_S = [0.98, 1.05, 0.93, 1.02, 0.96, 1.08, 0.94, 1.0];
const STAMP_O = [0.9, 0.86, 0.94, 0.82, 0.92, 0.88, 0.96, 0.84];
const STAMP_BW = [2.5, 3.0, 2.0, 3.5, 2.2, 2.8, 3.2, 2.4];

export default function CertificationsPage() {
  return (
    <div className="pb-32">
      <div className="cf-wrap">
        <PageHead
          kicker="Certifications"
          title={<>Credential <span className="cf-u-red">Arsenal</span></>}
          lede="A structured certification path from foundational credentials to expert-level recognition."
        >
          <div style={{ marginTop: 26, position: "relative" }}>
            <Stamp tone="red" r={-5.2} s={1.04} o={0.88} bw={3.1} delay={250}>
              Filed and verified
            </Stamp>
          </div>

          {/* Earned stats bar */}
          <Reveal delay={0.1}>
            <div className="flex flex-wrap gap-4 mt-8">
              {[
                { icon: Award, label: "4 Certs Earned", color: "var(--green)" },
                { icon: Clock, label: "1 In Progress", color: "var(--gold)" },
                { icon: Target, label: "3 Planned", color: "var(--text-muted)" },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-2.5 px-4 py-2.5"
                  style={{ background: "var(--cf-paper-2)", border: "1.5px solid var(--cf-ink)" }}>
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                  <span className="cf-mono text-[10px] tracking-wider text-[var(--cf-ink-soft)]">{label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </PageHead>

        {/* The documents themselves: real certificates filed as exhibits */}
        <section style={{ marginTop: 56 }}>
          <Reveal>
            <div className="cf-sec-head">
              <h2 className="cf-h2">The documents themselves</h2>
              <p className="cf-note" style={{ marginTop: 10, maxWidth: 620 }}>
                Not badge icons — the actual certificates, rendered from the original files. All six earned
                documents are on file.
              </p>
            </div>
          </Reveal>
          <CertWall />
        </section>

        {/* Legend */}
        <Reveal delay={0.05}>
          <div className="flex gap-5 mb-10" style={{ marginTop: 40 }}>
            {Object.entries(STATUS_COLOR).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5">
                <span className="w-2 h-2" style={{ background: color }} />
                <span className="cf-mono text-[10px] text-[var(--cf-muted)]">{status}</span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Credential rows */}
        <Reveal delay={0.08}>
          <div className="cf-cred">
            {CERTS.map((cert, i) => {
              const Icon = STATUS_ICON[cert.status as keyof typeof STATUS_ICON];
              return (
                <motion.div
                  key={cert.name}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="cf-cred-row"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 shrink-0" style={{ color: STATUS_COLOR[cert.status as keyof typeof STATUS_COLOR] }} />
                      <p className="cf-cred-name">{cert.name}</p>
                    </div>
                    <p className="cf-cred-iss">{cert.issuer}</p>
                    <p className="text-[var(--cf-ink-soft)] text-sm leading-relaxed" style={{ marginTop: 8, maxWidth: 560 }}>
                      {cert.value}
                    </p>
                    {cert.progress !== undefined && (
                      <div style={{ marginTop: 12, maxWidth: 560 }}>
                        <div className="flex justify-between mb-1">
                          <span className="cf-mono text-[9px] text-[var(--cf-muted)]">PROGRESS</span>
                          <span className="cf-mono text-[9px]" style={{ color: "var(--cf-gold)" }}>{cert.progress}%</span>
                        </div>
                        <div className="h-1 overflow-hidden" style={{ background: "var(--cf-paper-3)" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${cert.progress}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            className="h-full progress-bar"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="cf-cred-code">{cert.date}</span>
                  <Stamp
                    tone={STATUS_TONE[cert.status] ?? "ink"}
                    r={STAMP_R[i % STAMP_R.length]}
                    s={STAMP_S[i % STAMP_S.length]}
                    o={STAMP_O[i % STAMP_O.length]}
                    bw={STAMP_BW[i % STAMP_BW.length]}
                    delay={i * 90}
                    live={cert.status === "IN PROGRESS"}
                    className="text-[11px]"
                  >
                    {cert.status}
                  </Stamp>
                </motion.div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
