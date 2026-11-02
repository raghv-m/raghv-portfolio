"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, CheckCircle2, Loader2, Minus, Plus, Send } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";

import { submitEstimateAction } from "@/app/estimate/actions";
import { FieldError, invalidProps } from "@/components/ui/FieldError";
import { estimatorConfig } from "@/config/estimator";
import { formatDollars, priceEstimate, type EstimateResult, type PricingItem } from "@/lib/estimator/engine";
import { BUDGET_LABELS, TIMELINE_LABELS } from "@/lib/estimator/schema";

import { AddressAutocomplete, type Address } from "./AddressAutocomplete";
import { EASE_OUT } from "@/components/casefile/motion";

const STEPS = ["Project", "Size", "Features", "Integrations", "Hosting", "Details"] as const;

type Form = {
  category: string;
  pages: number;
  features: string[];
  integrations: string[];
  hosting: string | null;
  addons: string[];
  description: string;
  timeline?: string;
  budget?: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  address: Address;
  consent: boolean;
  website: string;
};

const inputClass = "cf-input";
const labelClass = "cf-label";

function Icon({ name, className }: { name: string | null; className?: string }) {
  return <DynamicIcon name={(name ?? "box") as IconName} fallback={() => <span className={className} />} className={className} />;
}

export function EstimateWizard({ catalog }: { catalog: PricingItem[] }) {
  const sections = useMemo(() => {
    const by = (section: PricingItem["section"]) => catalog.filter((item) => item.section === section);
    return { category: by("category"), feature: by("feature"), integration: by("integration"), hosting: by("hosting"), addon: by("addon") };
  }, [catalog]);

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<Form>({
    category: "",
    pages: 5,
    features: [],
    integrations: [],
    hosting: sections.hosting[0]?.slug ?? null,
    addons: [],
    description: "",
    name: "",
    email: "",
    company: "",
    phone: "",
    address: {},
    consent: false,
    website: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"name" | "email" | "consent", string>>>({});
  const [submitted, setSubmitted] = useState<{ reference: string; result: EstimateResult; emailed: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  const estimate = form.category ? priceEstimate(catalog, form, estimatorConfig.myPriceRatio) : null;
  const category = sections.category.find((item) => item.slug === form.category);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((current) => ({ ...current, [key]: value }));
  const toggle = (key: "features" | "integrations" | "addons", slug: string) =>
    setForm((current) => ({
      ...current,
      [key]: current[key].includes(slug) ? current[key].filter((s) => s !== slug) : [...current[key], slug],
    }));

  const canContinue = step !== 0 || Boolean(form.category);
  const go = (next: number) => {
    setError(null);
    setDirection(next > step ? 1 : -1);
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function chooseCategory(item: PricingItem) {
    setForm((current) => ({ ...current, category: item.slug, pages: Math.max(item.included_pages, 1) }));
    setDirection(1);
    setTimeout(() => setStep(1), 180);
  }

  function submit() {
    setError(null);
    const errors: typeof fieldErrors = {};
    if (!form.name.trim()) errors.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Enter a valid email address so I can send the estimate.";
    if (!form.consent) errors.consent = "Please agree to the privacy policy so I can reply.";
    setFieldErrors(errors);
    const first = (["name", "email", "consent"] as const).find((k) => errors[k]);
    if (first) {
      requestAnimationFrame(() => document.getElementById(first === "consent" ? "consent" : first)?.focus());
      return;
    }
    startTransition(async () => {
      const result = await submitEstimateAction({
        ...form,
        company: form.company || undefined,
        phone: form.phone || undefined,
        description: form.description || undefined,
      });
      if (result.ok) {
        setSubmitted(result);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else setError(result.error);
    });
  }

  if (submitted) return <Submitted {...submitted} email={form.email} />;

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
      <div className="min-w-0">
        <Progress step={step} onJump={(i) => (i < step || (i > 0 && form.category) ? go(i) : undefined)} />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -28 }}
            transition={{ duration: 0.34, ease: EASE_OUT }}
            className="mt-8"
          >
            {step === 0 && (
              <StepFrame title="What are you building?" hint="Pick the closest match. You can describe it in your own words at the end.">
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                  {sections.category.map((item) => (
                    <OptionCard
                      key={item.slug}
                      item={item}
                      selected={form.category === item.slug}
                      onClick={() => chooseCategory(item)}
                      price={`from ${formatDollars(item.price_cents)}`}
                    />
                  ))}
                </div>
              </StepFrame>
            )}

            {step === 1 && category && (
              <StepFrame title="How many pages?" hint={category.included_pages > 0 ? `${category.label} includes ${category.included_pages} page${category.included_pages === 1 ? "" : "s"}. Extra pages are ${formatDollars(category.per_page_cents)} each.` : "This service isn't priced by page."}>
                <div className="p-6 sm:p-8" style={{ border: "2px solid var(--cf-ink)", background: "var(--cf-paper-2)" }}>
                  <div className="flex items-center justify-center gap-6">
                    <button type="button" aria-label="Fewer pages" onClick={() => set("pages", Math.max(1, form.pages - 1))} className="size-11 rounded-full border border-[var(--cf-faint)] grid place-items-center text-[var(--cf-ink)] hover:border-[var(--cf-ink)] hover:text-[var(--cf-red)] transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="text-center min-w-28">
                      <motion.p key={form.pages} initial={{ scale: 0.85, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} className="cf-display text-[64px] leading-none text-[var(--cf-ink)] tabular-nums">
                        {form.pages}
                      </motion.p>
                      <p className="font-mono cf-fs-data tracking-widest text-[var(--cf-muted)] mt-2">PAGE{form.pages === 1 ? "" : "S"}</p>
                    </div>
                    <button type="button" aria-label="More pages" onClick={() => set("pages", Math.min(200, form.pages + 1))} className="size-11 rounded-full border border-[var(--cf-faint)] grid place-items-center text-[var(--cf-ink)] hover:border-[var(--cf-ink)] hover:text-[var(--cf-red)] transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <input type="range" min={1} max={60} value={Math.min(form.pages, 60)} onChange={(e) => set("pages", Number(e.target.value))} aria-label="Number of pages" className="w-full mt-8 accent-[var(--cf-gold)]" />
                  <div className="flex justify-between font-mono cf-fs-data text-[var(--cf-muted)] mt-1"><span>1</span><span>60+</span></div>
                  <p className="text-xs text-[var(--cf-muted)] mt-6">Typical pages: Home, About, Services, each service page, Contact, Blog, FAQ, Privacy.</p>
                </div>
              </StepFrame>
            )}

            {step === 2 && (
              <StepFrame title="What should it do?" hint="Pick anything you need. Skip what you don't.">
                <div className="grid sm:grid-cols-2 gap-3">
                  {sections.feature.map((item) => (
                    <ToggleCard key={item.slug} item={item} selected={form.features.includes(item.slug)} onClick={() => toggle("features", item.slug)} />
                  ))}
                </div>
              </StepFrame>
            )}

            {step === 3 && (
              <StepFrame title="Anything to connect?" hint="Payments, maps, email tools and other services.">
                <div className="grid sm:grid-cols-2 gap-3">
                  {sections.integration.map((item) => (
                    <ToggleCard key={item.slug} item={item} selected={form.integrations.includes(item.slug)} onClick={() => toggle("integrations", item.slug)} />
                  ))}
                </div>
              </StepFrame>
            )}

            {step === 4 && (
              <StepFrame title="Hosting and extras" hint="Who looks after the site once it's live, and a few optional extras.">
                <p className={labelClass}>Hosting</p>
                <div className="grid sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Hosting">
                  {sections.hosting.map((item) => (
                    <ToggleCard key={item.slug} item={item} radio selected={form.hosting === item.slug} onClick={() => set("hosting", item.slug)} />
                  ))}
                </div>
                <p className={`${labelClass} mt-8`}>Extras</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {sections.addon.map((item) => (
                    <ToggleCard key={item.slug} item={item} selected={form.addons.includes(item.slug)} onClick={() => toggle("addons", item.slug)} />
                  ))}
                </div>
              </StepFrame>
            )}

            {step === 5 && (
              <StepFrame title="Tell me about it" hint="A few details so I can come back with a firm quote. Your estimate is emailed to you.">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="description" className={labelClass}>Describe your project</label>
                    <textarea id="description" rows={5} maxLength={4000} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What's it for, who uses it, sites you like, anything that must be included…" className={inputClass} />
                  </div>
                  <ChipGroup label="When do you need it?" options={TIMELINE_LABELS} value={form.timeline} onChange={(v) => set("timeline", v)} />
                  <ChipGroup label="Budget in mind" options={BUDGET_LABELS} value={form.budget} onChange={(v) => set("budget", v)} />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="cf-field">
                      <label htmlFor="name" className={labelClass}>Name *</label>
                      <input id="name" required autoComplete="name" {...invalidProps("name", fieldErrors.name)} value={form.name} onChange={(e) => set("name", e.target.value)} className={`${inputClass} aria-[invalid=true]:border-[var(--red)]`} />
                      <FieldError name="name" message={fieldErrors.name} />
                    </div>
                    <div className="cf-field">
                      <label htmlFor="email" className={labelClass}>Email *</label>
                      <input id="email" type="email" required autoComplete="email" {...invalidProps("email", fieldErrors.email)} value={form.email} onChange={(e) => set("email", e.target.value)} className={`${inputClass} aria-[invalid=true]:border-[var(--red)]`} />
                      <FieldError name="email" message={fieldErrors.email} />
                    </div>
                    <div className="cf-field">
                      <label htmlFor="company" className={labelClass}>Business name</label>
                      <input id="company" autoComplete="organization" value={form.company} onChange={(e) => set("company", e.target.value)} className={inputClass} />
                    </div>
                    <div className="cf-field">
                      <label htmlFor="phone" className={labelClass}>Phone</label>
                      <input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <p className={labelClass}>Business location</p>
                    <AddressAutocomplete value={form.address} onChange={(address) => set("address", address)} />
                  </div>

                  {/* Honeypot: hidden from people, tempting to bots. */}
                  <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={(e) => set("website", e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" name="website" />

                  <label className="flex items-start gap-3 text-sm text-[var(--cf-muted)] cursor-pointer">
                    <input id="consent" type="checkbox" {...invalidProps("consent", fieldErrors.consent)} checked={form.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-1 accent-[var(--cf-gold)]" />
                    <span>
                      I agree to my details being used to reply to this request, as described in the{" "}
                      <Link href="/privacy" target="_blank" className="text-[var(--cf-gold)] hover:underline">privacy policy</Link>.
                    </span>
                  </label>
                  <FieldError name="consent" message={fieldErrors.consent} />
                </div>
              </StepFrame>
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <p role="alert" className="mt-6 font-mono text-xs text-[var(--red)] bg-[rgba(255,68,68,0.08)] px-3 py-2 rounded border border-[rgba(255,68,68,0.15)]">
            {error}
          </p>
        )}

        {step > 0 && (
          <div className="mt-8 flex items-center justify-between gap-4">
            <button type="button" onClick={() => go(step - 1)} className="btn-ghost btn-no-arrow inline-flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button type="button" disabled={!canContinue} onClick={() => go(step + 1)} className="btn-gold">
                {step >= 2 && step <= 4 && !(step === 2 ? form.features.length : step === 3 ? form.integrations.length : 1) ? "Skip" : "Continue"}
              </button>
            ) : (
              <button type="button" disabled={pending} onClick={submit} className="btn-solid-gold inline-flex items-center gap-2">
                {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} {pending ? "Sending…" : "Email me my estimate"}
              </button>
            )}
          </div>
        )}
      </div>

      <EstimatePanel estimate={estimate} categoryLabel={category?.label} pages={form.pages} />
    </div>
  );
}

function Progress({ step, onJump }: { step: number; onJump: (i: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between font-mono cf-fs-data tracking-wider text-[var(--cf-muted)]">
        <span>STEP {step + 1} / {STEPS.length}</span>
        <span className="text-[var(--cf-red)] font-bold">{STEPS[step].toUpperCase()}</span>
      </div>
      <div className="mt-3 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${STEPS.length}, minmax(0, 1fr))` }}>
        {STEPS.map((label, i) => (
          <button key={label} type="button" onClick={() => onJump(i)} aria-label={`Go to ${label}`} className="group py-1">
            <span className="block h-1 overflow-hidden bg-[var(--cf-faint)]">
              {/* U4 (upscale pass): the step fill scales on X instead of
                  animating width. */}
              <motion.span className="block h-full w-full bg-[var(--cf-red)]" style={{ transformOrigin: "left center" }} initial={false} animate={{ scaleX: i <= step ? 1 : 0 }} transition={{ duration: 0.4, ease: EASE_OUT }} />
            </span>
            <span className={`hidden sm:block mt-1.5 text-left font-mono cf-fs-data tracking-wider ${i === step ? "text-[var(--cf-ink)] font-bold" : "text-[var(--cf-muted)] group-hover:text-[var(--cf-ink)]"}`}>{label.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepFrame({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="cf-display text-[30px] sm:text-[36px] leading-none text-[var(--cf-ink)]">{title}</h2>
      <p className="mt-3 text-sm text-[var(--cf-muted)] max-w-xl leading-relaxed">{hint}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function OptionCard({ item, selected, onClick, price }: { item: PricingItem; selected: boolean; onClick: () => void; price: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      aria-pressed={selected}
      className="cf-opt group h-full"
    >
      <span className={`inline-grid place-items-center size-9 mb-3 transition-colors ${selected ? "bg-[var(--cf-ink)] text-[var(--cf-paper)]" : "bg-[var(--cf-paper-2)] text-[var(--cf-gold)]"}`} style={{ border: "1px solid var(--cf-faint)" }}>
        <Icon name={item.icon} className="w-4.5 h-4.5" />
      </span>
      <span className="block text-sm font-semibold leading-snug">{item.label}</span>
      <span className="block cf-fs-label text-[var(--cf-muted)] mt-1 leading-relaxed line-clamp-2">{item.description}</span>
      <span className="block font-mono cf-fs-data text-[var(--cf-gold)] mt-3">{price}</span>
    </motion.button>
  );
}

function ToggleCard({ item, selected, onClick, radio }: { item: PricingItem; selected: boolean; onClick: () => void; radio?: boolean }) {
  const price =
    item.slug === "rush"
      ? "+25%"
      : [item.price_cents ? formatDollars(item.price_cents) : null, item.monthly_cents ? `${formatDollars(item.monthly_cents)}/mo` : null].filter(Boolean).join(" + ") || "Included";
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      role={radio ? "radio" : "checkbox"}
      aria-checked={selected}
      className="cf-opt flex items-start gap-3"
    >
      <span className={`shrink-0 inline-grid place-items-center size-8 ${selected ? "bg-[var(--cf-ink)] text-[var(--cf-paper)]" : "bg-[var(--cf-paper-2)] text-[var(--cf-gold)]"}`} style={{ border: "1px solid var(--cf-faint)" }}>
        {selected ? <Check className="w-4 h-4" /> : <Icon name={item.icon} className="w-4 h-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold">{item.label}</span>
          <span className="shrink-0 font-mono cf-fs-data text-[var(--cf-gold)] mt-0.5">{price}</span>
        </span>
        <span className="block cf-fs-label text-[var(--cf-muted)] mt-1 leading-relaxed">{item.description}</span>
      </span>
    </motion.button>
  );
}

function ChipGroup({ label, options, value, onChange }: { label: string; options: Record<string, string>; value?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {Object.entries(options).map(([key, text]) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={value === key}
            onClick={() => onChange(key)}
            className="cf-chip"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

function EstimatePanel({ estimate, categoryLabel, pages }: { estimate: EstimateResult | null; categoryLabel?: string; pages: number }) {
  return (
    <aside className="lg:sticky lg:top-8">
      <div style={{ border: "2px solid var(--cf-ink)", background: "var(--cf-paper-2)" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "3px double var(--cf-ink)" }}>
          <span className="font-mono cf-fs-data tracking-widest text-[var(--cf-red)] font-bold">LIVE ESTIMATE</span>
          <span className="font-mono cf-fs-data text-[var(--cf-muted)]">CAD</span>
        </div>
        <div className="p-5">
          {!estimate ? (
            <p className="text-sm text-[var(--cf-muted)] leading-relaxed">Pick a project type to see a price range. It updates as you choose.</p>
          ) : (
            <>
              <p className="text-xs text-[var(--cf-muted)]">{categoryLabel} · {pages} page{pages === 1 ? "" : "s"}</p>
              <p className="mt-4 font-mono cf-fs-data tracking-wider text-[var(--cf-muted)] uppercase">{estimatorConfig.marketLabel}</p>
              <p className="mt-1 text-lg text-[var(--cf-muted)] line-through decoration-[var(--cf-red)] decoration-2 tabular-nums">
                {formatDollars(estimate.oneTimeLowCents)} – {formatDollars(estimate.oneTimeHighCents)}
              </p>
              <p className="mt-4 font-mono cf-fs-data tracking-wider text-[var(--cf-gold)] uppercase">{estimatorConfig.myPriceLabel}</p>
              <motion.p key={`${estimate.myLowCents}-${estimate.myHighCents}`} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: EASE_OUT, duration: 0.4 }} className="cf-display mt-1 text-[32px] leading-tight text-[var(--cf-ink)] tabular-nums">
                {formatDollars(estimate.myLowCents)}<span className="text-[var(--cf-muted)]"> – </span>{formatDollars(estimate.myHighCents)}
              </motion.p>
              {estimate.monthlyCents > 0 && <p className="mt-1 text-sm text-[var(--cf-gold)]">+ {formatDollars(estimate.monthlyCents)}/month hosting</p>}
              <p className="mt-3 cf-fs-label leading-relaxed text-[var(--cf-muted)]">{estimatorConfig.pitch}</p>
              <p className="mt-5 font-mono cf-fs-data tracking-wider text-[var(--cf-muted)] uppercase">Market estimate breakdown</p>
              <ul className="mt-2 space-y-2 pt-3" style={{ borderTop: "1px solid var(--cf-faint)" }}>
                <AnimatePresence initial={false}>
                  {estimate.lines.map((line) => (
                    <motion.li key={line.label} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ ease: EASE_OUT, duration: 0.3 }} className="flex justify-between gap-3 text-xs">
                      <span className="text-[var(--cf-muted)] truncate">{line.label}</span>
                      <span className="text-[var(--cf-ink)] tabular-nums shrink-0">
                        {line.oneTimeCents ? formatDollars(line.oneTimeCents) : ""}
                        {line.monthlyCents ? `${line.oneTimeCents ? " + " : ""}${formatDollars(line.monthlyCents)}/mo` : ""}
                        {!line.oneTimeCents && !line.monthlyCents ? "-" : ""}
                      </span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
              <p className="mt-5 cf-fs-data leading-relaxed text-[var(--cf-muted)]">An estimate, not a quote. Final price depends on content and design detail. Taxes extra.</p>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

function Submitted({ reference, result, emailed, email }: { reference: string; result: EstimateResult; emailed: boolean; email: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ ease: EASE_OUT, duration: 0.45 }} className="max-w-xl mx-auto text-center p-8 sm:p-10" style={{ border: "2px solid var(--cf-ink)", background: "var(--cf-paper-2)" }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }} className="mx-auto size-14 grid place-items-center" style={{ border: "2px solid var(--cf-green)" }}>
        <CheckCircle2 className="w-7 h-7 text-[var(--cf-green)]" />
      </motion.div>
      <p className="mt-6 font-mono cf-fs-data tracking-widest text-[var(--cf-red)] font-bold">ESTIMATE {reference}</p>
      <p className="mt-4 text-sm text-[var(--cf-muted)] line-through decoration-[var(--cf-red)]">
        Market: {formatDollars(result.oneTimeLowCents)} – {formatDollars(result.oneTimeHighCents)}
      </p>
      <h2 className="cf-display mt-1 text-[40px] leading-tight text-[var(--cf-ink)]">
        {formatDollars(result.myLowCents)} – {formatDollars(result.myHighCents)}
      </h2>
      <p className="font-mono cf-fs-data tracking-wider text-[var(--cf-gold)] mt-1">MY PRICE · CAD</p>
      {result.monthlyCents > 0 && <p className="mt-1 text-[var(--cf-gold)]">+ {formatDollars(result.monthlyCents)}/month hosting</p>}
      <p className="mt-5 text-sm text-[var(--cf-muted)] leading-relaxed">
        {emailed ? (
          <>
            Check <span className="text-[var(--cf-ink)] font-semibold">{email}</span>: your estimate is there, plus a link to set a password and open
            your client portal, where you can follow progress and message me.
          </>
        ) : (
          <>Your request is saved, but the email didn&apos;t go out. I&apos;ll reply to you directly.</>
        )}{" "}
        I&apos;ll reply within 1–2 business days with a firm quote.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/portfolio" className="btn-gold justify-center">See my work</Link>
        <Link href="/" className="btn-ghost justify-center">Back home</Link>
      </div>
    </motion.div>
  );
}
