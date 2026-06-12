import Link from "next/link";
import { Shield } from "lucide-react";
import SubscribeWidget from "@/components/newsletter/SubscribeWidget";

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
    { label: "Projects", href: "/projects" },
    { label: "Home Lab", href: "/homelab" },
  ],
  [
    { label: "Experience", href: "/experience" },
    { label: "Certifications", href: "/certifications" },
    { label: "Career", href: "/career" },
    { label: "Blog", href: "/blog" },
  ],
];

export default function Footer() {
  return (
    <footer className="relative border-t border-[#222] pb-8 mt-0">
      <div className="glow-line mb-0" />
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-6">
        {/* Newsletter subscribe */}
        <div className="mb-10">
          <div className="max-w-lg">
            <SubscribeWidget compact />
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 border border-[rgba(212,160,23,0.4)] rounded flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-[var(--gold)]" />
              </div>
              <span className="font-mono text-sm font-semibold text-[var(--gold)]">raghv.dev</span>
            </div>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-xs mb-5">
              Cybersecurity Analyst in Training. Building defensive systems through real-world labs,
              threat detection, and SOC-style operations.
            </p>
            <div className="flex items-center gap-1.5 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" style={{ boxShadow: "0 0 6px rgba(0,255,136,0.6)" }} />
              <span className="font-mono text-[10px] text-[var(--green)] tracking-wider">
                AVAILABLE FOR SOC ANALYST ROLES
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a href="https://github.com/HomeLab-Raghav" target="_blank" rel="noopener noreferrer"
                className="text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors">
                <GithubIcon />
              </a>
              <a href="https://linkedin.com/in/raghav-mahajan-17611b24b" target="_blank" rel="noopener noreferrer"
                className="text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors">
                <LinkedinIcon />
              </a>
            </div>
          </div>

          {/* Links */}
          {LINKS.map((group, i) => (
            <div key={i} className="space-y-2">
              {group.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors underline-gold"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="divider mb-5" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[10px] text-[#333]">
            © {new Date().getFullYear()} Raghav Mahajan · Edmonton, AB · ISC2 CC · Security+ EARNED
          </p>
          <p className="font-mono text-[10px] text-[#333]">
            Built with Next.js · Framer Motion · Three.js
          </p>
        </div>
      </div>
    </footer>
  );
}
