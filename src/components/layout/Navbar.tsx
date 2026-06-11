"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Menu, X, Download } from "lucide-react";

const LINKS = [
 { href: "/about", label: "About" },
{ href: "/experience", label: "Experience" },
{ href: "/career", label: "Career" },
{ href: "/certifications", label: "Certs" },
{ href: "/cybersecurity", label: "Cybersecurity" },
{ href: "/homelab", label: "Home Lab" },
{ href: "/projects", label: "Projects" },
{ href: "/blog", label: "Blog" },
{ href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return (
    <>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-[rgba(10,10,10,0.95)] backdrop-blur-xl border-b border-[#222]" : "bg-transparent"
        }`}
      >
        {/* Scroll progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[1px] origin-left"
          style={{ scaleX, background: "linear-gradient(90deg, var(--gold), var(--gold-light))" }}
        />
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 border border-[rgba(212,160,23,0.4)] rounded flex items-center justify-center group-hover:border-[var(--gold)] group-hover:shadow-[0_0_10px_rgba(212,160,23,0.3)] transition-all duration-300">
              <Shield className="w-3.5 h-3.5 text-[var(--gold)]" />
            </div>
            <span className="font-mono text-sm font-semibold text-[var(--gold)] tracking-wider">
              raghv.dev
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-1.5 font-display text-xs font-medium tracking-wide transition-colors duration-200 ${
                    active ? "text-[var(--gold)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {link.label}
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute bottom-0 left-3 right-3 h-px bg-[var(--gold)]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Status + resume + mobile toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] pulse-green" />
              <span className="font-mono text-[10px] text-[var(--green)] tracking-wider">AVAILABLE</span>
            </div>
            <a
              href="/resume.pdf"
              download="Raghav_Mahajan_Resume.pdf"
              className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] px-3 py-1.5 rounded transition-all hover:border-[var(--gold)] hover:text-[var(--gold)]"
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              <Download className="w-3 h-3" />
              Resume
            </a>
            <button
              className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu — full-height slide-in from right */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-[rgba(10,10,10,0.99)] backdrop-blur-xl flex flex-col"
              style={{ borderLeft: "1px solid #222" }}
            >
              <div className="flex items-center justify-between px-6 h-14">
                <span className="font-mono text-sm font-semibold text-[var(--gold)]">raghv.dev</span>
                <button onClick={() => setOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-4">
                {LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center px-6 min-h-[44px] font-display text-sm transition-colors ${
                      pathname === link.href
                        ? "text-[var(--gold)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="px-6 pb-8 pt-4 border-t border-[#222] flex flex-col gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" style={{ boxShadow: "0 0 6px rgba(0,255,136,0.6)" }} />
                  <span className="font-mono text-[10px] text-[var(--green)] tracking-wider">AVAILABLE FOR SOC ROLES</span>
                </div>
                <a
                  href="/resume.pdf"
                  download="Raghav_Mahajan_Resume.pdf"
                  className="flex items-center justify-center gap-2 min-h-[44px] font-mono text-xs rounded transition-all"
                  style={{ border: "1px solid var(--gold)", color: "var(--gold)", background: "rgba(212,160,23,0.06)" }}
                  onClick={() => setOpen(false)}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Resume
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
