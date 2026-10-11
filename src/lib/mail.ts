import nodemailer from "nodemailer";

import { site } from "@/config/site";

function getTransport() {
  if (process.env.MAIL_PROVIDER === "resend") {
    return nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: { user: "resend", pass: process.env.RESEND_API_KEY },
    });
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
   .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

// Only allow https:// links in admin-composed HTML: blocks javascript:/data: URI injection.
const safeHref = (url: string | undefined | null) =>
  url && /^https:\/\//i.test(url.trim()) ? esc(url.trim()) : undefined;

const FROM = process.env.SMTP_FROM || "Raghav Mahajan <onboarding@resend.dev>";
const TO = process.env.CONTACT_RECEIVER_EMAIL || "raaghvv0508@gmail.com";

/** The sign-in page, continuing to `next` afterwards. Never expires, unlike one-time links. */
export function signInUrl(next = "/portal", origin = site.url) {
  return `${origin}/auth/login?next=${encodeURIComponent(next)}`;
}

/**
 * Turns a mail provider error into a sentence the admin can act on. Resend's raw messages are
 * long and mention settings by their internal names.
 */
export function friendlyMailError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  if (/testing emails|only send.*own email/i.test(raw)) return "Resend is in test mode and only sends to your own address. Verify your domain at resend.com/domains and send from it (SMTP_FROM).";
  if (/domain is not verified/i.test(raw)) return `The sending domain isn't verified in the Resend account this API key belongs to. Check SMTP_FROM (${FROM.replace(/.*</, "").replace(/>.*/, "")}) and the key.`;
  if (/invalid.*(api key|credentials)|authentication failed|EAUTH|535/i.test(raw)) return "Resend rejected the API key. Create a new key in Resend and update RESEND_API_KEY.";
  if (/rate limit|too many|429/i.test(raw)) return "Resend's sending limit was hit. Wait a minute and try again.";
  if (/ETIMEDOUT|ECONNREFUSED|ENOTFOUND|ESOCKET|ECONNECTION/i.test(raw)) return "Couldn't reach the mail server. Try again in a moment.";
  if (/recipient|mailbox|address.*(invalid|rejected)/i.test(raw)) return "The recipient address was rejected. Check the client's email for typos.";
  return raw || "The email couldn't be sent.";
}

// ─── Design tokens (dark) ──────────────────────────────────────────────────
const C = {
  page: "#070707",
  card: "#0f0f0f",
  panel: "#151515",
  border: "#262626",
  text: "#f2f2f2",
  body: "#b4b4b4",
  muted: "#7c7c7c",
  faint: "#555555",
  gold: "#d4a017",
  goldSoft: "#1d1806",
  green: "#3ddc97",
};
// Always the production URL: an email can be opened years later, from any device.
const LOGO_URL = "https://www.raghv.dev/logo-email.png";
const SANS = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const MONO = "'SFMono-Regular',Menlo,Consolas,'Courier New',monospace";

// Building blocks. Inline styles and tables only: that's what email clients render reliably.
const eyebrow = (t: string) =>
  `<p style="margin:0 0 10px;font-family:${MONO};font-size:11px;line-height:1.4;color:${C.gold};letter-spacing:0.14em;text-transform:uppercase;">${t}</p>`;
const heading = (t: string) =>
  `<h1 style="margin:0 0 14px;font-family:${SANS};font-size:24px;line-height:1.3;font-weight:700;color:${C.text};">${t}</h1>`;
const para = (t: string, last = false) =>
  `<p style="margin:0 0 ${last ? 0 : 18}px;font-family:${SANS};font-size:15px;line-height:1.7;color:${C.body};">${t}</p>`;
const small = (t: string) =>
  `<p style="margin:18px 0 0;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.muted};">${t}</p>`;
const strong = (t: string) => `<span style="color:${C.text};font-weight:600;">${t}</span>`;
const link = (url: string, t: string) => `<a href="${url}" style="color:${C.gold};text-decoration:underline;">${t}</a>`;

