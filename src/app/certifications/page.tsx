"use client";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Award } from "lucide-react";
import { PageHead } from "@/components/casefile/PageHead";
import { Reveal } from "@/components/casefile/Reveal";
import { Stamp } from "@/components/casefile/Stamp";
import { CertWall } from "@/components/casefile/CertWall";
import { EASE_OUT } from "@/components/casefile/motion";


/**
 * Credential rows. Earned entries mirror the documents in
 * src/data/cert-docs.ts (the wall above) one for one, plus the Alberta
 * Security Guard License, which is earned but not scanned. SC-200 is the
 * one certification actually in progress. Training (TryHackMe) is listed
 * separately below and is NOT a certification.
 */
const CERTS = [
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
    name: "ISC2 Certified in Cybersecurity (CC)",
    issuer: "ISC2",
    status: "EARNED",
    date: "2026",
    value: "Entry-level cybersecurity credential and my first global cert. Validates security fundamentals, risk concepts, and incident response principles.",
    color: "var(--green)",
    glow: "rgba(0,255,136,0.2)",
  },
  {
    name: "Google — Foundations of Cybersecurity",
    issuer: "Google / Coursera",
    status: "EARNED",
    date: "Jan 8, 2026",
    value: "Opening course of the Google cybersecurity program: core security concepts, common threats, and how analysts protect organizations.",
    color: "var(--green)",
    glow: "rgba(0,255,136,0.2)",
  },
  {
    name: "Google — Play It Safe: Manage Security Risks",
    issuer: "Google / Coursera",
    status: "EARNED",
    date: "Jan 18, 2026",
    value: "Risk management course: security frameworks and controls, and how organizations identify and manage security risk.",
    color: "var(--green)",
    glow: "rgba(0,255,136,0.2)",
  },
  {
    name: "Google — Connect and Protect: Networks and Network Security",
    issuer: "Google / Coursera",
    status: "EARNED",
    date: "Jan 28, 2026",
    value: "Network security course: network architecture and protocols, and defending networks against intrusion.",
    color: "var(--green)",
    glow: "rgba(0,255,136,0.2)",
  },
  {
    name: "Intermediate First Aid",
    issuer: "APEX",
    status: "EARNED",
    date: "Oct 2026",
    value: "Intermediate First Aid under CSA Standard Z1210-17: injury assessment, bleeding control, and emergency response. Valid to Oct 2029.",
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
    name: "Microsoft SC-200: Security Operations Analyst",
    issuer: "Microsoft",
    status: "IN PROGRESS",
    date: "Ongoing",
    value: "Security operations certification covering threat detection and response with Microsoft Sentinel and Microsoft Defender. Currently studying.",
    color: "var(--gold)",
    glow: "rgba(212,160,23,0.15)",
  },
];

const STATUS_ICON = {
  EARNED: CheckCircle,
  "IN PROGRESS": Clock,
};

const STATUS_COLOR = {
  EARNED: "var(--green)",
  "IN PROGRESS": "var(--gold)",
};

const STATUS_TONE: Record<string, "red" | "gold" | "green" | "ink"> = {
  EARNED: "green",
  "IN PROGRESS": "gold",
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
          lede="Every earned credential below matches a document on file. One more is in progress, and training is labelled as training, not dressed up as a certification."
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
                { icon: Award, label: "7 Credentials Earned", color: "var(--green)" },
                { icon: Clock, label: "1 In Progress", color: "var(--gold)" },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-2.5 px-4 py-2.5"
                  style={{ background: "var(--cf-paper-2)", border: "1.5px solid var(--cf-ink)" }}>
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                  <span className="cf-mono cf-fs-data tracking-wider text-[var(--cf-ink-soft)]">{label}</span>
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
                <span className="cf-mono cf-fs-data text-[var(--cf-muted)]">{status}</span>
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
                  transition={{ duration: 0.5, delay: i * 0.05, ease: EASE_OUT }}
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
                    className="cf-fs-label"
                  >
                    {cert.status}
                  </Stamp>
                </motion.div>
              );
            })}
          </div>
        </Reveal>

        {/* Training — plainly labelled, not a certification */}
        <section style={{ marginTop: 56 }}>
          <Reveal>
            <div className="cf-sec-head">
              <h2 className="cf-h2">Training, not a credential</h2>
              <p className="cf-note" style={{ marginTop: 10, maxWidth: 620 }}>
                TryHackMe SOC Level 1 is a hands-on training path I am working through: alert triage,
                SIEM operations, network analysis, threat intelligence, and incident response. It is
                practice, not a certification, so it does not sit in the credential list above.
              </p>
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );
}
