/**
 * Sends an error caught by an error boundary to the server log. Only the digest (which matches
 * Next's own server log line), a trimmed message and the path are sent. Never throws.
 */
export function reportClientError(error: Error & { digest?: string }) {
  try {
    const body = JSON.stringify({
      digest: error.digest ?? null,
      message: String(error.message ?? "").slice(0, 300),
      path: window.location.pathname,
    });
    if (!navigator.sendBeacon?.("/api/client-error", new Blob([body], { type: "application/json" }))) {
      void fetch("/api/client-error", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
    }
  } catch {
    // Reporting must never cause a second error.
  }
}
