"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Download } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/casefile/ThemeToggle";
import { LiveClock } from "@/components/casefile/LiveClock";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/experience", label: "Experience" },
  { href: "/certifications", label: "Certs" },
  { href: "/cybersecurity", label: "Cybersecurity" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
  { href: "/newsletter", label: "Newsletter" },
  { href: "/hobbies", label: "Hobbies" },
  { href: "/contact", label: "Contact" },
  { href: "/auth/login", label: "Client login" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

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
  }, [open ]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return (
    <>
      <header className="cf-scope cf-load-fade" style={{ borderBottom: "3px double var(--cf-ink)" }}>
        <div className="cf-wrap">
          {/* Dossier strip: the file header, printed at the top of every page. */}
          <div
            className="cf-mono flex items-center gap-3 sm:gap-5 pt-3 pb-2.5 text-[10.5px] sm:text-[11px] uppercase"
            style={{ letterSpacing: "0.09em", borderBottom: "1px solid var(--cf-faint)" }}
          >
            <Link href="/" aria-label="raghv.dev home" className="flex items-center gap-3 shrink-0">
              <Logo size={27} style={{ color: "var(--cf-ink)" }} />
              <Image
                src="/images/subject-photo.jpg"
                alt="Raghav Mahajan"
                width={28}
                height={28}
                priority
                className="block border border-[var(--cf-ink)] grayscale contrast-125"
                style={{ objectFit: "cover", objectPosition: "50% 40%" }}
              />
              <span className="hidden md:inline">
                <b>File No.</b> YEG-2026-001
              </span>
              <span className="md:hidden font-bold">YEG-2026-001</span>
            </Link>
            <span className="hidden sm:inline">
              <b>Subject:</b> Raghav Mahajan
            </span>
            <span className="hidden lg:inline">
              <b>Filed:</b> Edmonton, AB · 53.5461° N, 113.4938° W
            </span>
            <span className="ml-auto hidden sm:inline">
              <b>Classification:</b> Public
            </span>
            <span className="ml-auto sm:hidden font-bold">Public</span>
            <span className="shrink-0 hidden sm:block" style={{ borderLeft: "1px solid var(--cf-faint)", paddingLeft: 14 }}>
              <LiveClock />
            </span>
            <span className="shrink-0" style={{ borderLeft: "1px solid var(--cf-faint)", paddingLeft: 12 }}>
              <ThemeToggle />
            </span>
          </div>

          {/* Nav row */}
          <div className="flex items-center gap-5 py-3">
            <Link
              href="/"
              className="cf-display text-[19px] leading-none tracking-wide lg:hidden"
              aria-label="raghv.dev home"
            >
              Raghav Mahajan
            </Link>
            <nav className="hidden lg:flex items-center gap-5 flex-wrap" aria-label="Main">
              {LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className="cf-navlink cf-mono text-[11.5px] uppercase py-1"
                    style={{ letterSpacing: "0.1em", color: active ? undefined : "var(--cf-ink-soft)" }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="ml-auto flex items-center gap-4">
              <div className="hidden xl:flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--cf-green)", boxShadow: "0 0 0 3px rgba(46,107,30,0.18)" }} />
                <span className="cf-mono text-[10px] tracking-wider" style={{ color: "var(--cf-green)" }}>AVAILABLE</span>
              </div>
              <a
                href="/resume.pdf"
                download="Raghav_Mahajan_Resume.pdf"
                className="cf-mono hidden sm:inline-flex items-center gap-1.5 text-[11px] uppercase py-1 cf-navlink"
                style={{ letterSpacing: "0.1em" }}
              >
                <Download className="w-3 h-3" />
                Resume
              </a>
              <Link
                href="/estimate"
                className="cf-mono hidden md:inline-flex items-center text-[11px] font-bold uppercase px-4 py-2.5"
                style={{
                  letterSpacing: "0.1em",
                  background: "var(--cf-ink)",
                  color: "var(--cf-paper)",
                  border: "2px solid var(--cf-ink)",
                  boxShadow: "4px 4px 0 var(--cf-shadow)",
                }}
              >
                Start an estimate
              </Link>
              <button
                className="lg:hidden -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                style={{ color: "var(--cf-ink)" }}
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
        </div>
      </header>

      {/* Mobile menu: full-height paper panel that slides in from the right */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60"
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
              className="cf-scope fixed top-0 right-0 bottom-0 z-50 w-80 max-w-[88vw] flex flex-col"
              style={{ borderLeft: "2px solid var(--cf-ink)" }}
            >
              <div className="flex items-center justify-between px-6 h-16" style={{ borderBottom: "3px double var(--cf-ink)" }}>
                <span className="cf-mono text-[11px] uppercase" style={{ letterSpacing: "0.09em" }}>
                  <b>File No.</b> YEG-2026-001
                </span>
                <button onClick={() => setOpen(false)} aria-label="Close menu" autoFocus className="min-w-[44px] min-h-[44px] flex items-center justify-center" style={{ color: "var(--cf-ink)" }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-4" aria-label="Main">
                {LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.025, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={link.href}
                      aria-current={pathname === link.href ? "page" : undefined}
                      className="flex items-center px-6 min-h-[46px] cf-display text-[17px] uppercase"
                      style={{
                        color: pathname === link.href ? "var(--cf-red)" : "var(--cf-ink)",
                        borderLeft: pathname === link.href ? "3px solid var(--cf-red)" : "3px solid transparent",
                      }}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="px-6 pb-8 pt-4 flex flex-col gap-4" style={{ borderTop: "1px solid var(--cf-faint)" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--cf-green)" }} />
                    <span className="cf-mono text-[10px] tracking-wider" style={{ color: "var(--cf-green)" }}>AVAILABLE FOR SOC ROLES</span>
                  </div>
                  <ThemeToggle />
                </div>
                <Link
                  href="/estimate"
                  onClick={() => setOpen(false)}
                  className="cf-btn justify-center"
                >
                  Start an estimate
                </Link>
                <a
                  href="/resume.pdf"
                  download="Raghav_Mahajan_Resume.pdf"
                  className="cf-btn-ghost justify-center"
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
