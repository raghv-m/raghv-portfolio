"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Check, Copy, Download, QrCode } from "lucide-react";

import { authInputClass, authLabelClass, FormAlert } from "@/components/auth/AuthShell";

import { mfaEnrollmentAction, type EnrollmentState } from "../actions";

export function MfaEnroll({ next }: { next?: string }) {
  const [current, action, pending] = useActionState<EnrollmentState, FormData>(mfaEnrollmentAction, { step: "start" });

  if (current.step === "done") return <BackupCodes codes={current.backupCodes} next={next} />;

  if (current.step === "start") {
    return (
      <form action={action} className="space-y-4">
        <input type="hidden" name="intent" value="start" />
        <p className="text-sm text-[var(--text-muted)]">
          You&apos;ll need an authenticator app on your phone: Google Authenticator, Microsoft Authenticator, 1Password or
          Authy all work.
        </p>
        <FormAlert error={current.error} />
        <button type="submit" disabled={pending} className="btn-gold w-full justify-center">
          <QrCode className="w-3.5 h-3.5" /> {pending ? "Preparing…" : "Show QR code"}
        </button>
      </form>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="intent" value="confirm" />
      <p className="text-sm text-[var(--text-muted)]">1. Scan this with your authenticator app.</p>
      {/* eslint-disable-next-line @next/next/no-img-element -- data: URL generated on the server */}
      <img src={current.qrCodeDataUrl} alt="QR code for your authenticator app" className="mx-auto size-48 rounded-lg bg-white p-2" />
      <details className="text-xs text-[var(--text-muted)]">
        <summary className="cursor-pointer">Can&apos;t scan? Enter this key instead</summary>
        <code className="mt-2 block break-all font-mono text-[var(--text)]">{current.manualKey}</code>
      </details>
      <div>
        <label htmlFor="code" className={authLabelClass}>2. ENTER THE 6-DIGIT CODE IT SHOWS</label>
        <input id="code" name="code" required autoComplete="one-time-code" inputMode="numeric" maxLength={6} className={`${authInputClass} tracking-[0.3em]`} />
      </div>
      <FormAlert error={current.error} />
      <button type="submit" disabled={pending} className="btn-gold w-full justify-center">
        {pending ? "Checking…" : "Turn on two-factor"}
      </button>
    </form>
  );
}

function BackupCodes({ codes, next }: { codes: string[]; next?: string }) {
  const [copied, setCopied] = useState(false);
  const text = `raghv.dev admin backup codes (each works once)\n\n${codes.join("\n")}\n`;

  function download() {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "raghv-dev-backup-codes.txt" });
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <FormAlert message="Two-factor is on. Save these backup codes now: they won't be shown again." />
      <p className="text-sm text-[var(--text-muted)]">
        If you lose your phone, type one of these into the code box at sign-in instead of the 6-digit code. Each one
        works once. Keep them in your password manager.
      </p>
      <ul className="grid grid-cols-2 gap-2 font-mono text-sm text-[var(--text)]">
        {codes.map((code) => (
          <li key={code} className="rounded border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-center">{code}</li>
        ))}
      </ul>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(text);
            setCopied(true);
          }}
          className="btn-gold flex-1 justify-center"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copied ? "Copied" : "Copy"}
        </button>
        <button type="button" onClick={download} className="btn-gold flex-1 justify-center">
          <Download className="w-3.5 h-3.5" /> Download
        </button>
      </div>
      <Link href={next?.startsWith("/") && !next.startsWith("//") ? next : "/admin"} className="block text-center font-mono text-xs text-[var(--gold)] hover:underline">
        I&apos;ve saved them. Continue to the admin console →
      </Link>
    </div>
  );
}
