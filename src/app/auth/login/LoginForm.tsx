"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, LogIn } from "lucide-react";

import { authInputClass, authLabelClass, FormAlert } from "@/components/auth/AuthShell";

import { signInAction } from "../actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signInAction, undefined);
  const [showPw, setShowPw] = useState(false);

  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <label htmlFor="email" className={authLabelClass}>EMAIL</label>
        <input id="email" name="email" type="email" required autoComplete="email" className={authInputClass} />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className={authLabelClass}>PASSWORD</label>
          <Link href="/auth/forgot-password" className="font-mono text-[9px] text-[var(--gold)] hover:underline mb-1.5">
            Forgot?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPw ? "text" : "password"}
            required
            autoComplete="current-password"
            className={`${authInputClass} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            aria-label={showPw ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      <FormAlert error={state?.error} />
      <button type="submit" disabled={pending} className="btn-gold w-full justify-center mt-2">
        {pending ? "Signing in…" : (<><LogIn className="w-3.5 h-3.5" /> Sign in</>)}
      </button>
    </form>
  );
}
