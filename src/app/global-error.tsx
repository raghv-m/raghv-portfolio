"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

import { reportClientError } from "@/lib/reportClientError";

/**
 * Errors in the root layout. This replaces the whole document, so global styles and fonts
 * don't load here: everything is styled inline.
 */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    reportClientError(error);
  }, [error]);

  return (
    <html lang="en-CA">
      <head>
        <title>Something went wrong | raghv.dev</title>
        <meta name="robots" content="noindex" />
      </head>
      <body style={{ margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a", color: "#f5f5f5", fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif", padding: 16 }}>
        <main style={{ maxWidth: 480, textAlign: "center" }}>
          <p style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 11, letterSpacing: "0.3em", color: "#D4A017", margin: 0 }}>ERROR</p>
          <h1 style={{ fontSize: 32, margin: "16px 0 0" }}>Something went wrong</h1>
          <p style={{ color: "#9a9a9a", lineHeight: 1.6, marginTop: 16 }}>The site hit a problem on our side. Trying again usually fixes it.</p>
          {error.digest && <p style={{ color: "#6b6b6b", fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12 }}>Reference: {error.digest}</p>}
          <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => retry()}
              style={{ padding: "12px 28px", border: "1px solid #D4A017", background: "transparent", color: "#D4A017", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: 4, cursor: "pointer", fontSize: 13 }}
            >
              Try again &rarr;
            </button>
            {/* Plain <a>: the router may be what failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" style={{ padding: "12px 28px", border: "1px solid #D4A017", color: "#D4A017", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: 4, textDecoration: "none", fontSize: 13 }}>
              Home &rarr;
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
