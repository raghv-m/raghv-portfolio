"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Server, Shield, Terminal, Globe, AlertTriangle, CheckCircle, Activity } from "lucide-react";
import dynamic from "next/dynamic";
import { SparklesCore } from "@/components/ui/sparkles";
const SmokeBackground = dynamic(
  () => import("@/components/ui/spooky-smoke-animation").then((m) => m.SmokeBackground),
  { ssr: false }
);

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
      "Wazuh agent installed — all events forwarded",
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
      "Isolated segment — attack traffic controlled",
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
    color: "var(--green)",
    status: "ONLINE",
    services: ["Wazuh Manager", "Wazuh Dashboard", "Elasticsearch", "Filebeat", "Active Response"],
    specs: "Core i7 · 32GB RAM · 1TB SSD",
    details: [
      "Wazuh 4.x — ingesting agents from all 3 hosts",
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
                stroke={isAttack ? "rgba(255,68,68,0.4)" : "rgba(212,160,23,0.2)"}
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
                  fill="rgba(255,68,68,0.8)"
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
                fill="rgba(10,10,10,0.9)"
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
                fill="rgba(255,255,255,0.4)"
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

export default function HomelabPage() {
  const [selected, setSelected] = useState<string | null>("DC-01");
  const activeNode = NODES.find((n) => n.id === selected);

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
          <div className="absolute inset-0 opacity-35">
            <SmokeBackground smokeColor="#00ff88" />
          </div>
          <div className="absolute inset-0">
            <SparklesCore
              background="transparent"
              minSize={0.3}
              maxSize={1.1}
              particleDensity={40}
              particleColor="#00ff88"
              speed={0.4}
              className="w-full h-full"
            />
          </div>
        </div>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(10,10,10,0.25) 0%, rgba(10,10,10,0.96) 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-2">
            <p className="font-mono text-[10px] tracking-[0.35em] text-[var(--gold-muted)] mb-2">HOME LAB</p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              HomeLab <span className="gradient-gold">Corp</span>
            </h1>
            <p className="text-[var(--text-muted)] max-w-xl leading-relaxed">
              4-node enterprise security simulation. Real hardware. Real domain. Real attacks.
              Monitored by Wazuh SIEM — generating authentic blue team experience.
            </p>
            <div className="glow-line mt-6 max-w-24" />
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">

        {/* Status bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {NODES.map((node) => (
            <motion.button
              key={node.id}
              onClick={() => setSelected(node.id)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: NODES.indexOf(node) * 0.1 }}
              className={`glass rounded-xl p-3 text-left transition-all`}
              style={selected === node.id ? { outline: `1px solid ${node.color}`, outlineOffset: "-1px" } : {}}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: node.status === "CONTROLLED" ? "var(--red)" : "var(--green)" }} />
                <span className="font-mono text-[8px]" style={{ color: node.status === "CONTROLLED" ? "var(--red)" : "var(--green)" }}>
                  {node.status}
                </span>
              </div>
              <p className="font-display text-sm font-bold" style={{ color: node.color }}>{node.id}</p>
              <p className="font-mono text-[9px] text-[var(--text-muted)]">{node.role}</p>
            </motion.button>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {/* Network diagram */}
          <div className="lg:col-span-2 glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-mono text-[9px] tracking-wider text-[var(--gold-muted)] mb-0.5">NETWORK TOPOLOGY</p>
                <h2 className="font-display text-sm font-bold text-[var(--text)]">HOMELAB.CORP — 192.168.10.0/24</h2>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[var(--green)]" />
                <span className="font-mono text-[9px] text-[var(--green)]">LIVE</span>
              </div>
            </div>
            <NetworkDiagram selected={selected} onSelect={setSelected} />
            <div className="mt-3 flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-px" style={{ background: "rgba(212,160,23,0.4)" }} />
                <span className="font-mono text-[9px] text-[var(--text-muted)]">SIEM Log Flow</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-px border-b border-dashed border-[rgba(255,68,68,0.4)]" />
                <span className="font-mono text-[9px] text-[var(--text-muted)]">Attack Traffic</span>
              </div>
            </div>
          </div>

          {/* Node detail */}
          <div className="glass rounded-2xl overflow-hidden">
            {activeNode ? (
              <div className="h-full flex flex-col">
                <div className="px-5 py-4 border-b border-[var(--border)]" style={{ background: `${activeNode.color}06` }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${activeNode.color}12`, border: `1px solid ${activeNode.color}25` }}>
                      <activeNode.icon className="w-4 h-4" style={{ color: activeNode.color }} />
                    </div>
                    <div>
                      <p className="font-display font-bold text-sm" style={{ color: activeNode.color }}>{activeNode.id}</p>
                      <p className="font-mono text-[9px] text-[var(--text-muted)]">{activeNode.role}</p>
                    </div>
                  </div>
                  <div className="font-mono text-[9px] text-[var(--text-muted)] space-y-0.5">
                    <p>OS: {activeNode.os}</p>
                    <p>IP: {activeNode.ip}</p>
                    <p>HW: {activeNode.specs}</p>
                  </div>
                </div>

                <div className="p-5 flex-1 overflow-y-auto">
                  <p className="font-mono text-[9px] tracking-wider text-[var(--gold)] mb-2">SERVICES</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {activeNode.services.map((s) => <span key={s} className="tag text-[9px]">{s}</span>)}
                  </div>

                  <p className="font-mono text-[9px] tracking-wider text-[var(--text-muted)] mb-2">CONFIGURATION NOTES</p>
                  <div className="space-y-1.5">
                    {activeNode.details.map((d) => (
                      <div key={d} className="flex items-start gap-1.5">
                        <CheckCircle className="w-2.5 h-2.5 mt-0.5 shrink-0 text-[var(--green)]" />
                        <p className="font-mono text-[9px] text-[var(--text-muted)]">{d}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-[var(--text-muted)] font-mono text-[10px]">
                Select a node
              </div>
            )}
          </div>
        </div>

        {/* Wazuh alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl overflow-hidden"
        >
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border)] bg-[var(--card)]">
            <AlertTriangle className="w-4 h-4 text-[var(--gold)]" />
            <p className="font-mono text-[10px] tracking-wider text-[var(--gold)]">WAZUH SIEM — RECENT ALERTS</p>
            <span className="ml-auto font-mono text-[9px] text-[var(--text-muted)]">Lab exercise session · 12:43 UTC</span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {ALERTS.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-4 px-6 py-3 hover:bg-[var(--card)] transition-colors"
              >
                <span className="font-mono text-[8px] text-[var(--text-muted)] shrink-0">{alert.time}</span>
                <span
                  className="font-mono text-[8px] px-2 py-0.5 rounded shrink-0"
                  style={{ color: SEV_COLOR[alert.severity as keyof typeof SEV_COLOR], background: `${SEV_COLOR[alert.severity as keyof typeof SEV_COLOR]}12` }}
                >
                  {alert.severity}
                </span>
                <span className="font-mono text-[9px] text-[var(--text)] flex-1">{alert.rule}</span>
                <span className="font-mono text-[9px] text-[var(--gold)] shrink-0">{alert.source}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
