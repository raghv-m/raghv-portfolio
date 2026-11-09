"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";

import { Shield, Eye, Zap, Lock } from "lucide-react";
import { PageHead } from "@/components/casefile/PageHead";
import { Reveal } from "@/components/casefile/Reveal";
import { Stamp } from "@/components/casefile/Stamp";
import { HomeLabSection } from "@/components/sections/HomeLabSection";
import { SKILLS } from "@/components/sections/careerData";
import { JsonLd, faqPageSchema, breadcrumbSchema } from "@/components/seo/JsonLd";
import { EASE_OUT } from "@/components/casefile/motion";

/*
 * Audit-fix: the lab Q&A rendered at the foot of this page and mirrored
 * 1:1 in its FAQPage schema. Answers use ONLY the verified lab facts:
 * a 4-node home lab; Wazuh as the SIEM, running in Docker; Windows
 * Server 2022 with Active Directory; Kali Linux as the attack platform;
 * 50+ documented practice attack simulations; Splunk used in lab only.
 * No version numbers, no extra tooling claims.
 */
const LAB_FAQS: { q: string; a: string }[] = [
  {
    q: "How big is the home lab?",
    a: "Four nodes, run at home as a practice environment for security operations.",
  },
  {
    q: "What watches the lab?",
    a: "Wazuh is the SIEM. It runs in Docker and collects the lab's logs and alerts in one place.",
  },
  {
    q: "What does the Windows server do?",
    a: "Windows Server 2022 runs Active Directory, so the lab has a real domain to monitor and defend.",
  },
  {
    q: "Where do the attacks come from?",
    a: "Kali Linux is the attack platform. Every attack in the lab is a practice simulation, run on purpose against his own machines.",
  },
  {
    q: "How much practice is documented?",
    a: "More than 50 practice attack simulations, each one documented.",
  },
  {
    q: "What about Splunk?",
    a: "Splunk is used in the lab only. It is part of the practice setup, not a production system.",
  },
];

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

