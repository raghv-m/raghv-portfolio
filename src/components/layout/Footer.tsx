import Link from "next/link";
import SubscribeWidget from "@/components/newsletter/SubscribeWidget";
import { Logo } from "@/components/brand/Logo";
import { PrivacyChoicesButton } from "@/components/layout/ConsentBanner";
import { Reveal } from "@/components/casefile/Reveal";

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const LINKS = [
  [
    { label: "About", href: "/about" },
    { label: "Cybersecurity", href: "/cybersecurity" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Hobbies", href: "/hobbies" },
  ],
  [
    { label: "Experience", href: "/experience" },
    { label: "Certifications", href: "/certifications" },
    { label: "Blog", href: "/blog" },
    { label: "Newsletter", href: "/newsletter" },
    { label: "Daily security news", href: "/news" },
  ],
  [
    { label: "Get an estimate", href: "/estimate" },
    { label: "Contact", href: "/contact" },
    { label: "Client portal", href: "/auth/login" },
  ],
];

const LEGAL = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
  { label: "Refunds", href: "/refunds" },
  { label: "Accessibility", href: "/accessibility" },
];

export default function Footer() {
  return (
    <footer className="cf-scope" style={{ borderTop: "3px double var(--cf-ink)" }}>
      <div className="cf-wrap pt-12 pb-8">
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Talk block */}
          <Reveal>
          <div>
            <p className="cf-display leading-none" style={{ fontSize: "clamp(56px, 8vw, 92px)" }}>
              Talk.
            </p>
            <div className="flex flex-wrap gap-x-7 gap-y-2 mt-6 text-[16.5px]">
              <a href="mailto:hello@raghv.dev" className="cf-ulink">hello@raghv.dev</a>
              <a href="https://github.com/HomeLab-Raghav" target="_blank" rel="noopener noreferrer" className="cf-ulink inline-flex items-center gap-2">
                <GithubIcon /> GitHub
              </a>
              <a href="https://linkedin.com/in/raghav-mahajan-17611b24b" target="_blank" rel="noopener noreferrer" className="cf-ulink inline-flex items-center gap-2">
                <LinkedinIcon /> LinkedIn
              </a>
            </div>
            <div className="flex items-center gap-1.5 mt-7">
              <span className="cf-live-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--cf-green)", color: "var(--cf-green)" }} />
              <span className="cf-mono text-[10.5px] tracking-wider" style={{ color: "var(--cf-green)" }}>
                AVAILABLE FOR SOC ANALYST ROLES
              </span>
            </div>
            <p className="cf-note mt-4">ISC2 CC · Security+ earned · Edmonton, AB</p>
          </div>
          </Reveal>

          {/* Newsletter, filed */}
          <Reveal delay={0.08}>
          <div>
            <p className="cf-kicker" style={{ color: "var(--cf-ink)" }}>Blue Team Brief, the newsletter</p>
            <p className="mt-3 text-[15.5px] leading-relaxed" style={{ color: "var(--cf-ink-soft)" }}>
              The week&apos;s real attacks in plain English. What happened, what to hunt for.
              One email, no spam. <Link href="/newsletter" className="cf-ulink">Read past editions</Link>
            </p>
            <div className="mt-5 max-w-md">
              <SubscribeWidget compact />
            </div>
          </div>
          </Reveal>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10 pt-8" style={{ borderTop: "1px solid var(--cf-faint)" }}>
          <p className="cf-mono text-[11px] uppercase leading-loose" style={{ letterSpacing: "0.09em", color: "var(--cf-muted)" }}>
            Filed under:
            <br />
            Work, proof,
            <br />
            and contact
          </p>
          {LINKS.map((group, i) => (
            <div key={i} className="space-y-2.5">
              {group.map((link) => (
                <Link key={link.href} href={link.href} className="block text-[15px] cf-navlink w-max" style={{ color: "var(--cf-ink-soft)" }}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* The file closes here: this line is the dossier element that
            survives to the very bottom of every page. */}
        <div className="pt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3" style={{ borderTop: "2px solid var(--cf-ink)" }}>
          <p className="cf-mono text-[10.5px] uppercase flex items-center gap-3" style={{ letterSpacing: "0.09em", color: "var(--cf-muted)" }}>
            <Logo size={24} style={{ color: "var(--cf-ink)" }} />
            <span>File No. YEG-2026-001 · © {new Date().getFullYear()} Raghav Mahajan · Page 1 of 1 · End of file</span>
          </p>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {LEGAL.map((link) => (
              <Link key={link.href} href={link.href} className="cf-mono text-[10.5px] uppercase cf-navlink" style={{ letterSpacing: "0.09em", color: "var(--cf-muted)" }}>
                {link.label}
              </Link>
            ))}
            <PrivacyChoicesButton />
          </nav>
        </div>
      </div>
    </footer>
  );
}
