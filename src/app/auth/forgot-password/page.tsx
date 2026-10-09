"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { AuthShell, authInputClass, authLabelClass, FormAlert } from "@/components/auth/AuthShell";

import { requestPasswordResetAction } from "../actions";

function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, undefined);
  const expired = useSearchParams().get("expired");

  return (
    <form action={action} className="space-y-4">
      {expired && !state && <FormAlert error="That link has expired or was already used. Request a new one." />}
      <p className="text-sm text-[var(--text-muted)]">Also use this to set your password the first time.</p>
      <div>
        <label htmlFor="email" className={authLabelClass}>EMAIL</label>
        <input id="email" name="email" type="email" required autoComplete="email" className={authInputClass} />
      </div>
      <FormAlert error={state?.error} message={state?.message} />
      <button type="submit" disabled={pending} className="btn-gold w-full justify-center">
        {pending ? "Sending…" : "Email me a link"}
      </button>
    </form>
  );
}

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      label="RESET PASSWORD"
      title="Reset your password"
      footer={<Link href="/auth/login" className="hover:text-[var(--gold)]">← Back to sign in</Link>}
    >
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
