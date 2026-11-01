"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/auth/actions";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/casefile/ThemeToggle";
import {
  FileText, Mail, Users, ExternalLink, LogOut, PenSquare, Calculator, Contact, Receipt, Tags, Gauge, FileSignature, Kanban, FolderKanban, ListChecks,
} from "lucide-react";

const NAV = [
  { href: "/admin", icon: Gauge, label: "Overview", exact: true },
  { href: "/admin/pipeline", icon: Kanban, label: "Pipeline" },
  { href: "/admin/tasks", icon: ListChecks, label: "Tasks" },
  { href: "/admin/estimates", icon: Calculator, label: "Estimates" },
  { href: "/admin/clients", icon: Contact, label: "Clients & leads" },
  { href: "/admin/contracts", icon: FileSignature, label: "Contracts" },
  { href: "/admin/projects", icon: FolderKanban, label: "Projects" },
  { href: "/admin/invoices", icon: Receipt, label: "Invoices" },
  { href: "/admin/pricing", icon: Tags, label: "Pricing" },
  { href: "/admin/messages", icon: Mail, label: "Messages" },
  { href: "/admin/posts", icon: FileText, label: "Posts" },
  { href: "/admin/posts/new", icon: PenSquare, label: "New Post" },
  { href: "/admin/newsletter", icon: Users, label: "Newsletter" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" || href === "/admin/posts/new"
      ? pathname === href
      : pathname.startsWith(href) && !(href === "/admin/posts" && pathname === "/admin/posts/new");

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-52 flex flex-col bg-[var(--card)] border-r-2 border-r-[var(--text)] z-30">
      {/* Brand: the back-office end of the same file. */}
      <div className="px-4 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Logo size={24} style={{ color: "var(--text)" }} />
          <span className="font-mono text-[10px] text-[var(--gold)] tracking-[0.2em] uppercase">Admin Panel</span>
        </div>
        <p className="font-mono text-[9px] text-[var(--text-muted)] tracking-[0.14em] mt-1.5 uppercase">
          File No. YEG-2026-001 · Back office
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-mono transition-colors ${
              isActive(href)
                ? "bg-[var(--surface)] text-[var(--text)] border-l-[3px] border-l-[var(--red)] font-bold"
                : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] border-l-[3px] border-l-transparent"
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-[var(--border)] space-y-0.5">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="font-mono text-[9px] tracking-[0.18em] text-[var(--text-muted)] uppercase">Theme</span>
          <ThemeToggle className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors" />
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          View Site
        </Link>
        <button
          onClick={() => signOutAction()}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--red)] hover:bg-[var(--surface)] transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
