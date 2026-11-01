"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

import { Shield, Eye, Zap, Lock } from "lucide-react";
import { PageHead } from "@/components/casefile/PageHead";
import { Reveal } from "@/components/casefile/Reveal";
import { Stamp } from "@/components/casefile/Stamp";
import { HomeLabSection } from "@/components/sections/HomeLabSection";

// MITRE ATT&CK techniques simplified — 12 tactics, select techniques per tactic
const ATTACK_MATRIX = [
  { tactic: "Reconnaissance", id: "TA0043", techniques: ["T1595", "T1592", "T1590"], coverage: 0.7 },
  { tactic: "Resource Dev", id: "TA0042", techniques: ["T1583", "T1586"], coverage: 0.4 },
  { tactic: "Initial Access", id: "TA0001", techniques: ["T1190", "T1133", "T1078"], coverage: 0.6 },
  { tactic: "Execution", id: "TA0002", techniques: ["T1059", "T1203", "T1053"], coverage: 0.65 },
  { tactic: "Persistence", id: "TA0003", techniques: ["T1053", "T1547", "T1543"], coverage: 0.5 },
  { tactic: "Priv Escalation", id: "TA0004", techniques: ["T1548", "T1134", "T1055"], coverage: 0.45 },
  { tactic: "Defense Evasion", id: "TA0005", techniques: ["T1070", "T1562", "T1036"], coverage: 0.55 },
  { tactic: "Credential Access", id: "TA0006", techniques: ["T1110", "T1003", "T1555"], coverage: 0.7 },
  { tactic: "Discovery", id: "TA0007", techniques: ["T1082", "T1046", "T1083"], coverage: 0.8 },
  { tactic: "Lateral Movement", id: "TA0008", techniques: ["T1021", "T1080"], coverage: 0.5 },
  { tactic: "Collection", id: "TA0009", techniques: ["T1005", "T1039", "T1074"], coverage: 0.4 },
  { tactic: "C&C", id: "TA0011", techniques: ["T1071", "T1573", "T1090"], coverage: 0.6 },
  { tactic: "Exfiltration", id: "TA0010", techniques: ["T1041", "T1048"], coverage: 0.45 },
  { tactic: "Impact", id: "TA0040", techniques: ["T1486", "T1490", "T1489"], coverage: 0.5 },
];

// Security tools, grouped
const TOOL_GROUPS = [
  {
    group: "SIEM & Detection",
    color: "var(--gold)",
    tools: [
      { name: "Wazuh", desc: "Open-source SIEM/XDR. Running agents on DC-01, WEB01, KALI01. Custom detection rules for SSH brute force, port scans, file integrity." },
      { name: "Elastic SIEM", desc: "ELK stack experience: log ingestion, KQL queries, detection rules, and dashboard building for security events." },
      { name: "Splunk", desc: "SPL query fundamentals via TryHackMe SOC L1 training. Alert creation, saved searches, and incident investigation workflows." },
    ],
  },
  {
    group: "Network Analysis",
    color: "var(--blue)",
    tools: [
      { name: "Wireshark", desc: "Packet capture analysis: identifying C2 traffic patterns, credential harvesting in plaintext, DNS tunneling indicators." },
      { name: "Nmap", desc: "Network discovery and port scanning. Running scans against lab network from KALI01 to verify Wazuh detection rules trigger correctly." },
      { name: "tcpdump", desc: "CLI packet capture on Linux endpoints. Used for real-time traffic analysis during active lab exercises." },
      { name: "LAN Setup (Home Lab)", desc: "Built and runs the lab LAN himself: IP addressing and subnetting, DHCP and DNS on the domain controller, NAT, and firewall rules across all four nodes." },
    ],
  },
  {
    group: "Offensive / Red Team",
    color: "var(--red)",
    tools: [
      { name: "Hydra", desc: "Password brute force tool. Used offensively in lab to test SSH and RDP rate limiting, and defensively to tune Wazuh rules." },
      { name: "Gobuster", desc: "Web directory enumeration. Used to understand what attackers see, and to test web server security configurations on WEB01." },
      { name: "Metasploit", desc: "Exploitation framework for TryHackMe labs and controlled home lab usage. Generates real attack telemetry for SIEM testing." },
    ],
  },
  {
    group: "Operating Systems",
    color: "var(--green)",
    tools: [
      { name: "Kali Linux", desc: "Primary attack platform (KALI01). Running full Kali 2024 on dedicated hardware for ethical hacking lab exercises." },
      { name: "Windows Server 2022", desc: "Domain Controller (DC-01) running Active Directory. GPO management, user/group administration, event log forwarding to Wazuh." },
      { name: "Ubuntu Server 22", desc: "WEB01 and WAZUH01 run on Ubuntu. UFW firewall rules, SSH hardening, Nginx reverse proxy, systemd service management." },
    ],
  },
  {
    group: "Scripting & Dev",
    color: "var(--blue)",
    tools: [
      { name: "Python 3", desc: "Log parsing scripts, API integrations, threat intel automation. Building custom scripts to extend Wazuh detection capabilities." },
      { name: "Bash / PowerShell", desc: "System administration automation, log parsing, and scheduled tasks across both Linux and Windows endpoints in the lab." },
      { name: "SQL / Queries", desc: "Database query experience from dev background. Parameterized queries, RBAC schema design, and security log querying (KQL/SPL)." },
    ],
  },
];

