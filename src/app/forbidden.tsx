import type { Metadata } from "next";

import { ErrorLinks, ErrorShell } from "@/components/layout/ErrorShell";

export const metadata: Metadata = {
  title: "No access",
  robots: { index: false, follow: false },
};

export default function Forbidden() {
  return (
    <ErrorShell
      code="403"
      title="You don't have access to this page"
      actions={
        <ErrorLinks
          links={[
            { href: "/portal", label: "Go to my portal", primary: true },
            { href: "/auth/login", label: "Sign in with another account" },
          ]}
        />
      }
    >
      <p>You&apos;re signed in, but this area is for a different kind of account.</p>
    </ErrorShell>
  );
}
