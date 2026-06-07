"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { User, Code2, Shield, Zap } from "lucide-react";

const FACTS = [
  {
    icon: Code2,
    label: "NAIT Digital Media & IT",
    value: "Software Development Foundation",
    color: "#00d4ff",
  },
  {
    icon: Zap,
    label: "Freelance Web Dev",
    value: "Since 2022 · Client Projects Delivered",
    color: "#0066ff",
  },
  {
    icon: Shield,
    label: "Physical Security Background",
    value: "Access Control · Incident Response Mindset",
    color: "#7c3aed",
  },
  {
    icon: User,
    label: "Cybersecurity Transition",
    value: "Real Vulnerability Exposure → SOC Path",
    color: "#00ff88",
  },
];

export default function AboutSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="about" ref={ref} className="relative py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="font-mono text-[10px] tracking-[0.35em] text-[#00d4ff] mb-2">
            01 / ABOUT
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Operator Profile
          </h2>
          <div className="h-px w-24 bg-gradient-to-r from-[#00d4ff] to-transparent" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="glass-bright rounded-xl p-8 corner-bracket"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg border border-[rgba(0,212,255,0.3)] flex items-center justify-center bg-[rgba(0,212,255,0.05)]">
                <User className="w-5 h-5 text-[#00d4ff]" />
              </div>
              <div>
                <p className="font-mono text-xs text-[#475569] tracking-wider">ANALYST ID</p>
                <p className="text-white font-semibold">Raghav Mahajan</p>
              </div>
            </div>

            <div className="space-y-4 text-[#94a3b8] text-sm leading-relaxed">
              <p>
                Started in software development through NAIT&apos;s Digital Media & IT program,
                building web applications and delivering freelance projects since 2022. The transition
                from developer to cybersecurity practitioner came from direct exposure to real-world
                vulnerabilities in the systems I built and secured.
              </p>
              <p>
                A background in physical security — including access control and hands-on incident
                response — gave me a foundational understanding of how security operations work
                before translating that mindset into the digital domain.
              </p>
              <p>
                Now actively building toward a SOC Analyst Level 1 role: running a home lab,
                completing TryHackMe paths, studying SIEM tooling (Splunk, Wazuh, ELK), and
                applying OWASP Top 10 principles across development projects.
              </p>
            </div>

            {/* Status indicators */}
            <div className="mt-6 pt-6 border-t border-[rgba(0,212,255,0.1)] grid grid-cols-2 gap-3">
              {[
                { label: "STATUS", value: "Actively Learning", color: "#00ff88" },
                { label: "TARGET ROLE", value: "SOC Analyst L1", color: "#00d4ff" },
                { label: "LOCATION", value: "Edmonton, AB", color: "#94a3b8" },
                { label: "CLEARANCE", value: "Entry Level", color: "#7c3aed" },
              ].map((item) => (
                <div key={item.label} className="glass rounded-lg p-3">
                  <p className="font-mono text-[9px] text-[#475569] tracking-wider mb-1">
                    {item.label}
                  </p>
                  <p
                    className="font-mono text-xs font-semibold"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Fact cards */}
          <div className="space-y-4">
            {FACTS.map((fact, i) => (
              <motion.div
                key={fact.label}
                initial={{ opacity: 0, x: 30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                className="glass rounded-xl p-5 flex items-start gap-4 card-hover"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: `${fact.color}15`,
                    border: `1px solid ${fact.color}30`,
                  }}
                >
                  <fact.icon className="w-4 h-4" style={{ color: fact.color }} />
                </div>
                <div>
                  <p
                    className="font-mono text-xs tracking-wider font-semibold mb-1"
                    style={{ color: fact.color }}
                  >
                    {fact.label}
                  </p>
                  <p className="text-[#94a3b8] text-sm">{fact.value}</p>
                </div>
              </motion.div>
            ))}

            {/* Quote */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="glass rounded-xl p-5 border border-[rgba(124,58,237,0.2)]"
            >
              <p className="font-mono text-[11px] text-[#7c3aed] tracking-wider mb-2">
                // CURRENT MISSION
              </p>
              <p className="text-[#94a3b8] text-sm leading-relaxed">
                Bridging software development and cybersecurity to build defensive systems
                that detect, respond, and adapt to modern threats.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
