"use client";

import { useState, useTransition } from "react";
import { ClipboardList, FileSignature, Loader2 } from "lucide-react";

import { draftContractAction, sendQuestionnaireAction } from "@/app/admin/contracts/actions";

/** Onboarding steps for one client: send the questionnaire, then draft the contract from it. */
export function OnboardingButtons({ clientId, questionnaireSubmitted }: { clientId: string; questionnaireSubmitted: boolean }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await sendQuestionnaireAction(clientId);
              setMessage(r.ok ? { text: "Questionnaire emailed. It also appears in their portal." } : { text: r.error, error: true });
            })
          }
          className="btn-gold inline-flex items-center gap-2"
        >
          {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ClipboardList className="w-3.5 h-3.5" />} Send questionnaire
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await draftContractAction(clientId);
              if (r && !r.ok) setMessage({ text: r.error, error: true });
            })
          }
          className="btn-solid-gold inline-flex items-center gap-2"
          title={questionnaireSubmitted ? "Fills in from their questionnaire and estimate" : "No questionnaire yet: you'll fill in their details by hand"}
        >
          <FileSignature className="w-3.5 h-3.5" /> Draft contract
        </button>
      </div>
      {!questionnaireSubmitted && <p className="text-xs text-[var(--text-muted)]">Tip: send the questionnaire first, so the contract fills in their legal name, address, signer and payment choices.</p>}
      {message && <p role="status" className={`font-mono text-[11px] ${message.error ? "text-[var(--red)]" : "text-[var(--green)]"}`}>{message.text}</p>}
    </div>
  );
}
