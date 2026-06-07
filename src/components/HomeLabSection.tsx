"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Monitor, Server, Globe, Activity } from "lucide-react";

const NODES = [
  {
    id: "kali",
    label: "Kali Linux",
    sublabel: "Attacker Simulation",
    icon: Monitor,
    color: "#ff3366",
    x: "10%",
    y: "35%",
    desc: "Penetration testing tools, Metasploit, Nmap, Burp Suite",
  },
  {
    id: "ubuntu",
    label: "Ubuntu Server",
    sublabel: "Target Environment",
    icon: Server,
    color: "#ffd700",
    x: "42%",
    y: "15%",
    desc: "Apache, SSH, vulnerable web apps, log sources",
  },
  {
    id: "webapps",
    label: "Web Apps",
    sublabel: "Vulnerable Test Env",
    icon: Globe,
    color: "#0066ff",
    x: "42%",
    y: "70%",
    desc: "DVWA, Juice Shop, intentionally vulnerable targets",
  },
  {
    id: "siem",
    label: "SIEM Layer",
    sublabel: "Wazuh + ELK",
    icon: Activity,
    color: "#00d4ff",
    x: "75%",
    y: "42%",
    desc: "Log aggregation, alert rules, event correlation, dashboards",
  },
];

const CONNECTIONS = [
  { from: "kali", to: "ubuntu", label: "attacks", color: "#ff3366" },
  { from: "kali", to: "webapps", label: "exploits", color: "#ff3366" },
  { from: "ubuntu", to: "siem", label: "logs →", color: "#ffd700" },
  { from: "webapps", to: "siem", label: "events →", color: "#0066ff" },
];

const LOG_STREAM = [
  "$ nmap -sV -O 192.168.1.0/24",
  "> Discovered host: 192.168.1.10 (Ubuntu 22.04)",
  "> Open ports: 22/ssh, 80/http, 8080/http",
  "$ hydra -l admin -P rockyou.txt ssh://192.168.1.10",
  "> [WARN] Brute-force attempt detected | Wazuh alert fired",
  "> Rule 5712: sshd: brute force | Level: 10 | ALERT",
  "$ curl http://192.168.1.10/dvwa/login.php",
  "> [INFO] HTTP GET | /dvwa/login.php | 200 OK | Logged to ELK",
  "> Dashboard updated | New event ingested | Kibana: LIVE",
];

