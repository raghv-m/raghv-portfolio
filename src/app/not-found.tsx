import type { Metadata } from "next";

import { ErrorLinks, ErrorShell } from "@/components/layout/ErrorShell";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <ErrorShell
      code="404"
      title="This page doesn't exist"
      actions={
        <ErrorLinks
          links={[
            { href: "/", label: "Home", primary: true },
            { href: "/estimate", label: "Get an estimate" },
            { href: "/contact", label: "Contact" },
          ]}
        />
      }
    >
      <p>The link may be old or mistyped. Try one of these instead.</p>
    </ErrorShell>
  );
}
