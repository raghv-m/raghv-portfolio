"use client";

import { Suspense, useActionState, useRef } from "react";
import { useSearchParams } from "next/navigation";

import { AuthShell, authInputClass, authLabelClass, FormAlert } from "@/components/auth/AuthShell";
import { FieldError, invalidProps, useFocusFirstInvalid } from "@/components/ui/FieldError";

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
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstInvalid(formRef, state);
  const fieldError = (name: string) => (state?.field === name ? state.error : undefined);

  return (
    <AuthShell label="NEW PASSWORD" title="Choose a new password">
      <form ref={formRef} action={action} noValidate className="space-y-4">
        {next && <input type="hidden" name="next" value={next} />}
        <p className="text-sm text-[var(--text-muted)]">At least 12 characters. A passphrase of a few random words works well.</p>
        <div>
          <label htmlFor="password" className={authLabelClass}>NEW PASSWORD</label>
          <input id="password" name="password" type="password" required minLength={12} autoComplete="new-password" {...invalidProps("password", fieldError("password"))} className={authInputClass} />
          <FieldError name="password" message={fieldError("password")} />
        </div>
        <div>
          <label htmlFor="confirm" className={authLabelClass}>CONFIRM</label>
          <input id="confirm" name="confirm" type="password" required minLength={12} autoComplete="new-password" {...invalidProps("confirm", fieldError("confirm"))} className={authInputClass} />
          <FieldError name="confirm" message={fieldError("confirm")} />
        </div>
        <FormAlert error={state?.field ? undefined : state?.error} />
        <button type="submit" disabled={pending} className="btn-gold w-full justify-center">
          {pending ? "Saving…" : "Save password"}
        </button>
      </form>
    </AuthShell>
  );
}
