"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Download, ChevronDown } from "lucide-react";
import TerminalAnimation from "@/components/home/TerminalAnimation";
import SkillMarquee from "@/components/home/SkillMarquee";
import MetricsDashboard from "@/components/home/MetricsDashboard";
import { SparklesCore } from "@/components/ui/sparkles";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });
const SmokeBackground = dynamic(
  () => import("@/components/ui/spooky-smoke-animation").then((m) => m.SmokeBackground),
  { ssr: false }
);

const TYPING_ROLES = [
  "Cybersecurity Analyst",
  "SOC Operations",
  "Threat Detection",
  "Incident Response",
  "Blue Team Defender",
  "Linux Administration",
  "Secure Development",
];

function TypingRole() {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const target = TYPING_ROLES[index];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && displayed.length < target.length) {
      timeout = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 60);
    } else if (!deleting && displayed.length === target.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 30);
    } else if (deleting && displayed.length === 0) {
      timeout = setTimeout(() => {
        setDeleting(false);
        setIndex((i) => (i + 1) % TYPING_ROLES.length);
      }, 0);
    }

    return () => clearTimeout(timeout);
  }, [displayed, deleting, index]);

  return (
    <span className="text-[var(--gold)] terminal-cursor">
      {displayed || " "}
    </span>
  );
}

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden grid-bg pt-14 pb-24">
        {/* 3D background with parallax scale */}
        <motion.div className="absolute inset-0 z-0" style={{ scale: heroScale }}>
          <HeroScene />
        </motion.div>

        {/* Smoke + sparkles layer with bottom fade */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            maskImage: "linear-gradient(to bottom, black 0%, black 65%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 65%, transparent 100%)",
          }}
        >
          <div className="absolute inset-0 opacity-20">
            <SmokeBackground smokeColor="#d4a017" />
          </div>
          <div className="absolute inset-0">
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1.2}
              particleDensity={60}
              particleColor="#d4a017"
              speed={0.6}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 z-0" style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.9) 100%)"
        }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left — text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span className="font-mono text-[10px] tracking-[0.3em] text-[var(--gold-muted)] uppercase">
                Edmonton, Alberta · Available for SOC Roles
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-4 tracking-tight"
            >
              Raghav<br />
              <span className="gradient-white-gold">Mahajan</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="font-display text-lg text-[var(--text-muted)] mb-8 h-7"
            >
              <TypingRole />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-[var(--text-muted)] text-base leading-relaxed max-w-md mb-10"
            >
              Building defensive security systems through real-world home lab operations,
              SOC-style threat analysis, and secure software development.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-wrap gap-3"
            >
              <Link href="/projects" className="btn-gold">
                View My Work <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a href="/resume.pdf" download="Raghav_Mahajan_Resume.pdf" className="btn-ghost">
                <Download className="w-3.5 h-3.5" /> Resume
              </a>
            </motion.div>
          </div>

          {/* Right — terminal */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <TerminalAnimation />

            {/* Status bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-4 glass rounded-lg px-4 py-2.5 flex flex-wrap gap-4"
            >
              {[
                { dot: "var(--green)", label: "ISC2 CC · PASSED" },
                { dot: "var(--green)", label: "Security+ · EARNED 2025" },
                { dot: "var(--blue)", label: "50+ Labs Completed" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: s.dot }} />
                  <span className="font-mono text-[10px] text-[var(--text-muted)]">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 scroll-indicator">
          <span className="font-mono text-[9px] text-[#333] tracking-widest">SCROLL</span>
          <ChevronDown className="w-4 h-4 text-[#333]" />
        </div>
      </section>

      {/* ── Marquee ───────────────────────────────────────────────── */}
      <SkillMarquee />

      {/* ── Metrics ───────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--gold-muted)] mb-2">BY THE NUMBERS</p>
            <h2 className="font-display text-2xl font-bold text-[var(--text)]">Active Defender Profile</h2>
          </motion.div>
          <MetricsDashboard />
        </div>
      </section>

      {/* ── Quick links ───────────────────────────────────────────── */}
      <section className="py-16 px-6 border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: "/homelab", label: "Home Lab", desc: "4-node enterprise simulation · Wazuh SIEM · Attack/defense ops", color: "var(--gold)" },
            { href: "/cybersecurity", label: "Cybersecurity Skills", desc: "MITRE ATT&CK · Detection · Active Directory · GRC", color: "var(--blue)" },
            { href: "/certifications", label: "Certifications", desc: "ISC2 CC · Google Cert · Security+ EARNED", color: "var(--green)" },
            { href: "/experience", label: "Experience", desc: "Security operations · Freelance dev · Linux admin", color: "var(--gold)" },
            { href: "/career", label: "Career Roadmap", desc: "SOC L1 → Security Engineer → Architect", color: "var(--blue)" },
            { href: "/contact", label: "Get in Touch", desc: "Open for SOC Analyst and Blue Team roles", color: "var(--green)" },
          ].map((card) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link
                href={card.href}
                className="block glass rounded-xl p-5 card-lift group h-full"
              >
                <div className="w-1 h-6 rounded-full mb-4" style={{ background: card.color }} />
                <p className="font-display text-sm font-semibold text-[var(--text)] mb-1 group-hover:text-[var(--gold)] transition-colors">
                  {card.label}
                </p>
                <p className="text-[var(--text-muted)] text-xs leading-relaxed">{card.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-[10px] font-mono text-[var(--text-muted)] group-hover:text-[var(--gold)] transition-colors">
                  EXPLORE <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