// Security tools, grouped. `use` is the one-line duty summary printed on the
// card face; `desc` is the full file, shown on the flip side.
const TOOL_GROUPS = [
  {
    group: "SIEM & Detection",
    code: "DET",
    color: "var(--gold)",
    tools: [
      { name: "Wazuh", tag: "SIEM / XDR", use: "Agents on DC-01, WEB01, KALI01. Custom rules for brute force, scans, FIM.", desc: "Open-source SIEM/XDR. Running agents on DC-01, WEB01, KALI01. Custom detection rules for SSH brute force, port scans, file integrity." },
      { name: "Elastic SIEM", tag: "ELK STACK", use: "Log ingestion, KQL queries, detection rules, event dashboards.", desc: "ELK stack experience: log ingestion, KQL queries, detection rules, and dashboard building for security events." },
      { name: "Splunk", tag: "SPL / SOC L1", use: "SPL fundamentals via TryHackMe SOC L1: alerts, saved searches, investigations.", desc: "SPL query fundamentals via TryHackMe SOC L1 training. Alert creation, saved searches, and incident investigation workflows." },
    ],
  },
  {
    group: "Network Analysis",
    code: "NET",
    color: "var(--blue)",
    tools: [
      { name: "Wireshark", tag: "PCAP ANALYSIS", use: "Hunting C2 patterns, plaintext credentials, DNS tunneling indicators.", desc: "Packet capture analysis: identifying C2 traffic patterns, credential harvesting in plaintext, DNS tunneling indicators." },
      { name: "Nmap", tag: "DISCOVERY / SCAN", use: "Scans from KALI01 to prove Wazuh rules fire correctly.", desc: "Network discovery and port scanning. Running scans against lab network from KALI01 to verify Wazuh detection rules trigger correctly." },
      { name: "tcpdump", tag: "CLI CAPTURE", use: "Real-time traffic capture on Linux endpoints during lab exercises.", desc: "CLI packet capture on Linux endpoints. Used for real-time traffic analysis during active lab exercises." },
      { name: "LAN Setup (Home Lab)", tag: "LAB NETWORK", use: "Addressing, subnetting, DHCP, DNS, NAT, firewall rules across four nodes.", desc: "Built and runs the lab LAN himself: IP addressing and subnetting, DHCP and DNS on the domain controller, NAT, and firewall rules across all four nodes." },
    ],
  },
  {
    group: "Offensive / Red Team",
    code: "OFF",
    color: "var(--red)",
    tools: [
      { name: "Hydra", tag: "BRUTE FORCE", use: "Tests SSH/RDP rate limiting; results feed back into Wazuh rule tuning.", desc: "Password brute force tool. Used offensively in lab to test SSH and RDP rate limiting, and defensively to tune Wazuh rules." },
      { name: "Gobuster", tag: "WEB ENUM", use: "Directory enumeration to see the attacker's view of WEB01.", desc: "Web directory enumeration. Used to understand what attackers see, and to test web server security configurations on WEB01." },
      { name: "Metasploit", tag: "EXPLOITATION", use: "Generates real attack telemetry for SIEM testing, TryHackMe and home lab.", desc: "Exploitation framework for TryHackMe labs and controlled home lab usage. Generates real attack telemetry for SIEM testing." },
    ],
  },
  {
    group: "Operating Systems",
    code: "OS",
    color: "var(--cf-ink)",
    tools: [
      { name: "Kali Linux", tag: "KALI01", use: "Primary attack platform, full Kali 2024 on dedicated hardware.", desc: "Primary attack platform (KALI01). Running full Kali 2024 on dedicated hardware for ethical hacking lab exercises." },
      { name: "Windows Server 2022", tag: "DC-01", use: "Domain controller: Active Directory, GPO, event forwarding to Wazuh.", desc: "Domain Controller (DC-01) running Active Directory. GPO management, user/group administration, event log forwarding to Wazuh." },
      { name: "Ubuntu Server 22", tag: "WEB01 / WAZUH01", use: "UFW, SSH hardening, Nginx reverse proxy, systemd services.", desc: "WEB01 and WAZUH01 run on Ubuntu. UFW firewall rules, SSH hardening, Nginx reverse proxy, systemd service management." },
    ],
  },
  {
    group: "Scripting & Dev",
    code: "SCR",
    color: "var(--blue)",
    tools: [
      { name: "Python 3", tag: "AUTOMATION", use: "Log parsing, API integrations, scripts that extend Wazuh detection.", desc: "Log parsing scripts, API integrations, threat intel automation. Building custom scripts to extend Wazuh detection capabilities." },
      { name: "Bash / PowerShell", tag: "ADMIN", use: "Admin automation and log parsing across Linux and Windows endpoints.", desc: "System administration automation, log parsing, and scheduled tasks across both Linux and Windows endpoints in the lab." },
      { name: "SQL / Queries", tag: "KQL / SPL", use: "Parameterized queries, RBAC schema design, security log querying.", desc: "Database query experience from dev background. Parameterized queries, RBAC schema design, and security log querying (KQL/SPL)." },
    ],
  },
];

/*
 * Avatar-upgrade pass (item 0b): percentages out here too, same treatment
 * as CareerSection (forensic-fix item B). Each domain prints its one
 * evidence line, resolved VERBATIM from careerData's SKILLS — the single
 * source — never retyped. "GRC / Compliance" had no honest match among
 * the ten approved lines; the owner ordered the row dropped entirely
 * (Nov 2, 2026) rather than keep an unproven percentage, so the bar
 * renderer went with it.
 */
const evidenceFor = (careerName: string) => SKILLS.find((s) => s.name === careerName)?.evidence;