/** Bulletproof button: a table cell with padding, so it stays clickable even when CSS is stripped. */
function button(url: string, label: string, variant: "primary" | "secondary" = "primary") {
  const primary = variant === "primary";
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 4px;">
    <tr><td bgcolor="${primary ? C.gold : C.card}" style="border-radius:6px;border:1px solid ${primary ? C.gold : C.border};">
      <a href="${url}" target="_blank" style="display:inline-block;padding:13px 26px;font-family:${SANS};font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;color:${primary ? "#0a0a0a" : C.text};border-radius:6px;">${label} &rarr;</a>
    </td></tr>
  </table>`;
}

/** Key/value summary, e.g. amount and due date. */
function facts(rows: [string, string][], accent = C.gold) {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.panel}" style="margin:4px 0 22px;background:${C.panel};border:1px solid ${C.border};border-left:3px solid ${accent};border-radius:8px;">
    ${rows.map(([k, v], i) => `
    <tr><td style="padding:${i ? 4 : 16}px 18px ${i === rows.length - 1 ? 16 : 4}px;">
      <p style="margin:0;font-family:${MONO};font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:${C.muted};">${k}</p>
      <p style="margin:3px 0 0;font-family:${SANS};font-size:${i === 0 ? 20 : 15}px;font-weight:${i === 0 ? 700 : 500};color:${C.text};">${v}</p>
    </td></tr>`).join("")}
  </table>`;
}

/** Panel with a title, for secondary information inside an email. */
function panel(title: string, inner: string) {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.panel}" style="margin:22px 0 0;background:${C.panel};border:1px solid ${C.border};border-radius:8px;">
    <tr><td style="padding:18px;">
      <p style="margin:0 0 8px;font-family:${MONO};font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:${C.gold};">${title}</p>
      ${inner}
    </td></tr>
  </table>`;
}

/** How the client gets in: the sign-in page, continuing to the right page afterwards. */
export type PortalAccess = { signInUrl: string; email: string };

const FIRST_TIME = "First time? Set your password with \"Forgot password\" on the sign-in page.";

function portalAccess(access: PortalAccess, label: string) {
  return `${button(access.signInUrl, label)}
  <p style="margin:12px 0 0;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.muted};">Sign in with ${strong(esc(access.email))}. ${FIRST_TIME}</p>`;
}

function layout(content: string, preview: string) {
  return `<!DOCTYPE html>
<html lang="en" style="color-scheme:dark;supported-color-schemes:dark;">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="dark"/>
  <meta name="supported-color-schemes" content="dark"/>
  <title>${esc(preview)}</title>
  <style>
    :root { color-scheme: dark; supported-color-schemes: dark; }
    @media (max-width:600px) { .px { padding-left:22px !important; padding-right:22px !important; } }
  </style>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body bgcolor="${C.page}" style="margin:0;padding:0;background:${C.page};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.page};">${esc(preview)}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.page}" style="background:${C.page};">
    <tr><td align="center" style="padding:36px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;">
        <tr><td style="padding:0 6px 18px;">
          <!-- PNG, not SVG: most email clients don't render SVG. Gold version, made for dark backgrounds. -->
          <a href="${site.url}" style="text-decoration:none;"><img src="${LOGO_URL}" width="120" height="48" alt="RAGHV.DEV" style="display:block;width:120px;height:48px;border:0;outline:none;color:${C.gold};font-family:${MONO};font-size:14px;font-weight:700;letter-spacing:0.12em;"/></a>
        </td></tr>
        <tr><td bgcolor="${C.card}" style="background:${C.card};border:1px solid ${C.border};border-radius:12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td height="3" style="height:3px;line-height:3px;font-size:0;background:${C.gold};border-radius:12px 12px 0 0;">&nbsp;</td></tr>
            <tr><td class="px" style="padding:34px 34px 32px;">${content}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:20px 6px 0;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.faint};">
          Raghav Mahajan &middot; Web design &amp; security &middot; Edmonton, Alberta<br/>
          Reply to this email and it comes straight to me. &middot; <a href="${site.url}" style="color:${C.muted};text-decoration:none;">raghv.dev</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Plain-text version of an HTML email. Mail with a text part is less likely to land in spam. */
