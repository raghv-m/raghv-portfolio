"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PenLine } from "lucide-react";

import { signContractAction } from "@/app/portal/actions";

const input =
  "w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[rgba(212,160,23,0.5)]";

export function SignPanel({ id, defaultName, defaultTitle }: { id: string; defaultName: string; defaultTitle: string }) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [title, setTitle] = useState(defaultTitle);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <section className="mt-6 rounded-2xl border border-[rgba(212,160,23,0.35)] bg-[rgba(212,160,23,0.04)] p-6">
      <h2 className="text-lg font-semibold text-[var(--text)]">Sign the agreement</h2>
      <p className="mt-1 text-sm text-[var(--text-muted)]">Typing your name and pressing Sign is a legally binding electronic signature.</p>
      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="block font-mono text-[10px] tracking-wider text-[var(--text-muted)] uppercase mb-1.5">Full name *</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className={`${input} font-serif italic text-lg`} autoComplete="name" />
        </label>
        <label className="block">
          <span className="block font-mono text-[10px] tracking-wider text-[var(--text-muted)] uppercase mb-1.5">Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={input} autoComplete="organization-title" />
        </label>
      </div>
      <label className="mt-5 flex items-start gap-3 text-sm text-[var(--text-muted)] cursor-pointer">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 accent-[#d4a017]" />
        <span>I have read this agreement, I&apos;m authorised to sign it for the Client, and I agree to be bound by it. I agree that my typed name is my electronic signature.</span>
      </label>
      {error && <p role="alert" className="mt-4 font-mono text-xs text-[var(--red)]">{error}</p>}
      <button
        type="button"
        disabled={pending || !agree || name.trim().length < 2}
        onClick={() =>
          start(async () => {
            setError(null);
            const result = await signContractAction(id, { name, title, agree });
            if (result.ok) router.refresh();
            else setError(result.error);
          })
        }
        className="mt-5 btn-solid-gold inline-flex items-center gap-2"
      >
        {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PenLine className="w-3.5 h-3.5" />} Sign agreement
      </button>
    </section>
  );
}