const SKILL_DOMAINS: {
  name: string;
  color: string;
  desc: string;
  evidence?: string;
}[] = [
  { name: "Threat Detection", color: "var(--gold)", desc: "SIEM rule writing, alert triage, IOC identification", evidence: evidenceFor("Threat Detection") },
  { name: "Network Security", color: "var(--blue)", desc: "Packet analysis, firewall rules, port scanning; home-lab LAN: subnetting, DHCP, DNS, NAT", evidence: evidenceFor("Network Security") },
  { name: "Active Directory", color: "var(--gold)", desc: "Domain management, GPO, authentication protocols", evidence: evidenceFor("Active Directory") },
  { name: "Incident Response", color: "var(--blue)", desc: "IR lifecycle, documentation, escalation procedures", evidence: evidenceFor("Incident Response") },
  { name: "Linux Administration", color: "var(--blue)", desc: "Server hardening, service management, log analysis", evidence: evidenceFor("Linux Administration") },
  { name: "Python / Scripting", color: "var(--gold)", desc: "Security automation, log parsing, tool development", evidence: evidenceFor("Python & Scripting") },
  { name: "Web App Security", color: "var(--blue)", desc: "OWASP Top 10, secure SDLC, authentication patterns", evidence: evidenceFor("Web Application Security") },
];

