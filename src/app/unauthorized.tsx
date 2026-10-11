import type { Metadata } from "next";

import { ErrorLinks, ErrorShell } from "@/components/layout/ErrorShell";

export const metadata: Metadata = {
  title: "Sign in required",
  robots: { index: false, follow: false },
};

export default function Unauthorized() {
  return (
    <ErrorShell
      code="401"
      title="Please sign in"
      actions={<ErrorLinks links={[{ href: "/auth/login", label: "Sign in", primary: true }, { href: "/", label: "Home" }]} />}
    >
      <p>You need to be signed in to see this page. First time? Set your password with &quot;Forgot password&quot; on the sign-in page.</p>
    </ErrorShell>
  );
}