function toText(html: string) {
  return html
    .replace(/<head[\s\S]*?<\/head>/i, "")
    .replace(/<div style="display:none[\s\S]*?<\/div>/i, "")
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => `${label.replace(/<[^>]+>/g, "").trim()} (${href.replace(/&amp;/g, "&")})`)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h1|tr|div)>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&rarr;/g, "->").replace(/&middot;/g, "·").replace(/&nbsp;|&zwnj;/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/^[ \t]+|[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim();
}

// ─── Generic send ──────────────────────────────────────────────────────────
export async function sendMail({
  to,
  subject,
  html,
  attachments,
  replyTo = TO,
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer; contentType: string }[];
  replyTo?: string;
}) {
  const transport = getTransport();
  // The sending address can't receive mail, so replies go to the inbox in CONTACT_RECEIVER_EMAIL.
  await transport.sendMail({ from: FROM, to, subject, html, text: toText(html), attachments, replyTo });
}

// ─── Batched send ──────────────────────────────────────────────────────────
// Sends in fixed-size concurrent chunks instead of one email at a time, so a
// large subscriber list doesn't serialize into a single long-running request
// that risks hitting the platform's function timeout.
export async function sendMailBatch(
  items: { to: string; subject: string; html: string }[],
  concurrency = 10
): Promise<{ sent: number; errors: { to: string; error: string }[] }> {
  let sent = 0;
  const errors: { to: string; error: string }[] = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    const results = await Promise.allSettled(chunk.map((item) => sendMail(item)));
    results.forEach((result, idx) => {
      if (result.status === "fulfilled") {
        sent++;
      } else {
        errors.push({ to: chunk[idx].to, error: friendlyMailError(result.reason) });
      }
    });
  }

  return { sent, errors };
}

// ─── New-post subscriber notification ─────────────────────────────────────
export async function notifySubscribersAboutPost(post: { title: string; slug: string; excerpt: string }) {
  const { prisma } = await import("@/lib/prisma");
  const subscribers = await prisma.subscriber.findMany({
    where: { active: true },
    select: { email: true, unsubscribeToken: true },
  });
  if (subscribers.length === 0) return;

  const items = subscribers.map((sub) => {
    const unsubLink = `${site.url}/unsubscribe?token=${sub.unsubscribeToken}`;
    const html = layout(`
      ${eyebrow("New post")}
      ${heading(esc(post.title))}
      ${para(esc(post.excerpt))}
      ${button(`${site.url}/blog/${post.slug}`, "Read the post")}
      ${small(`You're subscribed to Raghav's Cyber Daily. ${link(unsubLink, "Unsubscribe")}`)}
    `, post.excerpt || post.title);
    return { to: sub.email, subject: `New post: ${post.title}`, html };
  });

  const { errors } = await sendMailBatch(items);
  errors.forEach((e) => console.error(`[notify-subscribers] failed for ${e.to}:`, e.error));
}

// ─── Contact notification (to Raghav) ─────────────────────────────────────
export async function sendContactNotification(data: {
  name: string; email: string; subject: string; message: string;
}) {
  const html = layout(`
    ${eyebrow("New contact message")}
    ${heading(esc(data.subject))}
    ${facts([["From", `${esc(data.name)}`], ["Email", esc(data.email)]])}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;">
      <tr><td style="font-family:${SANS};font-size:15px;line-height:1.7;color:${C.text};white-space:pre-wrap;">${esc(data.message)}</td></tr>
    </table>
    ${button(`mailto:${encodeURIComponent(data.email)}?subject=${encodeURIComponent("Re: " + data.subject)}`, `Reply to ${esc(data.name)}`)}
    ${small("Hitting Reply in your inbox also goes straight to them.")}
  `, `New message from ${data.name}`);

  await sendMail({ to: TO, subject: `[raghv.dev] ${data.subject}`, html, replyTo: data.email });
}

// ─── Contact auto-reply (to sender) ───────────────────────────────────────
export async function sendAutoReply(to: string, name: string) {
  const html = layout(`
    ${eyebrow("Message received")}
    ${heading(`Thanks, ${esc(name)}.`)}
    ${para(`Your message came through. I read every one myself and will reply within ${strong("1 to 2 business days")}.`)}
    ${para("If you want to add anything, just reply to this email.")}
    ${button(site.url, "Visit raghv.dev", "secondary")}
  `, `I got your message, ${name}`);

  await sendMail({ to, subject: "Got your message: Raghav Mahajan", html });
}

