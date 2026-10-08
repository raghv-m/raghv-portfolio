import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/AuthShell";
import { getSignedIn } from "@/lib/session";

import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const signedIn = await getSignedIn();
  if (signedIn) redirect(signedIn.profile.role === "admin" ? "/admin" : "/portal");

  return (
    <AuthShell label="CLIENT PORTAL · SIGN IN" title="Welcome back" footer="Accounts are created by invitation.">
      <LoginForm next={next} />
    </AuthShell>
  );
}
