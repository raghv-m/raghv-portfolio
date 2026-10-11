"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Download } from "lucide-react";

const LINKS = [
 { href: "/about", label: "About" },
{ href: "/experience", label: "Experience" },
{ href: "/career", label: "Career" },
{ href: "/certifications", label: "Certs" },
{ href: "/cybersecurity", label: "Cybersecurity" },
{ href: "/homelab", label: "Home Lab" },
{ href: "/portfolio", label: "Portfolio" },
{ href: "/blog", label: "Blog" },
{ href: "/estimate", label: "Estimate" },
{ href: "/contact", label: "Contact" },
{ href: "/auth/login", label: "Client login" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // While the mobile menu is open: Escape closes it and the page behind doesn't scroll.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return (
    <>
      <motion.header
        initial={reduceMotion ? false : { y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled || open ? "bg-[rgba(10,10,10,0.92)] backdrop-blur-xl border-[#222]" : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" aria-label="RAGHV.DEV home" className="flex items-center opacity-95 hover:opacity-100 transition-opacity">
            {/* The logo is above the fold on every page: load it right away, never lazily. */}
            <Image src="/logo-mobile.svg" alt="RAGHV.DEV" width={110} height={44} priority unoptimized className="h-10 w-auto" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden xl:flex items-center gap-1" aria-label="Main">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`nav-link relative px-3 py-1.5 font-display text-xs font-medium tracking-wide transition-colors duration-200 ${
                    active ? "text-[var(--gold)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      className="absolute bottom-0 left-3 right-3 h-px bg-[var(--gold)]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Status + resume + mobile toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden xl:flex items-center gap-1.5">
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
              className="xl:hidden -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={open ? "close" : "open"}
                  initial={reduceMotion ? false : { opacity: 0, rotate: -45 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, rotate: 45 }}
                  transition={{ duration: 0.15 }}
                  className="flex"
                >
                  {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu: full-height panel that slides in from the right */}
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
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={reduceMotion ? { opacity: 0 } : { x: "100%" }}
              animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 max-w-[85vw] bg-[rgba(10,10,10,0.99)] backdrop-blur-xl flex flex-col"
              style={{ borderLeft: "1px solid #222" }}
            >
              <div className="flex items-center justify-between px-6 h-14">
                <Image src="/logo-mobile.svg" alt="RAGHV.DEV" width={100} height={40} unoptimized className="h-9 w-auto" />
                <button onClick={() => setOpen(false)} aria-label="Close menu" autoFocus className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-4" aria-label="Main">
                {LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.025, duration: 0.25, ease: "easeOut" }}
                  >
                    <Link
                      href={link.href}
                      aria-current={pathname === link.href ? "page" : undefined}
                      className={`flex items-center px-6 min-h-[44px] font-display text-sm transition-colors border-l-2 ${
                        pathname === link.href
                          ? "text-[var(--gold)] border-[var(--gold)]"
                          : "text-[var(--text-muted)] hover:text-[var(--text)] border-transparent"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
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