// ─── Invoice (to client, PDF attached) ─────────────────────────────────────
export async function sendInvoiceEmail({
  to,
  clientName,
  invoiceNumber,
  amount,
  dueDate,
  pdf,
  access,
}: {
  to: string;
  clientName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  pdf: Buffer;
  access: PortalAccess;
}) {
  // Due dates are plain dates (2026-10-25): format in UTC so Edmonton time doesn't shift them back a day.
  const due = new Intl.DateTimeFormat("en-CA", { dateStyle: "long", timeZone: /^\d{4}-\d{2}-\d{2}$/.test(dueDate) ? "UTC" : "America/Edmonton" }).format(new Date(dueDate));
  const html = layout(`
    ${eyebrow(`Invoice ${esc(invoiceNumber)}`)}
    ${heading(`Hi ${esc(clientName)},`)}
    ${para("Here's your invoice. The PDF is attached, and you can also find it in your client portal.")}
    ${facts([["Amount due", esc(amount)], ["Due by", esc(due)], ["Invoice", esc(invoiceNumber)]])}
    ${portalAccess(access, "Sign in to view invoices")}
    ${small("Questions about this invoice? Just reply to this email.")}
  `, `Invoice ${invoiceNumber}: ${amount}, due ${due}`);

  await sendMail({
    to,
    subject: `Invoice ${invoiceNumber} from Raghav Mahajan (${amount})`,
    html,
    attachments: [{ filename: `${invoiceNumber}.pdf`, content: pdf, contentType: "application/pdf" }],
  });
}

// ─── Project estimate (to client) ──────────────────────────────────────────
type EstimateEmailResult = {
  lines: { label: string; detail?: string; oneTimeCents: number; monthlyCents: number }[];
  oneTimeLowCents: number;
  oneTimeHighCents: number;
  monthlyCents: number;
  myLowCents: number;
  myHighCents: number;
};

const dollars = (cents: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 }).format(cents / 100);

