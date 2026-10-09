"use client";

import { useState, useTransition } from "react";

import { sendPortalInviteAction } from "@/app/admin/estimates/actions";

/** Emails the client a link to set their password and open the portal. */
export function InviteButton({ email }: { email: string }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await sendPortalInviteAction(email);
          setResult(r.ok ? "Invite sent" : r.error);
        })
      }
      className="btn-ghost"
      title="Emails them a link to set a password and open the client portal"
    >
      {pending ? "Sending…" : result ?? "Send portal invite"}
    </button>
  );
}
