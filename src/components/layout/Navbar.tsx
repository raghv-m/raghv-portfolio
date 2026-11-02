"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/casefile/ThemeToggle";
import { Magnetic } from "@/components/casefile/Magnetic";
import { MeanderBand } from "@/components/casefile/Ornaments";

/**
 * One slim bar (Nov 2026 rebuild). Logo left in a medallion seal, six
 * primary links in letterspaced Roman capitals, one cobalt CTA right.
 * Hairline rule under the bar, meander entablature strip under that.
 * The dossier strip, clock, resume link and availability beacon moved out;
 * the file data lives in the footer now. Active page = cobalt underline
 * only, and it slides between links (framer layoutId).
 */
const LINKS = [
  { href: "/about", label: "About" },
  { href: "/experience", label: "Experience" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/cybersecurity", label: "Cybersecurity" },
  { href: "/blog", label: "Blog" },
  { href: "/newsletter", label: "Newsletter" },
];

/** Everything the mobile panel lists: the six primaries, then the rest of the file. */
const PANEL_LINKS = [
  ...LINKS,
  { href: "/certifications", label: "Certifications" },
  { href: "/hobbies", label: "Hobbies" },
  { href: "/estimate", label: "Get an estimate" },
  { href: "/contact", label: "Contact" },
  { href: "/auth/login", label: "Client login" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

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
      <header className="cf-scope cf-load-fade">
        <div className="cf-wrap">
          <div className="flex items-center gap-6 h-[68px]" style={{ borderBottom: "1px solid var(--cf-doc-line)" }}>
            <Link href="/" aria-label="raghv.dev home" className="flex items-center gap-3.5 shrink-0 min-h-[44px]">
              <span className="cf-medallion" style={{ color: "var(--cf-ink)" }}>
                <Logo size={21} />
              </span>
              <span
                className="hidden sm:block"
                style={{ fontFamily: "var(--cf-caps)", fontSize: 13.5, fontWeight: 600, letterSpacing: "0.22em", color: "var(--cf-ink)" }}
              >
                Raghav Mahajan
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-7 ml-3" aria-label="Main" style={{ flexWrap: "nowrap" }}>
              {LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className="cf-navlink whitespace-nowrap py-2"
                    style={{
                      fontFamily: "var(--cf-caps)",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: active ? "var(--cf-ink)" : "var(--cf-muted)",
                    }}
                  >
                    {link.label}
                    {active && (
                      <motion.span
                        layoutId="cf-nav-rule"
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 520, damping: 42 }
                        }
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          bottom: -2,
                          height: 2,
                          background: "var(--cf-red)",
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="ml-auto flex items-center gap-4">
              <span className="opacity-60 hover:opacity-100 transition-opacity hidden sm:block">
                <ThemeToggle />
              </span>
              <Magnetic strength={14} className="hidden md:inline-block">
                <Link
                  href="/contact"
                  className="inline-flex items-center whitespace-nowrap"
                  style={{
                    fontFamily: "var(--cf-caps)",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    background: "#2c3480",
                    color: "#ffffff",
                    padding: "11px 20px",
                    border: "1px solid #2c3480",
                  }}
                >
                  Contact
                </Link>
              </Magnetic>
              <button
                className="lg:hidden -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                style={{ color: "var(--cf-ink)" }}
                onClick={() => setOpen(!open)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-menu"
              >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
        <MeanderBand />
      </header>

      {/* Mobile menu: a full-screen black panel. Big Didone links, cobalt
          active state, in both themes — the VELARA field, taken whole. */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.26, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: "#000000", color: "#f4f4f7" }}
          >
            <div className="cf-wrap w-full">
              <div className="flex items-center justify-between h-[68px]" style={{ borderBottom: "1px solid #33333d" }}>
                <span style={{ fontFamily: "var(--cf-caps)", fontSize: 12, letterSpacing: "0.22em", color: "#a7a7b3" }}>
                  File No. YEG-2026-001
                </span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  autoFocus
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
                  style={{ color: "#f4f4f7" }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto" aria-label="Main">
              <div className="cf-wrap py-8 flex flex-col">
                {PANEL_LINKS.map((link, i) => {
                  const active = pathname === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 + i * 0.04, duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className="flex items-baseline gap-4 py-2.5 min-h-[52px]"
                        style={{
                          fontFamily: "var(--cf-display)",
                          fontSize: 31,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.01em",
                          color: active ? "#8b94e0" : "#f4f4f7",
                        }}
                      >
                        <span style={{ fontFamily: "var(--cf-caps)", fontSize: 11, letterSpacing: "0.2em", color: active ? "#8b94e0" : "#55555f" }}>
                          {["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"][i]}
                        </span>
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </nav>
            <div className="cf-wrap w-full pb-9 pt-4 flex items-center justify-between" style={{ borderTop: "1px solid #33333d" }}>
              <span style={{ fontFamily: "var(--cf-caps)", fontSize: 11, letterSpacing: "0.2em", color: "#a7a7b3" }}>
                Edmonton, AB — Public
              </span>
              <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
