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
      <body style={{ margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#141414", color: "#F4F1EC", fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif", padding: 16 }}>
        <main style={{ maxWidth: 480, textAlign: "center" }}>
          <p style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", margin: 0 }}>
            <span style={{ background: "#AD0117", color: "#F4F1EC", padding: "4px 10px" }}>ERROR</span>
          </p>
          <h1 style={{ fontSize: 32, margin: "16px 0 0" }}>Something went wrong</h1>
          <p style={{ color: "#9A968C", lineHeight: 1.6, marginTop: 16 }}>The site hit a problem on our side. Trying again usually fixes it.</p>
          {error.digest && <p style={{ color: "#6B675E", fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12 }}>Reference: {error.digest}</p>}
          <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => retry()}
              style={{ padding: "12px 28px", border: "2px solid #AD0117", background: "#AD0117", color: "#F4F1EC", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: 0, cursor: "pointer", fontSize: 13 }}
            >
              Try again &rarr;
            </button>
            {/* Plain <a>: the router may be what failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" style={{ padding: "12px 28px", border: "2px solid #F4F1EC", color: "#F4F1EC", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: 0, textDecoration: "none", fontSize: 13 }}>
              Home &rarr;
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
