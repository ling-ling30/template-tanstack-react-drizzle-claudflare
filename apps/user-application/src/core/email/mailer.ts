import { getEnv } from "@/core/env";

/**
 * Transactional Email Shell — Nodemailer over Mailgun SMTP.
 *
 * One function (`sendEmail`) that Better Auth and the app call. In dev (no SMTP
 * creds) it logs instead of sending. Runs on the Node server, never the browser.
 */
export type EmailMessage = {
  to: string;
  subject: string;
  /** Plain-text body. */
  text: string;
  html?: string;
};

export async function sendEmail(message: EmailMessage): Promise<void> {
  const env = getEnv();

  if (!env.SMTP_USER || !env.SMTP_PASS) {
    console.info(
      `[email] (dev, not sent) to=${message.to} subject="${message.subject}"\n${message.text}`
    );
    return;
  }

  // Lazy import so the client bundle never pulls nodemailer.
  const nodemailer = await import("nodemailer");
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });

  await transport.sendMail({
    from: env.MAIL_FROM,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
}
