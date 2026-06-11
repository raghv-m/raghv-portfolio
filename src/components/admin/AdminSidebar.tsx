"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  FileText, Mail, Users, ExternalLink, LogOut, PenSquare, LayoutDashboard,
} from "lucide-react";

const NAV = [
  { href: "/admin/posts", icon: FileText, label: "Posts" },
  { href: "/admin/posts/new", icon: PenSquare, label: "New Post" },
  { href: "/admin/messages", icon: Mail, label: "Messages" },
  { href: "/admin/newsletter", icon: Users, label: "Newsletter" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin/posts/new"
      ? pathname === href
      : pathname.startsWith(href) && href !== "/admin/posts/new";

  return (
    <aside className="fixed top-14 left-0 bottom-0 w-52 flex flex-col bg-[var(--card)] border-r border-[var(--border)] z-30">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-3.5 h-3.5 text-[var(--gold)]" />
          <span className="font-mono text-[10px] text-[var(--gold)] tracking-[0.2em] uppercase">Admin Panel</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-colors ${
              isActive(href)
                ? "bg-[rgba(212,160,23,0.1)] text-[var(--gold)] border border-[rgba(212,160,23,0.2)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]"
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-[var(--border)] space-y-0.5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          View Site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-[var(--text-muted)] hover:text-red-400 hover:bg-[rgba(255,68,68,0.06)] transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
