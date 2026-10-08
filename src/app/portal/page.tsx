import type { Metadata } from "next";

import { signOutAction } from "@/app/auth/actions";
import { requirePortalUser } from "@/lib/session";

export const metadata: Metadata = { title: "Client portal", robots: { index: false, follow: false } };

// Placeholder until the full portal (projects, files, messages, invoices) lands in phase 9.
export default async function PortalHome() {
  const { profile } = await requirePortalUser();
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="glass rounded-2xl p-8 max-w-md w-full space-y-4" style={{ border: "1px solid var(--border)" }}>
        <p className="font-mono text-[10px] tracking-wider text-[var(--gold)]">CLIENT PORTAL</p>
        <h1 className="text-xl font-semibold text-[var(--text)]">Hi {profile.full_name || profile.email}</h1>
        <p className="text-sm text-[var(--text-muted)]">Your projects and invoices will appear here.</p>
        <form action={signOutAction}>
          <button type="submit" className="btn-gold">Sign out</button>
        </form>
      </div>
    </div>
  );
}
