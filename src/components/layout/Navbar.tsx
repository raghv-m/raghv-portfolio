"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/casefile/ThemeToggle";
import { Magnetic } from "@/components/casefile/Magnetic";
import { EASE_DRAWER, EASE_OUT } from "@/components/casefile/motion";

/**
 * One raw bar (Nov 2026 brutalist rebuild). Bare logo left, six primary
 * links in letterspaced grotesque capitals, one red CTA block right, and a
 * 3px ink rule under the whole bar: the structure is the decoration.
 * Active page = red underline only, and it slides between links (framer
 * layoutId). The mobile panel is a full ink block in both themes, its
 * active link carried on a red block, poster-style.
 */
const LINKS = [
  { href: "/about", label: "About" },
  { href: "/experience", label: "Experience" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/cybersecurity", label: "Cybersecurity" },
  { href: "/blog", label: "Blog" },
  { href: "/newsletter", label: "Newsletter" },
];

/**
 * Reading progress: a 3px red line under the navbar rule, transform-origin
 * left, spring-damped from the page scroll position. It tracks scroll, so
 * it reverses freely; reduced motion gets the raw position with no spring.
 */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden="true"
      style={{
        scaleX: reduce ? scrollYProgress : smooth,
        position: "absolute",
        left: 0,
        right: 0,
        bottom: -3,
        height: 3,
        background: "var(--cf-red)",
        transformOrigin: "left center",
        pointerEvents: "none",
      }}
    />
  );
}

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
      <header className="cf-scope cf-load-fade cf-nav">
        <div className="cf-wrap">
          <div className="relative flex items-center gap-6 h-[64px]" style={{ borderBottom: "3px solid var(--cf-ink)" }}>
            <Link href="/" aria-label="raghv.dev home" className="flex items-center gap-3.5 shrink-0 min-h-[44px]" style={{ color: "var(--cf-ink)" }}>
              <Logo size={27} animated />
              <span
                className="hidden sm:block"
                style={{ fontFamily: "var(--cf-display)", fontSize: 19, letterSpacing: "0.03em", textTransform: "uppercase", color: "var(--cf-ink)" }}
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
                          height: 3,
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
                  aria-current={pathname === "/contact" ? "page" : undefined}
                  className="inline-flex items-center whitespace-nowrap"
                  style={{
                    fontFamily: "var(--cf-caps)",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    /* U6 (upscale pass): on /contact the CTA itself carries the
                       current-page state: an ink fill instead of red, so the
                       one element that never joined the sliding-rule system
                       still says where you are. */
                    background: pathname === "/contact" ? "var(--cf-ink)" : "var(--cf-red)",
                    color: "#F4F1EC",
                    padding: "11px 20px",
                    minHeight: 44,
                    alignItems: "center",
                    border: "2px solid var(--cf-ink)",
                    boxShadow: "4px 4px 0 var(--cf-shadow)",
                  }}
                >
                  Contact
                </Link>
              </Magnetic>
              <button
                className="lg:hidden -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center relative"
                style={{ color: "var(--cf-ink)" }}
                onClick={() => setOpen(!open)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-menu"
              >
                {/* U5 (upscale pass): the icon swap crossfades/rotates in
                    place instead of cutting. Reduced motion: instant. */}
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 grid place-items-center"
                  animate={{ rotate: open ? 90 : 0, opacity: open ? 0 : 1 }}
                  transition={{ duration: reduceMotion ? 0 : 0.18, ease: EASE_OUT }}
                >
                  <Menu className="w-5 h-5" />
                </motion.span>
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 grid place-items-center"
                  animate={{ rotate: open ? 0 : -90, opacity: open ? 1 : 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.18, ease: EASE_OUT }}
                >
                  <X className="w-5 h-5" />
                </motion.span>
              </button>
            </div>
            <ScrollProgress />
          </div>
        </div>
      </header>

      {/* Mobile menu: a full-screen ink block in both themes. Giant
          condensed links; the active one sits on a red block. */}
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
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: EASE_DRAWER }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{
              background: "#141414",
              color: "#F4F1EC",
              paddingTop: "env(safe-area-inset-top, 0px)",
              paddingRight: "env(safe-area-inset-right, 0px)",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
              paddingLeft: "env(safe-area-inset-left, 0px)",
            }}
          >
            <div className="cf-wrap w-full">
              <div className="flex items-center justify-between h-[64px]" style={{ borderBottom: "3px solid var(--cf-red)" }}>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, fontWeight: 700, letterSpacing: "0.22em", color: "#F4F1EC" }}>
                  RAGHV.DEV — MENU
                </span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  autoFocus
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
                  style={{ color: "#F4F1EC" }}
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
                      transition={{ delay: 0.02 + i * 0.016, duration: 0.22, ease: EASE_OUT }}
                    >
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className="flex items-baseline gap-4 py-2.5 min-h-[52px]"
                        style={{
                          fontFamily: "var(--cf-display)",
                          fontSize: 31,
                          textTransform: "uppercase",
                          letterSpacing: "0.01em",
                          color: "#F4F1EC",
                          ...(active
                            ? { background: "var(--cf-red)", paddingLeft: 12, paddingRight: 12, marginLeft: -12 }
                            : {}),
                        }}
                      >
                        <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: active ? "#F4F1EC" : "#8A867E" }}>
                          {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11"][i]}
                        </span>
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </nav>
            <div className="cf-wrap w-full pb-9 pt-4 flex items-center justify-between" style={{ borderTop: "3px solid var(--cf-red)" }}>
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "#F4F1EC" }}>
                Edmonton, Alberta
              </span>
              <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
