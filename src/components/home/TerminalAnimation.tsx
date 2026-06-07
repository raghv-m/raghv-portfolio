"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const COMMANDS = [
  { cmd: "ssh raghav@192.168.56.104", output: "Connected to WAZUH01 · homecorp.local" },
  { cmd: "systemctl status wazuh-manager", output: "● wazuh-manager.service — active (running)" },
  { cmd: "nmap -sV -p 1-1000 192.168.56.102", output: "23/tcp open  telnet  · 80/tcp open http · 443/tcp open ssl" },
  { cmd: "tail -f /var/log/wazuh/alerts/alerts.json", output: '[ALERT] rule.id:5710 · "SSH brute force" · level:10' },
  { cmd: "python3 parse_logs.py --threat-level high", output: "Found 3 high-severity events · Exporting report..." },
];

export default function TerminalAnimation() {
  const [lines, setLines] = useState<{ type: "cmd" | "out"; text: string }[]>([]);
  const [cmdIndex, setCmdIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "output" | "pause">("typing");

  useEffect(() => {
    if (cmdIndex >= COMMANDS.length) return;
    const current = COMMANDS[cmdIndex];

    if (phase === "typing") {
      if (charIndex < current.cmd.length) {
        const t = setTimeout(() => setCharIndex((c) => c + 1), 35 + Math.random() * 30);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => {
          setLines((prev) => [
            ...prev,
            { type: "cmd", text: current.cmd },
            { type: "out", text: current.output },
          ]);
          setPhase("output");
        }, 120);
        return () => clearTimeout(t);
      }
    }

    if (phase === "output") {
      const t = setTimeout(() => {
        setPhase("pause");
      }, 600);
      return () => clearTimeout(t);
    }

    if (phase === "pause") {
      const t = setTimeout(() => {
        const next = cmdIndex + 1;
        if (next >= COMMANDS.length) {
          setLines([]);
          setCmdIndex(0);
        } else {
          setCmdIndex(next);
        }
        setCharIndex(0);
        setPhase("typing");
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [cmdIndex, charIndex, phase]);

  const currentCmd = phase === "typing"
    ? COMMANDS[cmdIndex]?.cmd.slice(0, charIndex)
    : "";

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "#0d0d0d", border: "1px solid #222" }}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#222] bg-[#111]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="font-mono text-[10px] text-[#444] ml-2">
          raghav@WAZUH01 — bash
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" style={{ boxShadow: "0 0 4px rgba(0,255,136,0.6)" }} />
          <span className="font-mono text-[9px] text-[var(--green)]">LIVE SESSION</span>
        </div>
      </div>

      {/* Terminal body */}
      <div className="p-4 h-52 overflow-hidden space-y-1.5">
        {lines.slice(-8).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-mono text-[11px] leading-relaxed"
          >
            {line.type === "cmd" ? (
              <span>
                <span className="text-[var(--gold)]">raghav@WAZUH01</span>
                <span className="text-[#555]">:</span>
                <span className="text-[var(--blue)]">~</span>
                <span className="text-[#555]">$ </span>
                <span className="text-[var(--text)]">{line.text}</span>
              </span>
            ) : (
              <span className="text-[var(--text-muted)] pl-4">{line.text}</span>
            )}
          </motion.div>
        ))}

        {/* Current typing line */}
        {phase === "typing" && (
          <div className="font-mono text-[11px]">
            <span className="text-[var(--gold)]">raghav@WAZUH01</span>
            <span className="text-[#555]">:</span>
            <span className="text-[var(--blue)]">~</span>
            <span className="text-[#555]">$ </span>
            <span className="text-[var(--text)]">{currentCmd}</span>
            <span className="inline-block w-2 h-3 bg-[var(--gold)] ml-0.5 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