function estimateRows(result: EstimateEmailResult) {
  return result.lines
    .map(
      (line) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid ${C.border};font-family:${SANS};font-size:13px;line-height:1.5;color:${C.text};">${esc(line.label)}${line.detail ? `<br/><span style="font-size:12px;color:${C.muted};">${esc(line.detail)}</span>` : ""}</td>
          <td style="padding:10px 0 10px 12px;border-bottom:1px solid ${C.border};font-family:${SANS};font-size:13px;color:${C.text};text-align:right;white-space:nowrap;vertical-align:top;">${line.oneTimeCents ? dollars(line.oneTimeCents) : ""}${line.monthlyCents ? `${line.oneTimeCents ? "<br/>" : ""}<span style="color:${C.muted};">${dollars(line.monthlyCents)}/mo</span>` : ""}</td>
        </tr>`,
    )
    .join("");
}

export async function sendEstimateEmail({
  to,
  name,
  reference,
  categoryLabel,
  pages,
  result,
  access,
}: {
  to: string;
  name: string;
  reference: string;
  categoryLabel: string;
  pages: number;
  result: EstimateEmailResult;
  access: PortalAccess;
}) {
  const range = `${dollars(result.myLowCents)} to ${dollars(result.myHighCents)}`;
  const html = layout(`
    ${eyebrow(`Project estimate &middot; ${esc(reference)}`)}
    ${heading(`Thanks, ${esc(name)}.`)}
    ${para(`Here's the estimate for your ${strong(esc(categoryLabel))} (${pages} page${pages === 1 ? "" : "s"}).`)}
    ${facts([
      ["My price", `${range} <span style="font-size:13px;font-weight:400;color:${C.muted};">CAD</span>`],
      ["Typical market quote", `<span style="color:${C.muted};text-decoration:line-through;">${dollars(result.oneTimeLowCents)} to ${dollars(result.oneTimeHighCents)}</span>`],
      ...(result.monthlyCents ? [["Ongoing", `${dollars(result.monthlyCents)}/month`] as [string, string]] : []),
    ])}
    ${para("The market figure is what an agency would typically quote. I handle design, development, security and launch myself, with no agency overhead, so my price is less than half of that. I'll review your details and reply within 1 to 2 business days with a firm quote.")}
    ${eyebrow("Your client portal")}
    ${para("Track this request, message me and see invoices and project updates in one place.")}
    ${portalAccess(access, "Open my portal")}
    ${panel("What the market estimate covers", `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${estimateRows(result)}</table>`)}
    ${small("This is an estimate, not a quote. The final price depends on content, design detail and what we learn while scoping. Taxes not included. Questions? Just reply.")}
  `, `Your estimate ${reference}: ${range} CAD`);

  await sendMail({ to, subject: `Your project estimate (${reference})`, html });
}

// ─── Project estimate (heads-up to Raghav) ─────────────────────────────────
export async function sendEstimateNotification({
  reference,
  id,
  name,
  email,
  company,
  categoryLabel,
  result,
}: {
  reference: string;
  id: string;
  name: string;
  email: string;
  company?: string;
  categoryLabel: string;
  result: EstimateEmailResult;
}) {
  const html = layout(`
    ${eyebrow(`New estimate &middot; ${esc(reference)}`)}
    ${heading(`${esc(name)}${company ? ` &middot; ${esc(company)}` : ""}`)}
    ${facts([
      ["Price shown", `${dollars(result.myLowCents)} to ${dollars(result.myHighCents)}${result.monthlyCents ? ` + ${dollars(result.monthlyCents)}/mo` : ""}`],
      ["Project", esc(categoryLabel)],
      ["Email", esc(email)],
      ["Market range", `${dollars(result.oneTimeLowCents)} to ${dollars(result.oneTimeHighCents)}`],
    ])}
    ${para("A portal account was set up for them automatically.")}
    ${button(signInUrl(`/admin/estimates/${id}`), "Open in admin")}
    ${small("Hitting Reply goes straight to the client.")}
  `, `New estimate from ${name}`);

  await sendMail({ to: TO, subject: `[raghv.dev] New estimate ${reference} from ${name}`, html, replyTo: email });
}

// ─── Client portal invite (to client) ─────────────────────────────────────────
export async function sendPortalInviteEmail({ to, name, access }: { to: string; name: string | null; access: PortalAccess }) {
  const html = layout(`
    ${eyebrow("Client portal")}
    ${heading(`Your client portal is ready${name ? `, ${esc(name)}` : ""}`)}
    ${para("It's where you'll find your estimate, agreement, invoices and project updates, and where we can message each other.")}
    ${portalAccess(access, "Go to sign in")}
    ${small("Questions? Just reply to this email.")}
  `, "Your client portal is ready");
  await sendMail({ to, subject: "Your client portal is ready", html });
}

// ─── Onboarding questionnaire (to client) ───────────────────────────────────
export async function sendQuestionnaireEmail({ to, name, access }: { to: string; name: string; access: PortalAccess }) {
  const html = layout(`
    ${eyebrow("Next step &middot; Onboarding")}
    ${heading(`Let's get your project started, ${esc(name)}`)}
    ${para("Please fill in a short questionnaire about your business and the project. It takes about 10 minutes. I use your answers to prepare our agreement, so the details (business name, address, payment preferences) need to be accurate.")}
    ${portalAccess(access, "Open the questionnaire")}
    ${small("Questions? Just reply to this email.")}
  `, "Your project questionnaire: about 10 minutes");
  await sendMail({ to, subject: "Your project questionnaire (about 10 minutes)", html });
}

// ─── Contract ready to sign (to client) ─────────────────────────────────────
export async function sendContractToSignEmail({ to, name, number, title, access }: { to: string; name: string; number: string; title: string; access: PortalAccess }) {
  const html = layout(`
    ${eyebrow(`Agreement ${esc(number)}`)}
    ${heading("Your agreement is ready to sign")}
    ${para(`Hi ${esc(name)}, the ${strong(esc(title))} for your project is ready. Please read it through and sign it in your client portal. I've already signed on my side.`)}
    ${para("Once you sign, we both get a PDF copy and I'll send the deposit invoice so we can start.")}
    ${portalAccess(access, "Review and sign")}
    ${small("Questions or changes before signing? Just reply to this email.")}
  `, `Agreement ${number} is ready to sign`);
  await sendMail({ to, subject: `Please review and sign: ${title} (${number})`, html });
}

// ─── Signed contract copy (to both parties) ─────────────────────────────────
export async function sendContractSignedEmail({ to, name, number, clientName, pdf, forProvider, contractId }: { to: string; name: string; number: string; clientName: string; pdf: Buffer; forProvider: boolean; contractId: string }) {
  const html = layout(forProvider ? `
    ${eyebrow(`Agreement ${esc(number)} &middot; Signed`)}
    ${heading(`${esc(clientName)} signed the agreement`)}
    ${para("The signed agreement is attached. Next: send the deposit invoice from the admin console.")}
    ${button(signInUrl(`/admin/contracts/${contractId}`), "Open in admin")}
  ` : `
    ${eyebrow(`Agreement ${esc(number)} &middot; Signed`)}
    ${heading(`Thanks, ${esc(name)}. We're official.`)}
    ${para("Your signed copy is attached for your records. I'll send the deposit invoice next, and work starts once it's paid. You can follow progress in your client portal.")}
    ${button(signInUrl(`/portal/contracts/${contractId}`), "Open my portal")}
  `, `Agreement ${number} signed`);
  await sendMail({
    to,
    subject: forProvider ? `[raghv.dev] ${clientName} signed ${number}` : `Your signed agreement (${number})`,
    html,
    attachments: [{ filename: `${number}-signed.pdf`, content: pdf, contentType: "application/pdf" }],
  });
}

// ─── Newsletter welcome ────────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string | null, unsubscribeToken: string) {
  const unsubLink = `${site.url}/unsubscribe?token=${unsubscribeToken}`;
  const item = (title: string, desc: string) => `
    <tr><td style="padding:8px 0;border-bottom:1px solid ${C.border};">
      <p style="margin:0;font-family:${SANS};font-size:14px;font-weight:600;color:${C.text};">${title}</p>
      <p style="margin:3px 0 0;font-family:${SANS};font-size:13px;line-height:1.5;color:${C.muted};">${desc}</p>
    </td></tr>`;

  const html = layout(`
    ${eyebrow("Raghav's Cyber Daily")}
    ${heading(`You're in${name ? `, ${esc(name)}` : ""}.`)}
    ${para("You'll get lab writeups, security research and notes from my home lab whenever something is worth reading. No filler, no spam.")}
    ${panel("What to expect", `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${item("Lab writeups", "Walkthroughs of machines and challenges I've worked through")}
      ${item("Home lab experiments", "Wazuh detections, SIEM configs and network forensics")}
      ${item("Study notes", "What I'm learning on the way to my next certifications")}
    </table>`)}
    <div style="height:22px;line-height:22px;">&nbsp;</div>
    ${button(`${site.url}/blog`, "Browse the blog", "secondary")}
    ${small(`Don't want these emails? ${link(unsubLink, "Unsubscribe")}.`)}
  `, "Welcome to Raghav's Cyber Daily");

  await sendMail({ to, subject: "Welcome to Raghav's Cyber Daily", html });
}

// ─── Newsletter issue template (paste into admin compose) ─────────────────
export function buildNewsletterHtml({
  issueNumber,
  title,
  intro,
  sections,
  ctaUrl,
  ctaText,
}: {
  issueNumber?: number;
  title: string;
  intro: string;
  sections: { heading: string; body: string; link?: string }[];
  ctaUrl?: string;
  ctaText?: string;
}) {
  const sectionHtml = sections.map((s) => {
    const href = safeHref(s.link);
    return `
    <tr><td style="padding:20px 0;border-bottom:1px solid ${C.border};">
      <p style="margin:0 0 6px;font-family:${MONO};font-size:10px;color:${C.gold};text-transform:uppercase;letter-spacing:0.12em;">${esc(s.heading)}</p>
      <p style="margin:0;font-family:${SANS};font-size:15px;color:${C.body};line-height:1.7;">${esc(s.body)}</p>
      ${href ? `<p style="margin:10px 0 0;font-family:${SANS};font-size:13px;">${link(href, "Read more")}</p>` : ""}
    </td></tr>`;
  }).join("");

  const cta = safeHref(ctaUrl);

  return layout(`
    ${issueNumber ? eyebrow(`Issue #${issueNumber}`) : ""}
    ${heading(esc(title))}
    ${para(esc(intro))}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${sectionHtml}</table>
    ${cta ? `<div style="height:22px;line-height:22px;">&nbsp;</div>${button(cta, esc(ctaText ?? "Read more"))}` : ""}
  `, title);
}
