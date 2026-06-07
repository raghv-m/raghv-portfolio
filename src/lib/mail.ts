import nodemailer from "nodemailer";

function getTransport() {
  if (process.env.MAIL_PROVIDER === "resend") {
    return nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: {
        user: "resend",
        pass: process.env.RESEND_API_KEY,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const FROM = process.env.SMTP_FROM || "Raghav Mahajan <raaghvv0508@gmail.com>";
const TO = process.env.CONTACT_RECEIVER_EMAIL || "raaghvv0508@gmail.com";

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const transport = getTransport();
  await transport.sendMail({ from: FROM, to, subject, html });
}

export async function sendContactNotification(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const transport = getTransport();

  await transport.sendMail({
    from: FROM,
    to: TO,
    subject: `[raghv.dev] New message: ${data.subject}`,
    html: `
      <div style="background:#0a0a0a;color:#f5f5f5;padding:32px;font-family:monospace;border:1px solid #222;">
        <h2 style="color:#d4a017;margin-top:0;">New Contact Submission</h2>
        <table style="border-collapse:collapse;width:100%;">
          <tr><td style="color:#888;padding:6px 0;">From</td><td style="color:#f5f5f5;">${data.name} &lt;${data.email}&gt;</td></tr>
          <tr><td style="color:#888;padding:6px 0;">Subject</td><td style="color:#f5f5f5;">${data.subject}</td></tr>
        </table>
        <hr style="border-color:#222;margin:20px 0;">
        <p style="color:#f5f5f5;white-space:pre-wrap;">${data.message}</p>
        <hr style="border-color:#222;margin:20px 0;">
        <p style="color:#444;font-size:11px;">Sent from raghv.dev contact form</p>
      </div>
    `,
  });
}

export async function sendAutoReply(to: string, name: string) {
  const transport = getTransport();

  await transport.sendMail({
    from: FROM,
    to,
    subject: "Message received — Raghav Mahajan",
    html: `
      <div style="background:#0a0a0a;color:#f5f5f5;padding:40px;font-family:monospace;max-width:560px;border:1px solid #222;">
        <p style="color:#d4a017;margin-top:0;font-size:13px;letter-spacing:0.2em;">RAGHV.DEV</p>
        <h2 style="color:#f5f5f5;font-size:20px;margin-bottom:4px;">Message received, ${name}.</h2>
        <p style="color:#888;margin-top:0;">I'll respond within 24–48 hours.</p>
        <hr style="border-color:#222;margin:28px 0;">
        <p style="color:#f5f5f5;line-height:1.7;">
          Thanks for reaching out. I review all messages personally and will get back to you as soon as possible.
        </p>
        <p style="color:#f5f5f5;line-height:1.7;">
          If your message is time-sensitive, you can also connect with me directly on
          <a href="https://linkedin.com/in/raghav-mahajan-17611b24b" style="color:#d4a017;">LinkedIn</a>.
        </p>
        <hr style="border-color:#222;margin:28px 0;">
        <p style="color:#444;font-size:11px;">
          Raghav Mahajan · Edmonton, AB · raghv.dev<br>
          Cybersecurity Analyst in Training · SOC Operations · Blue Team
        </p>
      </div>
    `,
  });
}
