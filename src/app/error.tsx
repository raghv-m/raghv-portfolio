"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

import { ErrorLinks, ErrorShell } from "@/components/layout/ErrorShell";
import { reportClientError } from "@/lib/reportClientError";

/** Runtime errors inside a route. Visitors see a plain message; details go to the server log. */
export default function RouteError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    reportClientError(error);
  }, [error]);

  return (
    <>
      <title>Something went wrong | raghv.dev</title>
      <meta name="robots" content="noindex" />
      <ErrorShell
        code="ERROR"
        title="Something went wrong"
        actions={
          <>
            <button type="button" onClick={() => retry()} className="btn-gold">
              Try again
            </button>
            <ErrorLinks links={[{ href: "/", label: "Home" }, { href: "/contact", label: "Contact" }]} />
          </>
        }
      >
        <p>This page hit a problem on our side. Trying again usually fixes it.</p>
        {error.digest && <p className="mt-3 font-mono text-xs text-[var(--text-muted)]">Reference: {error.digest}</p>}
      </ErrorShell>
    </>
  );
}