const SKILL_DOMAINS = [
  { name: "Threat Detection", pct: 55, color: "var(--gold)", desc: "SIEM rule writing, alert triage, IOC identification" },
  { name: "Network Security", pct: 65, color: "var(--blue)", desc: "Packet analysis, firewall rules, port scanning; home-lab LAN: subnetting, DHCP, DNS, NAT" },
  { name: "Active Directory", pct: 60, color: "var(--gold)", desc: "Domain management, GPO, authentication protocols" },
  { name: "Incident Response", pct: 50, color: "var(--blue)", desc: "IR lifecycle, documentation, escalation procedures" },
  { name: "Linux Administration", pct: 70, color: "var(--green)", desc: "Server hardening, service management, log analysis" },
  { name: "Python / Scripting", pct: 72, color: "var(--green)", desc: "Security automation, log parsing, tool development" },
  { name: "GRC / Compliance", pct: 45, color: "var(--text-muted)", desc: "Risk frameworks, policy writing, audit documentation" },
  { name: "Web App Security", pct: 62, color: "var(--blue)", desc: "OWASP Top 10, secure SDLC, authentication patterns" },
];

function ToolCard({ tool, color }: { tool: { name: string; desc: string }; color: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className="relative h-28 cursor-pointer"
      style={{ perspective: "800px" }}
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backfaceVisibility: "hidden", background: "var(--cf-paper-2)", border: `1.5px solid ${color}` }}
        >
          <span className="cf-display text-sm" style={{ color }}>{tool.name}</span>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 flex items-center p-3"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "var(--cf-paper)", border: `1.5px solid ${color}` }}
        >
          <p className="text-[var(--cf-ink-soft)] text-[10px] leading-relaxed">{tool.desc}</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function CybersecurityPage() {
  const matrixRef = useRef(null);
  const matrixInView = useInView(matrixRef, { once: true, margin: "-80px" });

  return (
    <div className="pb-32">
      <div className="cf-wrap">
        <PageHead
          kicker="Cybersecurity"
          title={<>Threat <span className="cf-u-red">Operations</span></>}
          lede="Blue team fundamentals, SIEM operations, and hands-on offensive tooling. Built through real home lab exercises, not just theory."
        >
          <div style={{ marginTop: 26 }}>
            <Stamp tone="gold" r={2.6} s={0.97} o={0.92} bw={2.6} delay={250}>
              14 tactics mapped
            </Stamp>
          </div>
        </PageHead>

        {/* Quick stats */}
        <Reveal delay={0.05}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16" style={{ marginTop: 40 }}>
            {[
              { icon: Shield, label: "Certs Earned", value: "3", color: "var(--green)" },
              { icon: Eye, label: "THM Labs", value: "50+", color: "var(--gold)" },
              { icon: Zap, label: "Wazuh Rules", value: "12+", color: "var(--blue)" },
              { icon: Lock, label: "MITRE Tactics", value: "14", color: "var(--text-muted)" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 text-center"
                style={{ background: "var(--cf-paper-2)", border: "1.5px solid var(--cf-ink)" }}
              >
                <stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color: stat.color }} />
                <p className="cf-display text-2xl" style={{ color: stat.color }}>{stat.value}</p>
                <p className="cf-mono text-[9px] text-[var(--cf-muted)] mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* MITRE ATT&CK Heatmap */}
        <section ref={matrixRef} className="mb-16">
          <Reveal>
            <div className="cf-sec-head flex items-end justify-between flex-wrap gap-4">
              <div>
                <p className="cf-kicker" style={{ marginBottom: 8 }}>MITRE ATT&CK</p>
                <h2 className="cf-h2">Detection Coverage Heatmap</h2>
              </div>
              <div className="flex gap-3">
                {[["Low", "rgba(46,107,30,0.18)"], ["Med", "rgba(46,107,30,0.45)"], ["High", "var(--cf-gold)"]].map(([l, c]) => (
                  <div key={l} className="flex items-center gap-1.5">
                    <div className="w-3 h-3" style={{ background: c, border: "1px solid var(--cf-faint)" }} />
                    <span className="cf-mono text-[9px] text-[var(--cf-muted)]">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {ATTACK_MATRIX.map((tactic, i) => (
              <motion.div
                key={tactic.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={matrixInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden group cursor-default"
                style={{
                  minHeight: 80,
                  padding: 12,
                  border: "1px solid var(--cf-faint)",
                  background: tactic.coverage >= 0.65
                    ? `rgba(154,116,16,${tactic.coverage * 0.28})`
                    : `rgba(46,107,30,${tactic.coverage * 0.3})`,
                }}
              >
                <div className="relative">
                  <p className="cf-mono text-[8px] text-[var(--cf-muted)] tracking-wide">{tactic.id}</p>
                  <p className="cf-display text-[10px] text-[var(--cf-ink)] mt-0.5 leading-tight">{tactic.tactic}</p>
                  <p className="cf-mono text-[9px] mt-1.5" style={{ color: tactic.coverage >= 0.65 ? "var(--cf-gold)" : "var(--cf-green, #2e6b1e)" }}>
                    {Math.round(tactic.coverage * 100)}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Skill bars */}
        <Reveal>
          <section
            className="p-8 mb-16"
            style={{ border: "2px solid var(--cf-ink)", background: "transparent" }}
          >
            <p className="cf-kicker" style={{ marginBottom: 8 }}>Skill Domains</p>
            <h2 className="cf-h2" style={{ marginBottom: 32 }}>Current Proficiency</h2>
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-5">
              {SKILL_DOMAINS.map((skill, i) => (
                <div key={skill.name}>
                  <div className="flex justify-between mb-1.5">
                    <div>
                      <span className="cf-display text-sm text-[var(--cf-ink)]">{skill.name}</span>
                      <p className="cf-mono text-[9px] text-[var(--cf-muted)] mt-0.5">{skill.desc}</p>
                    </div>
                    <span className="cf-mono text-[11px] shrink-0 ml-4" style={{ color: skill.color }}>{skill.pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden" style={{ background: "var(--cf-paper-3)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                      className="h-full progress-bar"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Tool flip cards */}
        <section className="mb-16">
          <Reveal>
            <div className="cf-sec-head">
              <p className="cf-kicker" style={{ marginBottom: 8 }}>Toolstack</p>
              <h2 className="cf-h2">Click any card to flip</h2>
              <p className="cf-mono text-[10px] text-[var(--cf-muted)]" style={{ marginTop: 10 }}>Hover/tap to reveal usage context from the home lab</p>
            </div>
          </Reveal>

          {TOOL_GROUPS.map((group, gi) => (
            <Reveal key={group.group} delay={gi * 0.04}>
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-4" style={{ background: group.color }} />
                  <p className="cf-mono text-[10px] tracking-wider" style={{ color: group.color }}>{group.group}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {group.tools.map((tool) => (
                    <ToolCard key={tool.name} tool={tool} color={group.color} />
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </section>

        {/* Certifications quick strip */}
        <Reveal>
          <div
            className="p-5 flex flex-wrap items-center justify-between gap-4"
            style={{ border: "2px solid var(--cf-ink)", background: "var(--cf-paper-2)" }}
          >
            <div>
              <p className="cf-mono text-[9px] tracking-wider mb-1" style={{ color: "var(--cf-gold)" }}>CREDENTIAL STATUS</p>
              <p className="text-[var(--cf-ink)] text-sm">ISC2 CC · Google Cyber · Security+ earned · SC-200 in progress · THM SOC L1 (65%)</p>
            </div>
            <Link href="/certifications" className="cf-btn-ghost text-sm gap-1.5">
              Full cert stack
            </Link>
          </div>
        </Reveal>

        <Reveal className="mt-10">
          <p className="cf-note">
            Cross-references: the detections above run in the{" "}
            <a href="#home-lab" className="cf-ulink">home lab</a> below, and the write-ups land on the{" "}
            <Link href="/blog" className="cf-ulink">blog</Link> and in{" "}
            <Link href="/newsletter" className="cf-ulink">Blue Team Brief</Link>.
          </p>
        </Reveal>

        {/* Home Lab (merged in from the old /homelab page, round 2) */}
        <div className="mt-20">
          <HomeLabSection />
        </div>
      </div>
    </div>
  );
}
