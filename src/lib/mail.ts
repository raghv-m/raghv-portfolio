import nodemailer from "nodemailer";

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

const FROM = process.env.SMTP_FROM || "Raghav Mahajan <onboarding@resend.dev>";
const TO = process.env.CONTACT_RECEIVER_EMAIL || "raaghvv0508@gmail.com";

// ─── Shared design tokens ──────────────────────────────────────────────────
const GOLD = "#d4a017";
const BG = "#0a0a0a";
const SURFACE = "#111111";
const BORDER = "#222222";
const TEXT = "#e8e8e8";
const MUTED = "#888888";

function base(content: string, preview = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="dark"/>
  <title>${preview}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:${BG};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  ${preview ? `<div style="display:none;max-height:0;overflow:hidden;color:${BG}">${preview}&zwnj;&nbsp;</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:${SURFACE};border-radius:12px;border:1px solid ${BORDER};overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="padding:0;background:${BG};border-bottom:1px solid ${BORDER};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:20px 28px;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:28px;height:28px;border:1px solid rgba(212,160,23,0.4);border-radius:4px;text-align:center;vertical-align:middle;">
                        <span style="font-size:14px;color:${GOLD};">⬡</span>
                      </td>
                      <td style="padding-left:10px;">
                        <span style="font-family:'Courier New',monospace;font-size:13px;font-weight:600;color:${GOLD};letter-spacing:0.08em;">raghv.dev</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr><td style="height:2px;background:linear-gradient(90deg,transparent,${GOLD},transparent);"></td></tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 28px 28px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 28px;border-top:1px solid ${BORDER};background:${BG};">
            <p style="margin:0;font-family:'Courier New',monospace;font-size:10px;color:#444;letter-spacing:0.06em;">
              Raghav Mahajan &nbsp;·&nbsp; Edmonton, AB, Canada &nbsp;·&nbsp;
              <a href="https://raghv.dev" style="color:#555;text-decoration:none;">raghv.dev</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Generic send ──────────────────────────────────────────────────────────
export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const transport = getTransport();
  await transport.sendMail({ from: FROM, to, subject, html });
}

// ─── Contact notification (to Raghav) ─────────────────────────────────────
export async function sendContactNotification(data: {
  name: string; email: string; subject: string; message: string;
}) {
  const html = base(`
    <p style="margin:0 0 6px;font-family:'Courier New',monospace;font-size:10px;color:${GOLD};letter-spacing:0.15em;text-transform:uppercase;">New Contact Message</p>
    <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:${TEXT};line-height:1.3;">${data.subject}</h1>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:12px 16px;background:#161616;border-radius:8px 8px 0 0;border:1px solid ${BORDER};border-bottom:none;">
          <p style="margin:0;font-family:'Courier New',monospace;font-size:10px;color:${MUTED};text-transform:uppercase;letter-spacing:0.1em;">From</p>
          <p style="margin:4px 0 0;font-size:14px;color:${TEXT};">${data.name} &nbsp;<span style="color:${MUTED};">&lt;${data.email}&gt;</span></p>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background:#0f0f0f;border-radius:0 0 8px 8px;border:1px solid ${BORDER};border-top:none;">
          <p style="margin:0;font-family:'Courier New',monospace;font-size:10px;color:${MUTED};text-transform:uppercase;letter-spacing:0.1em;">Message</p>
          <p style="margin:8px 0 0;font-size:14px;color:${TEXT};line-height:1.7;white-space:pre-wrap;">${data.message}</p>
        </td>
      </tr>
    </table>

    <a href="mailto:${data.email}?subject=Re: ${data.subject}" style="display:inline-block;padding:11px 24px;background:transparent;border:1px solid ${GOLD};border-radius:4px;font-size:12px;font-weight:600;color:${GOLD};text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;">Reply to ${data.name}</a>
  `, `New message from ${data.name}`);

  await sendMail({ to: TO, subject: `[raghv.dev] ${data.subject}`, html });
}

// ─── Contact auto-reply (to sender) ───────────────────────────────────────
export async function sendAutoReply(to: string, name: string) {
  const html = base(`
    <p style="margin:0 0 6px;font-family:'Courier New',monospace;font-size:10px;color:${GOLD};letter-spacing:0.15em;text-transform:uppercase;">Message Received</p>
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:${TEXT};line-height:1.3;">Hey ${name},</h1>
    <p style="margin:0 0 20px;font-size:15px;color:${MUTED};line-height:1.8;">Your message landed safely. I personally review every inquiry and will get back to you within <span style="color:${TEXT};">24–48 hours</span>.</p>

    <div style="padding:20px;background:#0f0f0f;border-radius:8px;border-left:2px solid ${GOLD};margin-bottom:28px;">
      <p style="margin:0;font-size:13px;color:${MUTED};line-height:1.7;">If it's urgent, connect with me directly on
        <a href="https://linkedin.com/in/raghav-mahajan-17611b24b" style="color:${GOLD};text-decoration:none;">LinkedIn</a> —
        I check messages there daily.
      </p>
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-right:12px;">
          <a href="https://raghv.dev" style="display:inline-block;padding:11px 24px;background:transparent;border:1px solid ${GOLD};border-radius:4px;font-size:12px;font-weight:600;color:${GOLD};text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;">Visit Portfolio</a>
        </td>
        <td>
          <a href="https://linkedin.com/in/raghav-mahajan-17611b24b" style="display:inline-block;padding:11px 24px;background:transparent;border:1px solid ${BORDER};border-radius:4px;font-size:12px;font-weight:600;color:${MUTED};text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;">LinkedIn</a>
        </td>
      </tr>
    </table>
  `, `I got your message, ${name}`);

  await sendMail({ to, subject: "Message received — Raghav Mahajan", html });
}

// ─── Newsletter welcome ────────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string | null, unsubscribeToken: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://raghv.dev";
  const unsubLink = `${baseUrl}/unsubscribe?token=${unsubscribeToken}`;

  const html = base(`
    <p style="margin:0 0 6px;font-family:'Courier New',monospace;font-size:10px;color:${GOLD};letter-spacing:0.15em;text-transform:uppercase;">Raghav's Cyber Daily</p>
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:${TEXT};line-height:1.3;">You're in${name ? `, ${name}` : ""}.</h1>
    <p style="margin:0 0 24px;font-size:15px;color:${MUTED};line-height:1.8;">
      Welcome to my newsletter. You'll get <span style="color:${TEXT};">lab writeups, security research, and notes on the path to offensive security</span> — whenever something worth reading is ready. No filler, no spam.
    </p>

    <div style="padding:20px 24px;background:#0d0d0d;border-radius:8px;border:1px solid ${BORDER};margin-bottom:28px;">
      <p style="margin:0 0 14px;font-family:'Courier New',monospace;font-size:10px;color:${MUTED};text-transform:uppercase;letter-spacing:0.1em;">What to expect</p>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        ${[
          ["🔍", "HTB / THM writeups", "Detailed walkthroughs of machines I've pwned"],
          ["🔬", "Homelab experiments", "Wazuh detections, SIEM configs, network forensics"],
          ["🎯", "Pentest prep", "Notes on my OSCP journey and beyond"],
        ].map(([icon, title, desc]) => `
        <tr>
          <td style="padding:6px 0;vertical-align:top;width:28px;font-size:16px;">${icon}</td>
          <td style="padding:6px 0 6px 8px;">
            <p style="margin:0;font-size:13px;font-weight:600;color:${TEXT};">${title}</p>
            <p style="margin:2px 0 0;font-size:12px;color:${MUTED};">${desc}</p>
          </td>
        </tr>`).join("")}
      </table>
    </div>

    <a href="https://raghv.dev/blog" style="display:inline-block;padding:11px 24px;background:transparent;border:1px solid ${GOLD};border-radius:4px;font-size:12px;font-weight:600;color:${GOLD};text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;">Browse the Blog</a>

    <p style="margin:32px 0 0;font-size:11px;color:#444;">
      Don't want emails? <a href="${unsubLink}" style="color:#555;text-decoration:underline;">Unsubscribe here</a>.
    </p>
  `, `Welcome to Raghav's Cyber Daily`);

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
  const sectionHtml = sections.map(s => `
    <tr><td style="padding:20px 0 0;">
      <p style="margin:0 0 4px;font-family:'Courier New',monospace;font-size:10px;color:${GOLD};text-transform:uppercase;letter-spacing:0.12em;">${s.heading}</p>
      <p style="margin:0;font-size:14px;color:${MUTED};line-height:1.75;">${s.body}</p>
      ${s.link ? `<a href="${s.link}" style="display:inline-block;margin-top:10px;font-size:12px;color:${GOLD};text-decoration:none;border-bottom:1px solid rgba(212,160,23,0.3);">Read more →</a>` : ""}
    </td></tr>
    <tr><td style="padding:20px 0 0;"><div style="height:1px;background:${BORDER};"></div></td></tr>
  `).join("");

  return base(`
    ${issueNumber ? `<p style="margin:0 0 6px;font-family:'Courier New',monospace;font-size:10px;color:${GOLD};letter-spacing:0.15em;text-transform:uppercase;">Issue #${issueNumber}</p>` : ""}
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:${TEXT};line-height:1.3;">${title}</h1>
    <p style="margin:0 0 28px;font-size:15px;color:${MUTED};line-height:1.8;">${intro}</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${sectionHtml}
    </table>

    ${ctaUrl ? `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;">
      <tr>
        <td>
          <a href="${ctaUrl}" style="display:inline-block;padding:11px 24px;background:transparent;border:1px solid ${GOLD};border-radius:4px;font-size:12px;font-weight:600;color:${GOLD};text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;">${ctaText ?? "Read More"}</a>
        </td>
      </tr>
    </table>` : ""}
  `, title);
}
