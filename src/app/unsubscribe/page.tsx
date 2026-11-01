import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, AlertCircle, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

const cardStyle: CSSProperties = {
  border: "2px solid var(--cf-ink)",
  background: "var(--cf-paper-2)",
  padding: "40px 30px 36px",
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; token?: string }>;
}) {
  const { status, token } = await searchParams;

  if (status === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center" style={cardStyle}>
          <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--cf-gold)" }} />
          <h1 className="cf-display mb-3" style={{ fontSize: "30px", lineHeight: 1.05 }}>
            Unsubscribed
          </h1>
          <p className="mb-6" style={{ color: "var(--cf-muted)", lineHeight: 1.65 }}>
            You&apos;ve been removed from Raghav&apos;s Cyber Daily. No more emails.
          </p>
          <Link href="/" className="cf-btn-ghost">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  if (token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center" style={cardStyle}>
          <Mail className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--cf-gold)" }} />
          <h1 className="cf-display mb-3" style={{ fontSize: "30px", lineHeight: 1.05 }}>
            Confirm Unsubscribe
          </h1>
          <p className="mb-6" style={{ color: "var(--cf-muted)", lineHeight: 1.65 }}>
            Are you sure you want to unsubscribe from Raghav&apos;s Cyber Daily?
          </p>
          <form action="/api/unsubscribe" method="POST" className="flex flex-col items-center gap-3">
            <input type="hidden" name="token" value={token} />
            <button type="submit" className="cf-btn-ghost" style={{ borderColor: "var(--cf-red)", color: "var(--cf-red)" }}>
              Yes, unsubscribe me
            </button>
            <Link href="/" className="cf-btn-ghost">
              Cancel
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center" style={cardStyle}>
        <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--cf-red)" }} />
        <h1 className="cf-display mb-3" style={{ fontSize: "30px", lineHeight: 1.05 }}>
          Invalid link
        </h1>
        <p className="mb-6" style={{ color: "var(--cf-muted)", lineHeight: 1.65 }}>
          This unsubscribe link is invalid or expired.
        </p>
        <Link href="/" className="cf-btn-ghost">
          Go home
        </Link>
      </div>
    </div>
  );
}