export default function HomeLabSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % LOG_STREAM.length);
    }, 2200);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <section id="lab" ref={ref} className="relative py-28 px-6 bg-[rgba(6,18,42,0.3)]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="font-mono text-[10px] tracking-[0.35em] text-[#00d4ff] mb-2">
            04 / HOME LAB
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Lab Topology
          </h2>
          <div className="h-px w-24 bg-gradient-to-r from-[#00d4ff] to-transparent" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Network diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="glass-bright rounded-xl p-6 corner-bracket"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-[10px] text-[#00d4ff] tracking-wider">
                SOC ANALYST TRAINING ENVIRONMENT
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                <span className="font-mono text-[9px] text-[#00ff88]">ACTIVE</span>
              </div>
            </div>

            {/* Diagram */}
            <div className="relative bg-[rgba(2,8,23,0.6)] rounded-lg" style={{ height: "320px" }}>
              {/* SVG connections */}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                {CONNECTIONS.map((conn, i) => {
                  const from = NODES.find((n) => n.id === conn.from)!;
                  const to = NODES.find((n) => n.id === conn.to)!;
                  const x1 = parseFloat(from.x) + 8;
                  const y1 = parseFloat(from.y) + 8;
                  const x2 = parseFloat(to.x) + 8;
                  const y2 = parseFloat(to.y) + 8;

                  return (
                    <g key={i}>
                      <line
                        x1={`${x1}%`} y1={`${y1}%`}
                        x2={`${x2}%`} y2={`${y2}%`}
                        stroke={conn.color}
                        strokeWidth="1"
                        strokeOpacity="0.3"
                        strokeDasharray="4 4"
                      />
                      {/* Animated packet dot */}
                      <circle r="3" fill={conn.color} style={{ filter: `drop-shadow(0 0 4px ${conn.color})` }}>
                        <animateMotion
                          dur={`${2.5 + i * 0.5}s`}
                          repeatCount="indefinite"
                          path={`M ${x1}% ${y1}% L ${x2}% ${y2}%`}
                        />
                      </circle>
                    </g>
                  );
                })}
              </svg>

              {/* Nodes */}
              {NODES.map((node, i) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.4 + i * 0.15, type: "spring", stiffness: 200 }}
                  className="absolute z-10"
                  style={{ left: node.x, top: node.y, transform: "translate(-50%, -50%)" }}
                >
                  <div
                    className="relative group"
                    title={node.desc}
                  >
                    {/* Pulse ring */}
                    <motion.div
                      animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                      className="absolute inset-0 rounded-xl"
                      style={{ background: node.color, filter: "blur(4px)" }}
                    />

                    <div
                      className="relative w-16 h-16 rounded-xl flex flex-col items-center justify-center"
                      style={{
                        background: `${node.color}15`,
                        border: `1px solid ${node.color}40`,
                        boxShadow: `0 0 16px ${node.color}20`,
                      }}
                    >
                      <node.icon className="w-5 h-5 mb-1" style={{ color: node.color }} />
                      <span className="font-mono text-[7px] text-white text-center leading-tight px-1">
                        {node.label}
                      </span>
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                      <div className="glass rounded-lg p-2 w-40 border border-[rgba(0,212,255,0.2)]">
                        <p className="font-mono text-[8px] text-[#00d4ff] mb-1">{node.sublabel}</p>
                        <p className="text-[#94a3b8] text-[9px] leading-snug">{node.desc}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Alert indicator */}
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-3 right-3 flex items-center gap-1.5 glass rounded px-2 py-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff3366] animate-pulse" />
                <span className="font-mono text-[8px] text-[#ff3366]">ALERT ACTIVE</span>
              </motion.div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {NODES.map((node) => (
                <div key={node.id} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded" style={{ background: node.color }} />
                  <span className="font-mono text-[9px] text-[#475569]">
                    {node.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right panel */}
          <div className="space-y-5">
            {/* Live terminal log */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="glass rounded-xl overflow-hidden border border-[rgba(0,212,255,0.15)]"
            >
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[rgba(0,212,255,0.1)] bg-[rgba(0,212,255,0.03)]">
                <span className="w-2 h-2 rounded-full bg-[#ff3366]" />
                <span className="w-2 h-2 rounded-full bg-[#ffd700]" />
                <span className="w-2 h-2 rounded-full bg-[#00ff88]" />
                <span className="font-mono text-[10px] text-[#475569] ml-2">
                  lab-session — wazuh@soc-training
                </span>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                  <span className="font-mono text-[9px] text-[#00ff88]">LIVE</span>
                </div>
              </div>

              <div className="p-4 space-y-1 h-52 overflow-hidden">
                {LOG_STREAM.slice(0, logIndex + 1).map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-mono text-[11px] leading-relaxed"
                  >
                    <span className={
                      line.startsWith(">  [WARN]") ? "text-[#ffd700]" :
                      line.startsWith("> [INFO]") ? "text-[#00d4ff]" :
                      line.startsWith(">") ? "text-[#00ff88]" :
                      "text-[#94a3b8]"
                    }>
                      {line}
                    </span>
                  </motion.p>
                ))}
                <span className="font-mono text-[11px] text-[#00d4ff] cursor">_</span>
              </div>
            </motion.div>

            {/* Spec cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "ATTACKER NODE", value: "Kali Linux 2024.x", sub: "VirtualBox VM", color: "#ff3366" },
                { label: "TARGET NODE", value: "Ubuntu 22.04 LTS", sub: "VirtualBox VM", color: "#ffd700" },
                { label: "LOGGING LAYER", value: "Wazuh + ELK", sub: "Centralized SIEM", color: "#00d4ff" },
                { label: "TEST APPS", value: "DVWA + Juice Shop", sub: "Vuln environments", color: "#0066ff" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="glass rounded-xl p-4"
                >
                  <p className="font-mono text-[8px] tracking-wider mb-2" style={{ color: item.color }}>
                    {item.label}
                  </p>
                  <p className="text-white text-xs font-medium">{item.value}</p>
                  <p className="font-mono text-[9px] text-[#475569] mt-0.5">{item.sub}</p>
                </motion.div>
              ))}
            </div>

            {/* Purpose note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.9 }}
              className="glass rounded-xl p-5 border border-[rgba(124,58,237,0.2)]"
            >
              <p className="font-mono text-[9px] text-[#7c3aed] tracking-wider mb-2">
                // LAB PURPOSE
              </p>
              <p className="text-[#94a3b8] text-xs leading-relaxed">
                Safe, isolated environment for practicing attack simulation, defense monitoring,
                log analysis, and SIEM rule creation — replicating real SOC analyst workflows
                without touching production systems.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
