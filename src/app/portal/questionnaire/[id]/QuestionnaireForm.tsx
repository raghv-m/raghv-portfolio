"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";

import { submitQuestionnaireAction } from "@/app/portal/actions";
import { BUSINESS_TYPES, PAYMENT_METHODS, PAYMENT_SCHEDULES } from "@/lib/contracts/questionnaire";

const input =
  "w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[rgba(212,160,23,0.5)]";

type Values = Record<string, string | boolean>;

export function QuestionnaireForm({ id, defaults }: { id: string; defaults: Record<string, string> }) {
  const router = useRouter();
  const [values, setValues] = useState<Values>({
    businessType: BUSINESS_TYPES[0],
    contentReady: "some",
    brandAssets: "partly",
    domainStatus: "have-domain",
    paymentMethod: PAYMENT_METHODS[0],
    paymentSchedule: "40-40-20",
    consentElectronic: false,
    ...defaults,
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const field = (key: string, label: string, props: { required?: boolean; type?: string; textarea?: boolean; placeholder?: string; full?: boolean } = {}) => (
    <label className={`block ${props.full ? "sm:col-span-2" : ""}`}>
      <span className="block font-mono text-[10px] tracking-wider text-[var(--text-muted)] uppercase mb-1.5">{label}{props.required ? " *" : ""}</span>
      {props.textarea ? (
        <textarea rows={4} value={String(values[key] ?? "")} onChange={set(key)} placeholder={props.placeholder} className={input} />
      ) : (
        <input type={props.type ?? "text"} value={String(values[key] ?? "")} onChange={set(key)} placeholder={props.placeholder} className={input} />
      )}
    </label>
  );
  const select = (key: string, label: string, options: Record<string, string> | readonly string[]) => (
    <label className="block">
      <span className="block font-mono text-[10px] tracking-wider text-[var(--text-muted)] uppercase mb-1.5">{label} *</span>
      <select value={String(values[key])} onChange={set(key)} className={input}>
        {(Array.isArray(options) ? options.map((o) => [o, o]) : Object.entries(options)).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
      </select>
    </label>
  );

  function submit() {
    setError(null);
    start(async () => {
      const result = await submitQuestionnaireAction(id, values);
      if (!result.ok) {
        setError(result.error);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else router.refresh();
    });
  }

  const section = "rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.01)] p-6 space-y-4";
  const heading = "text-lg font-semibold text-[var(--text)]";

  return (
    <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      {error && <p role="alert" className="font-mono text-xs text-[var(--red)] bg-[rgba(255,68,68,0.08)] px-3 py-2 rounded border border-[rgba(255,68,68,0.15)]">{error}</p>}

      <section className={section}>
        <h2 className={heading}>Your business</h2>
        <p className="text-xs text-[var(--text-muted)]">This is the &ldquo;Client&rdquo; on the agreement. For a personal project, use your full name.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {field("legalName", "Legal business name", { required: true, placeholder: "e.g. Acme Widgets Ltd." })}
          {field("operatingName", "Operating / trade name", { placeholder: "If different" })}
          {select("businessType", "Business type", BUSINESS_TYPES)}
          {field("phone", "Phone", { type: "tel" })}
          {field("addressLine1", "Street address", { required: true, full: true })}
          {field("addressLine2", "Unit / suite", {})}
          {field("city", "City", { required: true })}
          {field("region", "Province / state", { required: true })}
          {field("postalCode", "Postal code", { required: true })}
          {field("country", "Country", { required: true })}
        </div>
      </section>

      <section className={section}>
        <h2 className={heading}>Who signs the agreement</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {field("signerName", "Full name", { required: true })}
          {field("signerTitle", "Title", { required: true, placeholder: "Owner, Director, ..." })}
          {field("signerEmail", "Email for the agreement", { required: true, type: "email", full: true })}
        </div>
      </section>

      <section className={section}>
        <h2 className={heading}>Your project</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {field("projectGoals", "What should the project achieve?", { required: true, textarea: true, full: true, placeholder: "More enquiries, online bookings, look more professional, sell online..." })}
          {field("audience", "Who is it for?", { textarea: true, full: true })}
          {field("mustHaves", "Must-have features or requirements", { textarea: true, full: true })}
          {field("pagesList", "Pages you want", { textarea: true, full: true, placeholder: "Home, About, Services, Contact..." })}
          {field("referenceSites", "Sites you like (links)", { textarea: true, full: true })}
          {select("contentReady", "Is your text and photography ready?", { all: "Yes, all of it", some: "Some of it", none: "Not yet" })}
          {select("brandAssets", "Do you have a logo and brand colours?", { yes: "Yes", partly: "Partly", no: "No" })}
          {select("domainStatus", "Domain name", { "have-domain": "I have one", "need-domain": "I need one", "not-sure": "Not sure" })}
          {field("targetLaunch", "Ideal launch date", { type: "date" })}
          {field("hostingNotes", "Current website / hosting (if any)", { full: true })}
        </div>
      </section>

      <section className={section}>
        <h2 className={heading}>Payment</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {select("paymentMethod", "How will you pay?", PAYMENT_METHODS)}
          {select("paymentSchedule", "Payment schedule", PAYMENT_SCHEDULES)}
          {field("billingEmail", "Email for invoices", { required: true, type: "email", full: true })}
        </div>
      </section>

      <section className={section}>
        <h2 className={heading}>Anything else</h2>
        {field("notes", "Notes", { textarea: true, full: true })}
        <label className="flex items-start gap-3 text-sm text-[var(--text-muted)] cursor-pointer">
          <input type="checkbox" checked={Boolean(values.consentElectronic)} onChange={set("consentElectronic")} className="mt-1 accent-[#d4a017]" />
          <span>I agree to receive and sign the agreement and other project documents electronically, and confirm the details above are accurate.</span>
        </label>
      </section>

      <button type="submit" disabled={pending} className="btn-solid-gold inline-flex items-center gap-2">
        {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Submit questionnaire
      </button>
    </form>
  );
}
