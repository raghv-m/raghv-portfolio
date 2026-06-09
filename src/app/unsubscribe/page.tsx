import Link from "next/link";
import { CheckCircle, AlertCircle } from "lucide-react";

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        {status === "done" ? (
          <>
            <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--green)" }} />
            <h1 className="font-display text-2xl font-bold text-[var(--text)] mb-3">Unsubscribed</h1>
            <p className="text-[var(--text-muted)] mb-6">You&apos;ve been removed from Raghav&apos;s Cyber Daily. No more emails.</p>
          </>
        ) : (
          <>
            <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--red)" }} />
            <h1 className="font-display text-2xl font-bold text-[var(--text)] mb-3">Invalid link</h1>
            <p className="text-[var(--text-muted)] mb-6">This unsubscribe link is invalid or expired.</p>
          </>
        )}
        <Link href="/" className="btn-ghost">Go home</Link>
      </div>
    </div>
  );
}
