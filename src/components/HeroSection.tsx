"use client";
import { motion } from "framer-motion";
import { Download, Eye, MapPin, ChevronDown } from "lucide-react";

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const SCAN_LINES = [
  "INITIALIZING SECURITY PROFILE...",
  "LOADING THREAT INTELLIGENCE...",
  "ESTABLISHING SECURE CONNECTION...",
  "IDENTITY VERIFIED: RAGHAV MAHAJAN",
];

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-14 pb-20 cyber-grid"
    >
      {/* Top scan effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ top: "-2px" }}
          animate={{ top: "100%" }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,212,255,0.4)] to-transparent"
        />
      </div>

      {/* Terminal boot sequence */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 glass border border-[rgba(0,212,255,0.2)] rounded-lg p-4 max-w-lg w-full"
      >
        <div className="flex items-center gap-2 mb-3 border-b border-[rgba(0,212,255,0.1)] pb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff3366]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffd700]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#00ff88]" />
          <span className="font-mono text-[10px] text-[#475569] ml-2">terminal — raghv@soc-dev</span>
        </div>
        <div className="space-y-1">
          {SCAN_LINES.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.35 + 0.3, duration: 0.4 }}
              className="font-mono text-[11px] text-[#00d4ff]"
            >
              <span className="text-[#475569]">{">"} </span>
              {line}
              {i === SCAN_LINES.length - 1 && (
                <span className="text-[#00ff88] ml-1">✓</span>
              )}
            </motion.p>
          ))}
        </div>
      </motion.div>

      {/* Main headline */}
      <div className="text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.7 }}
        >
          <p className="font-mono text-xs tracking-[0.3em] text-[#00d4ff] mb-4 uppercase">
            Cybersecurity Portfolio
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="text-5xl sm:text-7xl font-bold tracking-tight mb-4 leading-none"
        >
          <span className="text-white">Raghav</span>
          <br />
          <span className="gradient-text">Mahajan</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.1, duration: 0.7 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#00d4ff]" />
          <p className="font-mono text-sm text-[#94a3b8] tracking-wide text-center">
            SOC Analyst in Training
            <span className="text-[rgba(0,212,255,0.4)] mx-2">|</span>
            Cybersecurity Defensive Security Builder
          </p>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#00d4ff]" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.3, duration: 0.7 }}
          className="text-[#94a3b8] text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-10"
        >
          Building defensive systems through real-world labs, secure development,
          and SOC-style threat analysis.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-10"
        >
          <a
            href="#projects"
            className="group relative flex items-center gap-2 px-5 py-2.5 rounded border border-[#00d4ff] text-[#00d4ff] font-mono text-xs tracking-wider hover:bg-[rgba(0,212,255,0.08)] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all duration-300"
          >
            <Eye className="w-3.5 h-3.5" />
            VIEW PROJECTS
          </a>

          <a
            href="mailto:raaghvv0508@gmail.com?subject=Resume%20Request"
            className="group flex items-center gap-2 px-5 py-2.5 rounded border border-[rgba(0,102,255,0.5)] text-[#6699ff] font-mono text-xs tracking-wider hover:bg-[rgba(0,102,255,0.08)] hover:border-[#0066ff] hover:shadow-[0_0_20px_rgba(0,102,255,0.3)] transition-all duration-300"
          >
            <Download className="w-3.5 h-3.5" />
            REQUEST RESUME
          </a>

          <a
            href="https://linkedin.com/in/raghav-mahajan"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded border border-[rgba(124,58,237,0.4)] text-[#a78bfa] font-mono text-xs tracking-wider hover:bg-[rgba(124,58,237,0.08)] hover:border-[#7c3aed] hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all duration-300"
          >
            <LinkedinIcon />
            LINKEDIN
          </a>

          <a
            href="https://github.com/raghv-m"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded border border-[rgba(148,163,184,0.2)] text-[#94a3b8] font-mono text-xs tracking-wider hover:border-[#94a3b8] hover:text-white transition-all duration-300"
          >
            <GithubIcon />
            GITHUB
          </a>
        </motion.div>

        {/* Credibility line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8, duration: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-[#475569]"
        >
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-[#00d4ff]" />
            Edmonton, AB, Canada
          </span>
          <span className="text-[#1e293b]">·</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
            Active cybersecurity learner
          </span>
          <span className="text-[#1e293b]">·</span>
          <span>Home lab practitioner</span>
        </motion.div>
      </div>

      {/* System status badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 3.1, duration: 0.5 }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 glass border border-[rgba(0,255,136,0.2)] rounded-full px-4 py-1.5 flex items-center gap-2"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
        <span className="font-mono text-[10px] text-[#00ff88] tracking-widest">
          SYSTEM STATUS: LEARNING · BUILDING · AVAILABLE FOR SOC ROLES
        </span>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5, duration: 0.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
      >
        <span className="font-mono text-[9px] text-[#1e293b] tracking-widest">SCROLL</span>
        <ChevronDown className="w-4 h-4 text-[#1e293b] animate-bounce" />
      </motion.div>
    </section>
  );
}
