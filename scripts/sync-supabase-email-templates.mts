// Pushes dark, on-brand versions of Supabase's account emails (password reset, confirmations,
// security notices) so they match the site's own emails. Links and Supabase variables
// ({{ .ConfirmationURL }} etc.) are unchanged, so sign-in flows behave exactly as before.
//
// Run: npx tsx --tsconfig tsconfig.json --env-file=.env.local scripts/sync-supabase-email-templates.mts [--dry-run]
// Needs SUPABASE_ACCESS_TOKEN (a Supabase personal access token) in .env.local.
import { writeFileSync } from "node:fs";

// Dynamic import: tsx loads mail.ts as CommonJS here, and a static named import fails.
const { emailDesign: d } = await import("../src/lib/mail.ts");

const PROJECT_REF = "uzqsvzepcsqyrtfsihak";
const notice = "If you didn't make this change, reset your password right away and reply to this email so I can help.";

type Template = { subject: string; preview: string; body: string };

const templates: Record<string, Template> = {
  recovery: {
    subject: "Reset your raghv.dev password",
    preview: "Choose a new password for your raghv.dev account",
    body: `
      ${d.eyebrow("Password reset")}
      ${d.heading("Choose a new password")}
      ${d.para("Someone asked to reset the password for this email address. If it was you, use the button below. If not, you can ignore this email and nothing changes.")}
      ${d.button("{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=recovery", "Choose a new password")}
      ${d.small("This link works once and expires in 24 hours.")}`,
  },
  confirmation: {
    subject: "Confirm your email address",
    preview: "Confirm your email to finish setting up your account",
    body: `
      ${d.eyebrow("Confirm your email")}
      ${d.heading("One more step")}
      ${d.para("Confirm this email address to finish setting up your raghv.dev account.")}
      ${d.button("{{ .ConfirmationURL }}", "Confirm my email")}
      ${d.small("If you didn't create an account, you can ignore this email.")}`,
  },
  invite: {
    subject: "You're invited to the raghv.dev client portal",
    preview: "Accept your invitation to the client portal",
    body: `
      ${d.eyebrow("Client portal")}
      ${d.heading("You're invited")}
      ${d.para("You've been invited to the raghv.dev client portal, where you'll find your estimate, agreement, invoices and project updates.")}
      ${d.button("{{ .ConfirmationURL }}", "Accept invitation")}`,
  },
  magic_link: {
    subject: "Your raghv.dev sign-in link",
    preview: "Your one-time sign-in link",
    body: `
      ${d.eyebrow("Sign in")}
      ${d.heading("Your sign-in link")}
      ${d.para("Use the button below to sign in. It works once and expires shortly.")}
      ${d.button("{{ .ConfirmationURL }}", "Sign in")}
      ${d.small("If you didn't ask for this, you can ignore this email.")}`,
  },
  email_change: {
    subject: "Confirm your new email address",
    preview: "Confirm the new email for your account",
    body: `
      ${d.eyebrow("Email change")}
      ${d.heading("Confirm your new email")}
      ${d.para(`Confirm ${d.strong("{{ .NewEmail }}")} as the new email address for your raghv.dev account.`)}
      ${d.button("{{ .ConfirmationURL }}", "Confirm new email")}
      ${d.small(notice)}`,
  },
  reauthentication: {
    subject: "{{ .Token }} is your verification code",
    preview: "Your verification code",
    body: `
      ${d.eyebrow("Verification")}
      ${d.heading("Your verification code")}
      ${d.facts([["Code", "{{ .Token }}"]])}
      ${d.small("It expires shortly. If you didn't ask for it, you can ignore this email.")}`,
  },
  password_changed_notification: {
    subject: "Your raghv.dev password was changed",
    preview: "Your password was changed",
    body: `${d.eyebrow("Security notice")}${d.heading("Your password was changed")}${d.para("The password for {{ .Email }} was just changed.")}${d.small(notice)}`,
  },
  email_changed_notification: {
    subject: "Your raghv.dev email address was changed",
    preview: "Your email address was changed",
    body: `${d.eyebrow("Security notice")}${d.heading("Your email address was changed")}${d.para("The email for your account changed from {{ .OldEmail }} to {{ .Email }}.")}${d.small(notice)}`,
  },
  mfa_factor_enrolled_notification: {
    subject: "A verification method was added to your account",
    preview: "A verification method was added",
    body: `${d.eyebrow("Security notice")}${d.heading("Verification method added")}${d.para("A {{ .FactorType }} verification method was added to your account.")}${d.small(notice)}`,
  },
  mfa_factor_unenrolled_notification: {
    subject: "A verification method was removed from your account",
    preview: "A verification method was removed",
    body: `${d.eyebrow("Security notice")}${d.heading("Verification method removed")}${d.para("A {{ .FactorType }} verification method was removed from your account.")}${d.small(notice)}`,
  },
  identity_linked_notification: {
    subject: "A sign-in method was linked to your account",
    preview: "A sign-in method was linked",
    body: `${d.eyebrow("Security notice")}${d.heading("Sign-in method linked")}${d.para("Your {{ .Provider }} account was linked as a way to sign in to {{ .Email }}.")}${d.small(notice)}`,
  },
  identity_unlinked_notification: {
    subject: "A sign-in method was removed from your account",
    preview: "A sign-in method was removed",
    body: `${d.eyebrow("Security notice")}${d.heading("Sign-in method removed")}${d.para("Your {{ .Provider }} account was removed as a way to sign in to {{ .Email }}.")}${d.small(notice)}`,
  },
  phone_changed_notification: {
    subject: "Your phone number was changed",
    preview: "Your phone number was changed",
    body: `${d.eyebrow("Security notice")}${d.heading("Your phone number was changed")}${d.para("The phone number for your account changed from {{ .OldPhone }} to {{ .Phone }}.")}${d.small(notice)}`,
  },
};

const payload: Record<string, string> = {};
for (const [name, t] of Object.entries(templates)) {
  payload[`mailer_subjects_${name}`] = t.subject;
  payload[`mailer_templates_${name}_content`] = d.layout(t.body, t.preview);
}

if (process.argv.includes("--dry-run")) {
  for (const [name, t] of Object.entries(templates)) writeFileSync(`supabase-email-${name}.html`, d.layout(t.body, t.preview));
  console.log(`Wrote ${Object.keys(templates).length} previews (supabase-email-*.html). Nothing was sent to Supabase.`);
  process.exit(0);
}

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) throw new Error("SUPABASE_ACCESS_TOKEN is missing (add it to .env.local)");
const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
  method: "PATCH",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
if (!res.ok) throw new Error(`Supabase rejected the update: ${res.status} ${(await res.text()).slice(0, 300)}`);
console.log(`Updated ${Object.keys(templates).length} Supabase email templates.`);
