"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Menu, X, Terminal } from "lucide-react";

const NAV_LINKS = [
  { label: "ABOUT", href: "#about" },
  { label: "PATH", href: "#path" },
  { label: "PROJECTS", href: "#projects" },
  { label: "HOME LAB", href: "#lab" },
  { label: "SKILLS", href: "#skills" },
  { label: "CONTACT", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-CA", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "America/Edmonton",
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[rgba(2,8,23,0.95)] backdrop-blur-xl border-b border-[rgba(0,212,255,0.15)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <a href="#hero" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded border border-[rgba(0,212,255,0.4)] flex items-center justify-center group-hover:border-[#00d4ff] group-hover:shadow-[0_0_12px_rgba(0,212,255,0.4)] transition-all duration-300">
              <Shield className="w-3.5 h-3.5 text-[#00d4ff]" />
            </div>
            <span className="font-mono text-sm font-semibold text-[#00d4ff] tracking-wider">
              raghv.dev
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-mono text-[10px] tracking-widest text-[#475569] hover:text-[#00d4ff] transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Status + time */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
              <span className="font-mono text-[10px] text-[#00ff88] tracking-wider">SYS ONLINE</span>
            </div>
            <div className="font-mono text-[10px] text-[#475569] border border-[rgba(0,212,255,0.1)] px-2 py-0.5 rounded">
              <Terminal className="w-2.5 h-2.5 inline mr-1 text-[#00d4ff]" />
              {time} MDT
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-[#94a3b8] hover:text-[#00d4ff] transition-colors"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-14 left-0 right-0 z-40 bg-[rgba(2,8,23,0.98)] backdrop-blur-xl border-b border-[rgba(0,212,255,0.15)] py-4"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-6 py-3 font-mono text-xs tracking-widest text-[#475569] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.05)] transition-all"
              >
                {link.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
