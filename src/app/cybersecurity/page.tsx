"use client";
import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Shield, Eye, Zap, Lock, ChevronRight } from "lucide-react";

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
      { name: "Elastic SIEM", desc: "ELK stack experience — log ingestion, KQL queries, detection rules, and dashboard building for security events." },
      { name: "Splunk", desc: "SPL query fundamentals via TryHackMe SOC L1 training. Alert creation, saved searches, and incident investigation workflows." },
    ],
  },
  {
    group: "Network Analysis",
    color: "var(--blue)",
    tools: [
      { name: "Wireshark", desc: "Packet capture analysis — identifying C2 traffic patterns, credential harvesting in plaintext, DNS tunneling indicators." },
      { name: "Nmap", desc: "Network discovery and port scanning. Running scans against lab network from KALI01 to verify Wazuh detection rules trigger correctly." },
      { name: "tcpdump", desc: "CLI packet capture on Linux endpoints. Used for real-time traffic analysis during active lab exercises." },
    ],
  },
  {
    group: "Offensive / Red Team",
    color: "var(--red)",
    tools: [
      { name: "Hydra", desc: "Password brute force tool — used offensively in lab to test SSH and RDP rate limiting, and defensively to tune Wazuh rules." },
      { name: "Gobuster", desc: "Web directory enumeration — used to understand what attackers see, and to test web server security configurations on WEB01." },
      { name: "Metasploit", desc: "Exploitation framework — TryHackMe labs and controlled home lab usage. Generates real attack telemetry for SIEM testing." },
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
  { name: "Network Security", pct: 65, color: "var(--blue)", desc: "Packet analysis, firewall rules, port scanning" },
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
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 glass rounded-xl flex items-center justify-center"
          style={{ backfaceVisibility: "hidden", border: `1px solid ${color}25` }}
        >
          <span className="font-display text-sm font-semibold" style={{ color }}>{tool.name}</span>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 glass rounded-xl flex items-center p-3"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", border: `1px solid ${color}30`, background: `${color}06` }}
        >
          <p className="text-[var(--text-muted)] text-[10px] leading-relaxed">{tool.desc}</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function CybersecurityPage() {
  const matrixRef = useRef(null);
  const matrixInView = useInView(matrixRef, { once: true, margin: "-80px" });

  return (
    <div className="min-h-screen pt-24 pb-32">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-16">
          <p className="font-mono text-[10px] tracking-[0.35em] text-[var(--gold-muted)] mb-2">CYBERSECURITY</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Threat <span className="gradient-gold">Operations</span>
          </h1>
          <p className="text-[var(--text-muted)] max-w-xl leading-relaxed">
            Blue team fundamentals, SIEM operations, and hands-on offensive tooling.
            Built through real home lab exercises, not just theory.
          </p>
          <div className="glow-line mt-6 max-w-24" />
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {[
            { icon: Shield, label: "Certs Earned", value: "3", color: "var(--green)" },
            { icon: Eye, label: "THM Labs", value: "50+", color: "var(--gold)" },
            { icon: Zap, label: "Wazuh Rules", value: "12+", color: "var(--blue)" },
            { icon: Lock, label: "MITRE Tactics", value: "14", color: "var(--text-muted)" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-xl p-4 text-center"
            >
              <stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color: stat.color }} />
              <p className="font-display text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="font-mono text-[9px] text-[var(--text-muted)] mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* MITRE ATT&CK Heatmap */}
        <motion.section ref={matrixRef} className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-mono text-[9px] tracking-[0.3em] text-[var(--gold-muted)] mb-1">MITRE ATT&CK</p>
              <h2 className="font-display text-xl font-bold">Detection Coverage Heatmap</h2>
            </div>
            <div className="flex gap-3">
              {[["Low", "#1a2a1a"], ["Med", "#2a3a10"], ["High", "var(--gold)"]].map(([l, c]) => (
                <div key={l} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ background: c }} />
                  <span className="font-mono text-[9px] text-[var(--text-muted)]">{l}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {ATTACK_MATRIX.map((tactic, i) => (
              <motion.div
                key={tactic.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={matrixInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-lg p-3 relative overflow-hidden group cursor-default"
                style={{ minHeight: 80 }}
              >
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: tactic.coverage >= 0.65
                      ? `rgba(212,160,23,${tactic.coverage * 0.5})`
                      : `rgba(0,100,0,${tactic.coverage * 0.8})`,
                  }}
                />
                <div className="relative">
                  <p className="font-mono text-[8px] text-[var(--text-muted)] tracking-wide">{tactic.id}</p>
                  <p className="font-display text-[10px] font-semibold text-[var(--text)] mt-0.5 leading-tight">{tactic.tactic}</p>
                  <p className="font-mono text-[9px] mt-1.5" style={{ color: tactic.coverage >= 0.65 ? "var(--gold)" : "var(--green)" }}>
                    {Math.round(tactic.coverage * 100)}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Skill bars */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl p-8 mb-16"
        >
          <p className="font-mono text-[9px] tracking-[0.3em] text-[var(--gold-muted)] mb-1">SKILL DOMAINS</p>
          <h2 className="font-display text-xl font-bold mb-8">Current Proficiency</h2>
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-5">
            {SKILL_DOMAINS.map((skill, i) => (
              <div key={skill.name}>
                <div className="flex justify-between mb-1.5">
                  <div>
                    <span className="font-display text-sm text-[var(--text)]">{skill.name}</span>
                    <p className="font-mono text-[9px] text-[var(--text-muted)] mt-0.5">{skill.desc}</p>
                  </div>
                  <span className="font-mono text-[11px] shrink-0 ml-4" style={{ color: skill.color }}>{skill.pct}%</span>
                </div>
                <div className="h-1.5 bg-[var(--card)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.05 }}
                    className="h-full rounded-full"
                    style={{ background: skill.color, boxShadow: `0 0 8px ${skill.color}50` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Tool flip cards */}
        <section className="mb-16">
          <p className="font-mono text-[9px] tracking-[0.3em] text-[var(--gold-muted)] mb-1">TOOLSTACK</p>
          <h2 className="font-display text-xl font-bold mb-2">Click any card to flip</h2>
          <p className="font-mono text-[10px] text-[var(--text-muted)] mb-8">Hover/tap to reveal usage context from the home lab</p>

          {TOOL_GROUPS.map((group, gi) => (
            <motion.div
              key={group.group}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: gi * 0.1 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-4 rounded-full" style={{ background: group.color }} />
                <p className="font-mono text-[10px] tracking-wider" style={{ color: group.color }}>{group.group}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {group.tools.map((tool) => (
                  <ToolCard key={tool.name} tool={tool} color={group.color} />
                ))}
              </div>
            </motion.div>
          ))}
        </section>

        {/* Certifications quick strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-gold rounded-xl p-5 flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <p className="font-mono text-[9px] text-[var(--gold)] tracking-wider mb-1">CREDENTIAL STATUS</p>
            <p className="text-[var(--text)] text-sm">ISC2 CC · Google Cyber · Security+ in progress · THM SOC L1 (65%)</p>
          </div>
          <a href="/certifications" className="btn-ghost text-sm gap-1.5">
            Full cert stack <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </motion.div>
      </div>
    </div>
  );
}