function ToolCard({ tool, color, code, index }: {
  tool: { name: string; tag: string; use: string; desc: string };
  color: string;
  code: string;
  index: number;
}) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className="relative h-36 cursor-pointer"
      style={{ perspective: "800px" }}
      onClick={() => setFlipped(!flipped)}
      role="button"
      aria-pressed={flipped}
      aria-label={`${tool.name}: flip for full detail`}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front: HUD readout — name, data tag, and the usage line on the face */}
        <div
          className="absolute inset-0 flex"
          style={{ backfaceVisibility: "hidden", background: "var(--cf-paper-2)", border: "2px solid var(--cf-ink)" }}
        >
          <div style={{ width: 5, background: color, flexShrink: 0 }} />
          <div className="flex flex-col p-3 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="cf-display text-[13px] leading-tight text-[var(--cf-ink)]">{tool.name}</span>
              <span className="cf-mono cf-fs-data shrink-0" style={{ color }}>
                {code}-{String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <p className="cf-mono cf-fs-data tracking-widest mt-1" style={{ color }}>{tool.tag}</p>
            <p className="text-[var(--cf-ink-soft)] cf-fs-data leading-snug mt-2">{tool.use}</p>
            <p className="cf-mono cf-fs-data text-[var(--cf-muted)] mt-auto">▸ TAP — FULL FILE</p>
          </div>
        </div>
        {/* Back: the full file */}
        <div
          className="absolute inset-0 flex"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "var(--cf-paper)", border: "2px solid var(--cf-ink)" }}
        >
          <div style={{ width: 5, background: color, flexShrink: 0 }} />
          <div className="p-3 overflow-hidden">
            <p className="cf-mono cf-fs-data tracking-widest mb-1.5" style={{ color }}>{tool.tag} — FILE</p>
            <p className="text-[var(--cf-ink-soft)] cf-fs-data leading-relaxed">{tool.desc}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function CybersecurityPage() {
  const matrixRef = useRef(null);
  const matrixInView = useInView(matrixRef, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  // Heatmap readout: the selected tactic's file opens under the grid.
  // Defaults to the strongest coverage on the board (Discovery, 80%).
  const [selected, setSelected] = useState(8);
  const sel = ATTACK_MATRIX[selected];

  return (
    <div className="pb-32">
      {/* Audit-fix: FAQPage schema for the lab Q&A at the foot of the page. */}
      <JsonLd data={faqPageSchema(LAB_FAQS)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Cybersecurity", path: "/cybersecurity" },
        ])}
      />
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12" style={{ marginTop: 40 }}>
            {[
              { icon: Shield, label: "Certs Earned", value: "3", color: "var(--gold)" },
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
                <p className="cf-mono cf-fs-data text-[var(--cf-muted)] mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* MITRE ATT&CK Heatmap */}
        <section ref={matrixRef} className="mb-12">
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
                    <span className="cf-mono cf-fs-data text-[var(--cf-muted)]">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2" role="group" aria-label="MITRE ATT&CK tactics — select one for its coverage readout">
            {ATTACK_MATRIX.map((tactic, i) => (
              <motion.button
                key={tactic.id}
                type="button"
                onClick={() => setSelected(i)}
                onMouseEnter={() => setSelected(i)}
                onFocus={() => setSelected(i)}
                aria-pressed={selected === i}
                aria-label={`${tactic.tactic}: ${Math.round(tactic.coverage * 100)}% detection coverage`}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={matrixInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: i * 0.04, ease: EASE_OUT }}
                className="relative overflow-hidden text-left cursor-pointer"
                style={{
                  minHeight: 80,
                  padding: 12,
                  border: selected === i ? "2px solid var(--cf-ink)" : "1px solid var(--cf-faint)",
                  boxShadow: selected === i ? "4px 4px 0 var(--cf-shadow)" : undefined,
                  background: tactic.coverage >= 0.65
                    ? `rgba(154,116,16,${tactic.coverage * 0.28})`
                    : `rgba(46,107,30,${tactic.coverage * 0.3})`,
                }}
              >
                <div className="relative">
                  <p className="cf-mono cf-fs-data text-[var(--cf-muted)] tracking-wide">{tactic.id}</p>
                  <p className="cf-display cf-fs-data text-[var(--cf-ink)] mt-0.5 leading-tight">{tactic.tactic}</p>
                  <p className="cf-mono cf-fs-data mt-1.5" style={{ color: tactic.coverage >= 0.65 ? "var(--cf-gold)" : "var(--cf-green, #2e6b1e)" }}>
                    {Math.round(tactic.coverage * 100)}%
                  </p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Readout: the selected tactic's file. Keyed by tactic so a new
              selection swaps instantly — no exit animation, no input lock;
              hover, focus and tap all drive it. */}
          <div
            className="mt-3"
            style={{ border: "2px solid var(--cf-ink)", background: "var(--cf-paper-2)", boxShadow: "6px 6px 0 var(--cf-shadow)" }}
          >
            <motion.div
              key={sel.id}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.25, ease: EASE_OUT }}
              className="p-5 flex flex-wrap items-center gap-x-10 gap-y-4"
              aria-live="polite"
            >
              <div>
                <p className="cf-mono cf-fs-data tracking-widest" style={{ color: "var(--cf-red)" }}>{sel.id} · TACTIC</p>
                <p className="cf-display text-xl mt-1" style={{ color: "var(--cf-ink)" }}>{sel.tactic}</p>
              </div>
              <div style={{ flex: "1 1 220px", maxWidth: 340, minWidth: 180 }}>
                <div className="flex justify-between items-baseline gap-4">
                  <p className="cf-mono cf-fs-data tracking-widest text-[var(--cf-muted)]">DETECTION COVERAGE</p>
                  <p className="cf-display text-2xl" style={{ color: "var(--cf-red)" }}>{Math.round(sel.coverage * 100)}%</p>
                </div>
                <div className="h-2 mt-2" style={{ background: "var(--cf-paper-3)" }}>
                  {/* U4 (upscale pass): the fill is a full-width bar scaled
                      on X (transform, compositor-only), not a width
                      animation (layout on every frame). */}
                  <div
                    className="h-full w-full"
                    style={{
                      background: "var(--cf-red)",
                      transform: `scaleX(${sel.coverage})`,
                      transformOrigin: "left center",
                      transition: "transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
                    }}
                  />
                </div>
              </div>
              <div>
                <p className="cf-mono cf-fs-data tracking-widest text-[var(--cf-muted)] mb-2">TECHNIQUES TRACKED · {sel.techniques.length}</p>
                <div className="flex flex-wrap gap-1.5">
                  {sel.techniques.map((t) => (
                    <span key={t} className="cf-mono cf-fs-data px-2 py-1" style={{ border: "1px solid var(--cf-faint)", color: "var(--cf-ink)" }}>{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
          <p className="cf-mono cf-fs-data text-[var(--cf-muted)] mt-3">Coverage is self-assessed from home-lab exercises. Select any cell — its lab readout opens here.</p>
        </section>

        {/* Skill domains: evidence lines in place of percentages
            (item 0b). Every domain carries an approved evidence line;
            see SKILL_DOMAINS. */}
        <Reveal>
          <section
            className="p-6 mb-12"
            style={{ border: "2px solid var(--cf-ink)", background: "transparent" }}
          >
            <p className="cf-kicker" style={{ marginBottom: 8 }}>Skill Domains</p>
            <h2 className="cf-h2" style={{ marginBottom: 24 }}>Current Proficiency</h2>
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-5">
              {SKILL_DOMAINS.map((skill) => (
                <div key={skill.name}>
                  <span className="cf-display text-sm text-[var(--cf-ink)]">{skill.name}</span>
                  <p className="cf-mono cf-fs-data text-[var(--cf-muted)] mt-0.5">{skill.desc}</p>
                  <p className="text-sm leading-relaxed mt-1.5" style={{ color: "var(--cf-ink-soft)" }}>{skill.evidence}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Tool flip cards: usage on the face, full file on the flip */}
        <section className="mb-12">
          <Reveal>
            <div className="cf-sec-head">
              <p className="cf-kicker" style={{ marginBottom: 8 }}>Toolstack</p>
              <h2 className="cf-h2">Click any card to flip</h2>
              <p className="cf-mono cf-fs-data text-[var(--cf-muted)]" style={{ marginTop: 10 }}>The duty line is on the face of every card — flip for the full file</p>
            </div>
          </Reveal>

          {TOOL_GROUPS.map((group, gi) => (
            <Reveal key={group.group} delay={gi * 0.04}>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-4" style={{ background: group.color }} />
                  <p className="cf-mono cf-fs-data tracking-wider" style={{ color: group.color }}>{group.group}</p>
                  <span className="cf-mono cf-fs-data text-[var(--cf-muted)]">· {group.tools.length} UNITS</span>
                </div>
                <div className="grid grid-cols-1 min-[520px]:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.tools.map((tool, ti) => (
                    <ToolCard key={tool.name} tool={tool} color={group.color} code={group.code} index={ti} />
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
              <p className="cf-mono cf-fs-data tracking-wider mb-1" style={{ color: "var(--cf-gold)" }}>CREDENTIAL STATUS</p>
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
            <a href="#home-lab" className="cf-ulink">home lab</a> below. The first investigation,{" "}
            <Link href="/investigations/lab-001-ssh-brute-force" className="cf-ulink">LAB-001 — SSH brute force detection</Link>,
            is filed in full, and the write-ups land on the{" "}
            <Link href="/blog" className="cf-ulink">blog</Link> and in{" "}
            <Link href="/newsletter" className="cf-ulink">Blue Team Brief</Link>.
          </p>
        </Reveal>

        {/* Home Lab (merged in from the old /homelab page, round 2) */}
        <div className="mt-14">
          <HomeLabSection />
        </div>

        {/* Audit-fix: the lab Q&A. Every answer is printed here in full;
            the FAQPage schema at the top of this page carries the same
            text, word for word, from the same LAB_FAQS array. */}
        <section className="mt-14">
          <Reveal>
            <div className="cf-sec-head">
              <p className="cf-kicker" style={{ marginBottom: 8 }}>Lab questions</p>
              <h2 className="cf-h2">The lab, answered straight</h2>
            </div>
          </Reveal>
          <Reveal>
            <div
              style={{
                border: "2.5px solid var(--cf-ink)",
                background: "var(--cf-paper-2)",
                boxShadow: "8px 8px 0 var(--cf-shadow)",
              }}
            >
              {LAB_FAQS.map((item, i) => (
                <div
                  key={item.q}
                  className="px-5 sm:px-6 py-4"
                  style={i > 0 ? { borderTop: "2px solid var(--cf-faint)" } : undefined}
                >
                  <p className="cf-display" style={{ fontSize: 17, letterSpacing: "0.02em", color: "var(--cf-ink)" }}>
                    {item.q}
                  </p>
                  <p className="mt-2" style={{ fontSize: 15.5, lineHeight: 1.65, color: "var(--cf-ink-soft)", maxWidth: "68ch" }}>
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );
}
