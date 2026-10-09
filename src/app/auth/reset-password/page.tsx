"use client";

import { useActionState } from "react";

import { AuthShell, authInputClass, authLabelClass, FormAlert } from "@/components/auth/AuthShell";

import { updatePasswordAction } from "../actions";

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState(updatePasswordAction, undefined);

  return (
    <AuthShell label="NEW PASSWORD" title="Choose a new password">
      <form action={action} className="space-y-4">
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
