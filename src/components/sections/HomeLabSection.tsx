"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Server, Shield, Terminal, Globe, CheckCircle, Activity } from "lucide-react";
import { Reveal } from "@/components/casefile/Reveal";
import { Stamp } from "@/components/casefile/Stamp";
import { TypeLog } from "@/components/casefile/TypeLog";
import { EASE_OUT } from "@/components/casefile/motion";

/**
 * The home lab, merged into /cybersecurity (round 2) as the #home-lab
 * section. Formerly the whole /homelab page; /homelab now redirects here.
 * Content unchanged apart from its frame: it sits under a section head
 * instead of its own PageHead.
 */

const NODES = [
  {
    id: "DC-01",
    role: "Domain Controller",
    os: "Windows Server 2022",
    ip: "192.168.10.10",
    icon: Server,
    color: "var(--gold)",
    status: "ONLINE",
    services: ["Active Directory DS", "DNS Server", "DHCP Server", "Group Policy", "Event Log Collector"],
    specs: "Core i5 · 16GB RAM · 500GB SSD",
    details: [
      "Domain: HOMELAB.CORP",
      "Forest/Domain functional level: Windows Server 2019",
      "GPO: CIS Benchmark L1 applied",
      "Wazuh agent installed, all events forwarded",
      "PowerShell ScriptBlock logging enabled",
      "Windows Event Forwarding → WAZUH01",
    ],
    x: 50,
    y: 20,
  },
  {
    id: "WEB01",
    role: "Web Server",
    os: "Ubuntu 22.04 LTS",
    ip: "192.168.10.20",
    icon: Globe,
    color: "var(--blue)",
    status: "ONLINE",
    services: ["Nginx (reverse proxy)", "Node.js / PM2", "Let's Encrypt SSL", "UFW Firewall", "fail2ban"],
    specs: "Core i3 · 8GB RAM · 250GB SSD",
    details: [
      "Nginx serving lab web apps on port 443",
      "UFW: only 22, 80, 443 allowed in",
      "fail2ban: SSH brute force blocking",
      "Wazuh agent: file integrity + log monitoring",
      "Sudo logging → Wazuh alert pipeline",
    ],
    x: 15,
    y: 65,
  },
  {
    id: "KALI01",
    role: "Attack Platform",
    os: "Kali Linux 2024.1",
    ip: "192.168.10.30",
    icon: Terminal,
    color: "var(--red)",
    status: "CONTROLLED",
    services: ["Nmap", "Hydra", "Metasploit", "Gobuster", "Burp Suite"],
    specs: "Core i5 · 8GB RAM · 256GB SSD",
    details: [
      "Isolated segment, attack traffic controlled",
      "All attack sessions logged for Wazuh testing",
      "Runs scans against DC-01, WEB01 to test detection",
      "SSH brute force exercises against WEB01",
      "Nmap SYN scans trigger Wazuh rules immediately",
    ],
    x: 85,
    y: 65,
  },
  {
    id: "WAZUH01",
    role: "SIEM / XDR",
    os: "Ubuntu 22.04 LTS",
    ip: "192.168.10.40",
    icon: Shield,
    color: "var(--gold)",
    status: "ONLINE",
    services: ["Wazuh Manager", "Wazuh Dashboard", "Elasticsearch", "Filebeat", "Active Response"],
    specs: "Core i7 · 32GB RAM · 1TB SSD",
    details: [
      "Wazuh 4.x ingesting agents from all 3 hosts",
      "Custom detection rules: SSH brute force, port scan, sudo abuse",
      "Active response: IP block on SSH brute force trigger",
      "Dashboards: authentication events, file integrity, alerts",
      "Alert email notifications configured",
    ],
    x: 50,
    y: 80,
  },
];

const CONNECTIONS = [
  { from: "DC-01", to: "WAZUH01", label: "Event Logs / WEF" },
  { from: "WEB01", to: "WAZUH01", label: "Syslog / FIM" },
  { from: "KALI01", to: "DC-01", label: "Attack Traffic" },
  { from: "KALI01", to: "WEB01", label: "Attack Traffic" },
  { from: "KALI01", to: "WAZUH01", label: "Agent (self-monitor)" },
];

const ALERTS = [
  { id: "ALT-001", severity: "HIGH", rule: "Multiple failed SSH logins", source: "WEB01", time: "12:43:22" },
  { id: "ALT-002", severity: "MED", rule: "Nmap SYN scan detected", source: "DC-01", time: "12:41:08" },
  { id: "ALT-003", severity: "HIGH", rule: "Hydra brute force attempt", source: "WEB01", time: "12:38:55" },
  { id: "ALT-004", severity: "LOW", rule: "New user account created", source: "DC-01", time: "12:35:10" },
  { id: "ALT-005", severity: "MED", rule: "Gobuster web scan", source: "WEB01", time: "12:30:44" },
];

const SEV_COLOR = {
  HIGH: "var(--red)",
  MED: "var(--gold)",
  LOW: "var(--blue)",
};

