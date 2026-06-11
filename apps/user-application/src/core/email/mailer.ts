/**
 * Transactional Email Shell
 *
 * Inversion-of-control layer for sending transactional email (verification,
 * password reset, org invites). By default it logs the message to the console
 * in development. For production, drop your provider SDK (Resend, SES, Postmark,
 * SendGrid) into `sendEmail` — the rest of the app and Better Auth call this one
 * function, so there is exactly one place to swap.
 *
 * This runs on the server (inside the Cloudflare Worker), not in the browser.
 */
export type EmailMessage = {
  to: string;
  subject: string;
  /** Plain-text body. Providers can derive HTML or you can add an `html` field. */
  text: string;
  html?: string;
};

export async function sendEmail(message: EmailMessage): Promise<void> {
  // --- Development: log instead of sending ---------------------------------
  if (import.meta.env?.DEV) {
    console.info(
      `[email] (dev, not sent) to=${message.to} subject="${message.subject}"\n${message.text}`,
    );
    return;
  }

  // --- Production: wire your provider here ---------------------------------
  // Example (Resend):
  //   const resend = new Resend(env.RESEND_API_KEY);
  //   await resend.emails.send({
  //     from: "no-reply@yourdomain.com",
  //     to: message.to,
  //     subject: message.subject,
  //     text: message.text,
  //     html: message.html,
  //   });
  //
  // Until a provider is wired, fail loudly so missing email isn't silent.
  console.error(
    `[email] No provider configured. Drop your SDK into core/email/mailer.ts. Dropped message to ${message.to}: "${message.subject}"`,
  );
}
