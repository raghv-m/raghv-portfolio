"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Code2, AlertTriangle, Target, Monitor } from "lucide-react";

const TIMELINE = [
  {
    icon: Shield,
    phase: "PHASE 01",
    title: "Physical Security",
    period: "2020 – 2022",
    color: "#7c3aed",
    items: [
      "Access control systems management",
      "Physical incident response protocols",
      "Security monitoring and patrol procedures",
      "Built foundation: security mindset before the screen",
    ],
  },
  {
    icon: Code2,
    phase: "PHASE 02",
    title: "Software Development",
    period: "2022 – 2023",
    color: "#0066ff",
    items: [
      "NAIT Digital Media & IT program",
      "Freelance web development (React, Next.js, Node.js)",
      "Built client-facing apps: EZ Plumbing, Fatima's Kitchen, ImmigrateX",
      "RBAC implementation, API design, database management",
    ],
  },
  {
    icon: AlertTriangle,
    phase: "PHASE 03",
    title: "Vulnerability Exposure",
    period: "2023",
    color: "#ffd700",
    items: [
      "Discovered real-world vulnerabilities in apps I built",
      "Exposure to injection, auth bypass, and misconfiguration risks",
      "Began studying OWASP Top 10 in depth",
      "Triggered the shift: developer → security practitioner",
    ],
  },
  {
    icon: Monitor,
    phase: "PHASE 04",
    title: "Cybersecurity Learning Path",
    period: "2024 – Present",
    color: "#00d4ff",
    items: [
      "TryHackMe — SOC Level 1 path, Advent of Cyber",
      "SIEM tools: Splunk, Wazuh, ELK Stack",
      "Home lab: Kali Linux + Ubuntu server environment",
      "Log analysis, threat detection, incident response workflows",
      "Linux command line, network fundamentals, web security",
    ],
  },
  {
    icon: Target,
    phase: "TARGET",
    title: "SOC Analyst Level 1",
    period: "2025 →",
    color: "#00ff88",
    items: [
      "Entry-level SOC Analyst role in Edmonton, AB or remote",
      "Tier 1 alert triage and escalation",
      "SIEM monitoring and rule creation",
      "Security incident documentation and response",
    ],
  },
];

const CURRENT_TOOLS = [
  { name: "TryHackMe", tag: "ACTIVE", color: "#00d4ff" },
  { name: "OWASP Top 10", tag: "STUDYING", color: "#00d4ff" },
  { name: "Linux CLI", tag: "DAILY", color: "#00ff88" },
  { name: "Splunk", tag: "LEARNING", color: "#ffd700" },
  { name: "Wazuh", tag: "HOME LAB", color: "#7c3aed" },
  { name: "ELK Stack", tag: "LEARNING", color: "#0066ff" },
  { name: "Kali Linux", tag: "HOME LAB", color: "#ff3366" },
  { name: "Wireshark", tag: "PRACTICING", color: "#00d4ff" },
];

export default function SOCPathSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="path" ref={ref} className="relative py-28 px-6 bg-[rgba(6,18,42,0.3)]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="font-mono text-[10px] tracking-[0.35em] text-[#00d4ff] mb-2">
            02 / SOC PATH
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Mission Timeline
          </h2>
          <div className="h-px w-24 bg-gradient-to-r from-[#00d4ff] to-transparent" />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Timeline */}
          <div className="lg:col-span-2 relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-[rgba(0,212,255,0.4)] via-[rgba(0,102,255,0.2)] to-transparent" />

            <div className="space-y-8">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={item.phase}
                  initial={{ opacity: 0, x: -30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="flex gap-6"
                >
                  {/* Node */}
                  <div className="relative z-10 shrink-0">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: `${item.color}15`,
                        border: `1px solid ${item.color}40`,
                        boxShadow: `0 0 12px ${item.color}20`,
                      }}
                    >
                      <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="glass rounded-xl p-5 flex-1 card-hover">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p
                          className="font-mono text-[9px] tracking-widest mb-1"
                          style={{ color: item.color }}
                        >
                          {item.phase}
                        </p>
                        <h3 className="text-white font-semibold text-sm">{item.title}</h3>
                      </div>
                      <span className="font-mono text-[10px] text-[#475569] glass px-2 py-1 rounded">
                        {item.period}
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {item.items.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-2 text-[#94a3b8] text-[12px] leading-relaxed"
                        >
                          <span
                            className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                            style={{ background: item.color }}
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Current tools panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="space-y-4"
          >
            <div className="glass-bright rounded-xl p-6 corner-bracket">
              <p className="font-mono text-[10px] tracking-[0.3em] text-[#00d4ff] mb-4">
                ACTIVE TOOLS
              </p>
              <div className="flex flex-wrap gap-2">
                {CURRENT_TOOLS.map((tool) => (
                  <div
                    key={tool.name}
                    className="glass rounded-lg px-3 py-2 flex items-center gap-2"
                    style={{ borderColor: `${tool.color}25` }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: tool.color }}
                    />
                    <span className="text-[#94a3b8] text-xs">{tool.name}</span>
                    <span
                      className="font-mono text-[8px] tracking-wider px-1.5 py-0.5 rounded"
                      style={{
                        color: tool.color,
                        background: `${tool.color}10`,
                        border: `1px solid ${tool.color}25`,
                      }}
                    >
                      {tool.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications goal */}
            <div className="glass rounded-xl p-6 border border-[rgba(0,255,136,0.15)]">
              <p className="font-mono text-[10px] tracking-[0.3em] text-[#00ff88] mb-4">
                CERT ROADMAP
              </p>
              <div className="space-y-3">
                {[
                  { name: "CompTIA Security+", status: "PLANNED", pct: 20 },
                  { name: "TryHackMe SOC L1", status: "IN PROGRESS", pct: 65 },
                  { name: "Google Cyber Cert", status: "EXPLORING", pct: 10 },
                ].map((cert) => (
                  <div key={cert.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[#94a3b8] text-xs">{cert.name}</span>
                      <span className="font-mono text-[9px] text-[#475569]">{cert.status}</span>
                    </div>
                    <div className="h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${cert.pct}%` } : {}}
                        transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-[#00d4ff] to-[#0066ff]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TryHackMe stats */}
            <div className="glass rounded-xl p-6 border border-[rgba(0,212,255,0.15)]">
              <p className="font-mono text-[10px] tracking-[0.3em] text-[#00d4ff] mb-4">
                TRYHACKME
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Rooms Done", value: "40+" },
                  { label: "Global Rank", value: "Top 10%" },
                  { label: "Streak", value: "Active" },
                  { label: "Path", value: "SOC L1" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-[#00d4ff] font-bold text-xl">{stat.value}</p>
                    <p className="font-mono text-[9px] text-[#475569] mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
