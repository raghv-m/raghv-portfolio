import Link from "next/link";
import { CheckCircle, AlertCircle, Mail } from "lucide-react";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; token?: string }>;
}) {
  const { status, token } = await searchParams;

  if (status === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--green)" }} />
          <h1 className="font-display text-2xl font-bold text-[var(--text)] mb-3">Unsubscribed</h1>
          <p className="text-[var(--text-muted)] mb-6">
            You&apos;ve been removed from Raghav&apos;s Cyber Daily. No more emails.
          </p>
          <Link href="/" className="btn-ghost">Go home</Link>
        </div>
      </div>
    );
  }

  if (token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <Mail className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--gold)" }} />
          <h1 className="font-display text-2xl font-bold text-[var(--text)] mb-3">
            Confirm Unsubscribe
          </h1>
          <p className="text-[var(--text-muted)] mb-6">
            Are you sure you want to unsubscribe from Raghav&apos;s Cyber Daily?
          </p>
          <form action="/api/unsubscribe" method="POST" className="flex flex-col items-center gap-3">
            <input type="hidden" name="token" value={token} />
            <button
              type="submit"
              className="btn-primary"
              style={{ background: "transparent", border: "1px solid var(--red)", color: "var(--red)" }}
            >
              Yes, unsubscribe me
            </button>
            <Link href="/" className="btn-ghost">Cancel</Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--red)" }} />
        <h1 className="font-display text-2xl font-bold text-[var(--text)] mb-3">Invalid link</h1>
        <p className="text-[var(--text-muted)] mb-6">
          This unsubscribe link is invalid or expired.
        </p>
        <Link href="/" className="btn-ghost">Go home</Link>
      </div>
    </div>
  );
}
