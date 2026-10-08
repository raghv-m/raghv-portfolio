"use client";

import { useActionState } from "react";
import { ShieldCheck } from "lucide-react";

import { authInputClass, authLabelClass, FormAlert } from "@/components/auth/AuthShell";

import { verifyMfaAction } from "../actions";

export function MfaVerify({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(verifyMfaAction, undefined);

  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <p className="text-sm text-[var(--text-muted)]">Open your authenticator app and type the 6-digit code for raghv.dev.</p>
      <div>
        <label htmlFor="code" className={authLabelClass}>CODE OR BACKUP CODE</label>
        <input
          id="code"
          name="code"
          required
          autoFocus
          autoComplete="one-time-code"
          inputMode="text"
          maxLength={11}
          placeholder="123456  or  ABCDE-FGHJK"
          className={`${authInputClass} tracking-[0.2em]`}
        />
      </div>
      <FormAlert error={state?.error} />
      <button type="submit" disabled={pending} className="btn-gold w-full justify-center">
        {pending ? "Checking…" : (<><ShieldCheck className="w-3.5 h-3.5" /> Verify</>)}
      </button>
    </form>
  );
}
