"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";

import { AuthShell, authInputClass, authLabelClass, FormAlert } from "@/components/auth/AuthShell";

import { updatePasswordAction } from "../actions";

// useSearchParams needs a Suspense boundary so the rest of the page can still prerender.
export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePasswordAction, undefined);
  const next = useSearchParams().get("next");

  return (
    <AuthShell label="NEW PASSWORD" title="Choose a new password">
      <form action={action} className="space-y-4">
        {next && <input type="hidden" name="next" value={next} />}
        <p className="text-sm text-[var(--text-muted)]">At least 12 characters. A passphrase of a few random words works well.</p>
        <div>
          <label htmlFor="password" className={authLabelClass}>NEW PASSWORD</label>
          <input id="password" name="password" type="password" required minLength={12} autoComplete="new-password" className={authInputClass} />
        </div>
        <div>
          <label htmlFor="confirm" className={authLabelClass}>CONFIRM</label>
          <input id="confirm" name="confirm" type="password" required minLength={12} autoComplete="new-password" className={authInputClass} />
        </div>
        <FormAlert error={state?.error} />
        <button type="submit" disabled={pending} className="btn-gold w-full justify-center">
          {pending ? "Saving…" : "Save password"}
        </button>
      </form>
    </AuthShell>
  );
}
