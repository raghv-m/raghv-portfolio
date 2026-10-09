import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/AuthShell";
import { isMfaEnabled } from "@/lib/mfa";
import { getSignedIn, hasVerifiedMfa } from "@/lib/session";

import { MfaEnroll } from "./MfaEnroll";
import { MfaVerify } from "./MfaVerify";

export const metadata: Metadata = {
  title: "Two-factor authentication",
  robots: { index: false, follow: false },
};

export default async function MfaPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const signedIn = await getSignedIn();
  if (!signedIn) redirect("/auth/login?next=/admin");
  if (signedIn.profile.role !== "admin") redirect("/portal");

  const enabled = await isMfaEnabled(signedIn.userId);
  if (enabled && (await hasVerifiedMfa(signedIn))) redirect(next?.startsWith("/") && !next.startsWith("//") ? next : "/admin");

  return enabled ? (
    <AuthShell label="ADMIN · TWO-FACTOR" title="Enter your code" footer="Lost your phone? Use one of your backup codes.">
      <MfaVerify next={next} />
    </AuthShell>
  ) : (
    <AuthShell label="ADMIN · SET UP TWO-FACTOR" title="Protect the admin console" footer="Required once, before the admin console opens.">
      <MfaEnroll next={next} />
    </AuthShell>
  );
}