const SEV_LOG_CLASS = {
  HIGH: "alert",
  MED: "warn",
  LOW: "ok",
};

function NetworkDiagram({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  const nodePositions: Record<string, { cx: number; cy: number }> = {};
  NODES.forEach((n) => {
    nodePositions[n.id] = { cx: n.x, cy: n.y };
  });

  return (
    <div className="relative w-full" style={{ aspectRatio: "16/9", maxHeight: 420 }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {/* Connection lines */}
        {CONNECTIONS.map((conn, i) => {
          const from = nodePositions[conn.from];
          const to = nodePositions[conn.to];
          const isAttack = conn.label.includes("Attack");
          return (
            <g key={i}>
              <motion.line
                x1={from.cx} y1={from.cy} x2={to.cx} y2={to.cy}
                stroke={isAttack ? "rgba(179,35,27,0.55)" : "rgba(154,116,16,0.45)"}
                strokeWidth="0.3"
                strokeDasharray={isAttack ? "1 0.5" : undefined}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: i * 0.2 }}
              />
              {/* Animated packet */}
              {isAttack && (
                <motion.circle
                  r="0.5"
                  fill="rgba(179,35,27,0.85)"
                  animate={{
                    cx: [from.cx, to.cx],
                    cy: [from.cy, to.cy],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeInOut",
                  }}
                />
              )}
            </g>
          );
        })}

        {/* Node circles */}
        {NODES.map((node) => {
          const isSelected = selected === node.id;
          return (
            <g
              key={node.id}
              transform={`translate(${node.x},${node.y})`}
              onClick={() => onSelect(node.id)}
              style={{ cursor: "pointer" }}
            >
              {/* Pulse ring */}
              <motion.circle
                r={isSelected ? 7 : 5}
                fill="none"
                stroke={node.color}
                strokeWidth="0.3"
                opacity="0.3"
                animate={{ r: [5, 8, 5], opacity: [0.3, 0.05, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Node circle */}
              <motion.circle
                r={isSelected ? 5.5 : 4}
                fill="#ece7d9"
                stroke={node.color}
                strokeWidth={isSelected ? 0.6 : 0.35}
                animate={{ scale: isSelected ? 1.1 : 1 }}
                transition={{ duration: 0.3 }}
              />
              {/* Node ID label */}
              <text
                textAnchor="middle"
                y={7}
                fontSize="1.6"
                fill={node.color}
                fontFamily="monospace"
                fontWeight="bold"
              >
                {node.id}
              </text>
              <text
                textAnchor="middle"
                y={10}
                fontSize="1.2"
                fill="#6f6a5c"
                fontFamily="monospace"
              >
                {node.ip}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function HomeLabSection() {
  const [selected, setSelected] = useState<string | null>("DC-01");
  const activeNode = NODES.find((n) => n.id === selected);

  return (
    <section id="home-lab" className="pt-4" style={{ scrollMarginTop: 24 }}>
      <Reveal>
        <div className="cf-sec-head relative">
          <p className="cf-kicker">Home Lab</p>
          <h2 className="cf-h2 mt-2">HomeLab Corp</h2>
          <p className="cf-body mt-3" style={{ maxWidth: 680 }}>
            4-node home security lab. Real hardware. Real domain. Real attacks. Monitored by Wazuh
            SIEM, where every run is triaged and written up.
          </p>
          <span className="absolute -top-5 right-2 sm:right-8">
            <Stamp tone="red" r={-3.4} s={1.06} o={0.94} bw={2.2} delay={250} className="cf-fs-label">
              4 nodes online
            </Stamp>
          </span>
        </div>
      </Reveal>

      {/* Status bar */}
      <Reveal delay={0.05}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {NODES.map((node) => (
            <motion.button
              key={node.id}
              onClick={() => setSelected(node.id)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: NODES.indexOf(node) * 0.1, ease: EASE_OUT }}
              className="p-3 text-left"
              style={{
                background: selected === node.id ? "var(--cf-paper-2)" : "transparent",
                border: selected === node.id ? `2px solid ${node.color}` : "1px solid var(--cf-faint)",
                cursor: "pointer",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: node.status === "CONTROLLED" ? "var(--red)" : "var(--cf-ink)" }} />
                <span className="cf-mono cf-fs-data" style={{ color: node.status === "CONTROLLED" ? "var(--red)" : "var(--cf-ink)" }}>
                  {node.status}
                </span>
              </div>
              <p className="cf-display text-sm" style={{ color: node.color }}>{node.id}</p>
              <p className="cf-mono cf-fs-data text-[var(--cf-muted)]">{node.role}</p>
            </motion.button>
          ))}
        </div>
      </Reveal>

      {/* Main grid */}
      <Reveal delay={0.08}>
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {/* Network diagram */}
          <div className="lg:col-span-2 p-6" style={{ border: "2px solid var(--cf-ink)", background: "transparent" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="cf-mono cf-fs-data tracking-wider mb-0.5" style={{ color: "var(--cf-gold)" }}>NETWORK TOPOLOGY</p>
                <h3 className="cf-display text-sm text-[var(--cf-ink)]">HOMELAB.CORP · 192.168.10.0/24</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" style={{ color: "var(--cf-red)" }} />
                <span className="cf-mono cf-fs-data" style={{ color: "var(--cf-red)" }}>LIVE</span>
              </div>
            </div>
            <NetworkDiagram selected={selected} onSelect={setSelected} />
            <div className="mt-3 flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-px" style={{ background: "rgba(154,116,16,0.55)" }} />
                <span className="cf-mono cf-fs-data text-[var(--cf-muted)]">SIEM Log Flow</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-px" style={{ borderBottom: "1px dashed rgba(179,35,27,0.55)" }} />
                <span className="cf-mono cf-fs-data text-[var(--cf-muted)]">Attack Traffic</span>
              </div>
            </div>
            {/* Forensic-fix: the node states are display states for the
                diagram, labelled as such next to the topology. */}
            <p className="cf-mono cf-fs-data text-[var(--cf-muted)]" style={{ marginTop: 10 }}>
              Home lab display states, not a live feed.
            </p>
            <p className="cf-margin-note" style={{ marginTop: 18 }}>
              Click a node in the diagram or the status cards above to read its file.
            </p>
          </div>

          {/* Node detail */}
          <div style={{ border: "1px solid var(--cf-ink)", background: "transparent", overflow: "hidden" }}>
            {activeNode ? (
              <div className="h-full flex flex-col">
                <div className="px-5 py-4" style={{ background: "var(--cf-paper-2)", borderBottom: "1px solid var(--cf-faint)" }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 flex items-center justify-center"
                      style={{ background: "var(--cf-paper)", border: `1px solid ${activeNode.color}` }}>
                      <activeNode.icon className="w-4 h-4" style={{ color: activeNode.color }} />
                    </div>
                    <div>
                      <p className="cf-display text-sm" style={{ color: activeNode.color }}>{activeNode.id}</p>
                      <p className="cf-mono cf-fs-data text-[var(--cf-muted)]">{activeNode.role}</p>
                    </div>
                  </div>
                  <div className="cf-mono cf-fs-data text-[var(--cf-muted)] space-y-0.5">
                    <p>OS: {activeNode.os}</p>
                    <p>IP: {activeNode.ip}</p>
                    <p>HW: {activeNode.specs}</p>
                  </div>
                </div>

                <div className="p-5 flex-1 overflow-y-auto">
                  <p className="cf-mono cf-fs-data tracking-wider mb-2" style={{ color: "var(--cf-gold)" }}>SERVICES</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {activeNode.services.map((s) => <span key={s} className="tag cf-fs-data">{s}</span>)}
                  </div>

                  <p className="cf-mono cf-fs-data tracking-wider text-[var(--cf-muted)] mb-2">CONFIGURATION NOTES</p>
                  <div className="space-y-1.5">
                    {activeNode.details.map((d) => (
                      <div key={d} className="flex items-start gap-1.5">
                        <CheckCircle className="w-2.5 h-2.5 mt-0.5 shrink-0" style={{ color: "var(--cf-ink)" }} />
                        <p className="cf-mono cf-fs-data text-[var(--cf-ink-soft)]">{d}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-[var(--cf-muted)] cf-mono cf-fs-data">
                Select a node
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {/* Wazuh alerts, as a captured log. Forensic-fix: these rows are a
          scripted sample set for a lab exercise session, so the feed is
          labelled simulated where it renders, the real capture is the
          homepage Exhibit B / LAB-001. */}
      <Reveal delay={0.05}>
        <p className="cf-mono cf-fs-data tracking-widest text-[var(--cf-muted)]" style={{ marginBottom: 10 }}>
          SIMULATED FEED
        </p>
        <TypeLog
          head="Wazuh SIEM · Recent alerts"
          headRight="Lab exercise session · 12:43 UTC"
          lines={ALERTS.map((alert) => (
            <span key={alert.id}>
              <span className="dim">{alert.time}</span>{" "}
              <span className={SEV_LOG_CLASS[alert.severity as keyof typeof SEV_LOG_CLASS]}>
                [{alert.severity}]
              </span>{" "}
              {alert.id} · {alert.rule} · src{" "}
              {alert.id === "ALT-003" ? (
                <span className="cf-redact">████</span>
              ) : (
                alert.source
              )}
            </span>
          ))}
        />
        <div className="flex gap-5" style={{ marginTop: 10 }}>
          {Object.entries(SEV_COLOR).map(([sev, color]) => (
            <div key={sev} className="flex items-center gap-1.5">
              <span className="w-2 h-2" style={{ background: color }} />
              <span className="cf-mono cf-fs-data text-[var(--cf-muted)]">{sev}</span>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal className="mt-12">
        <p className="cf-note">
          Cross-references: how this lab maps to real SOC work is in the threat operations file above, and the
          incident write-ups are on the <Link href="/blog" className="cf-ulink">blog</Link>.
        </p>
      </Reveal>
    </section>
  );
}
