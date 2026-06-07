"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface Skill {
  name: string;
  level: number;
  label: string;
  category: string;
  color: string;
}

const SKILLS: Skill[] = [
  { name: "Linux Command Line", level: 72, label: "PROFICIENT", category: "OS & TOOLS", color: "#00d4ff" },
  { name: "Log Analysis", level: 65, label: "DEVELOPING", category: "SOC CORE", color: "#00d4ff" },
  { name: "Incident Response", level: 55, label: "DEVELOPING", category: "SOC CORE", color: "#00d4ff" },
  { name: "Network Fundamentals", level: 68, label: "PROFICIENT", category: "NETWORKING", color: "#0066ff" },
  { name: "Web Security (OWASP)", level: 75, label: "PROFICIENT", category: "WEB SEC", color: "#0066ff" },
  { name: "Splunk SIEM", level: 45, label: "LEARNING", category: "SIEM", color: "#7c3aed" },
  { name: "Wazuh", level: 55, label: "DEVELOPING", category: "SIEM", color: "#7c3aed" },
  { name: "ELK Stack", level: 40, label: "LEARNING", category: "SIEM", color: "#7c3aed" },
  { name: "Threat Detection", level: 60, label: "DEVELOPING", category: "SOC CORE", color: "#00ff88" },
  { name: "React / Next.js", level: 88, label: "STRONG", category: "DEV", color: "#00ff88" },
  { name: "TypeScript", level: 82, label: "STRONG", category: "DEV", color: "#00ff88" },
  { name: "PostgreSQL / SQL", level: 74, label: "PROFICIENT", category: "DEV", color: "#ffd700" },
];

const LABEL_COLORS: Record<string, string> = {
  STRONG: "#00ff88",
  PROFICIENT: "#00d4ff",
  DEVELOPING: "#ffd700",
  LEARNING: "#ff9500",
};

const CATEGORIES = ["SOC CORE", "SIEM", "NETWORKING", "WEB SEC", "OS & TOOLS", "DEV"];

const CATEGORY_COLORS: Record<string, string> = {
  "SOC CORE": "#00d4ff",
  "SIEM": "#7c3aed",
  "NETWORKING": "#0066ff",
  "WEB SEC": "#ff9500",
  "OS & TOOLS": "#00ff88",
  "DEV": "#ffd700",
};

function SkillBar({ skill, index, inView }: { skill: Skill; index: number; inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="glass rounded-lg p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[8px] tracking-wider px-1.5 py-0.5 rounded"
            style={{
              color: CATEGORY_COLORS[skill.category],
              background: `${CATEGORY_COLORS[skill.category]}12`,
              border: `1px solid ${CATEGORY_COLORS[skill.category]}25`,
            }}
          >
            {skill.category}
          </span>
          <span className="text-[#e2e8f0] text-xs font-medium">{skill.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[9px]"
            style={{ color: LABEL_COLORS[skill.label] }}
          >
            {skill.label}
          </span>
          <span className="font-mono text-[10px] text-[#475569]">{skill.level}%</span>
        </div>
      </div>

      {/* Track */}
      <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${skill.level}%` } : {}}
          transition={{ duration: 1.2, delay: index * 0.06 + 0.3, ease: "easeOut" }}
          className="h-full rounded-full relative"
          style={{
            background: `linear-gradient(90deg, ${skill.color}cc, ${skill.color})`,
            boxShadow: `0 0 8px ${skill.color}60`,
          }}
        >
          {/* Leading dot */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
            style={{ background: skill.color, boxShadow: `0 0 6px ${skill.color}` }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function SkillsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const socSkills = SKILLS.filter((s) => ["SOC CORE", "SIEM"].includes(s.category));
  const techSkills = SKILLS.filter((s) => !["SOC CORE", "SIEM"].includes(s.category));

  return (
    <section id="skills" ref={ref} className="relative py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="font-mono text-[10px] tracking-[0.35em] text-[#00d4ff] mb-2">
            05 / SKILLS
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Capability Matrix
          </h2>
          <div className="h-px w-24 bg-gradient-to-r from-[#00d4ff] to-transparent" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* SOC Skills */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-5"
            >
              <span className="w-2 h-2 rounded-full bg-[#00d4ff]" />
              <p className="font-mono text-xs text-[#00d4ff] tracking-wider">SOC / SECURITY SKILLS</p>
            </motion.div>
            <div className="space-y-3">
              {socSkills.map((skill, i) => (
                <SkillBar key={skill.name} skill={skill} index={i} inView={inView} />
              ))}
            </div>
          </div>

          {/* Tech Skills */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 mb-5"
            >
              <span className="w-2 h-2 rounded-full bg-[#00ff88]" />
              <p className="font-mono text-xs text-[#00ff88] tracking-wider">TECHNICAL / DEV SKILLS</p>
            </motion.div>
            <div className="space-y-3">
              {techSkills.map((skill, i) => (
                <SkillBar key={skill.name} skill={skill} index={i} inView={inView} />
              ))}
            </div>
          </div>
        </div>

        {/* Maturity legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-10 glass rounded-xl p-6"
        >
          <p className="font-mono text-[10px] text-[#475569] tracking-wider mb-4">
            SECURITY MATURITY SCALE
          </p>
          <div className="flex flex-wrap gap-6">
            {Object.entries(LABEL_COLORS).map(([label, color]) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="font-mono text-[10px] text-[#94a3b8]">{label}</span>
              </div>
            ))}
          </div>
          <p className="font-mono text-[10px] text-[#1e293b] mt-4">
            // Percentages represent personal confidence level, not certification status.
            // All SOC skills are actively improving through hands-on lab work.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
