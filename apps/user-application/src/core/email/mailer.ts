/**
 * Transactional Email Shell & Provider Abstraction
 *
 * Inversion-of-control layer for sending transactional email (verification,
 * password reset, org invites).
 *
 * Runs on the server (inside the Cloudflare Worker), not in the browser.
 */

export type EmailMessage = {
  to: string;
  subject: string;
  /** Plain-text body. */
  text: string;
  /** HTML body. */
  html?: string;
  /** Custom sender address, if overriding default. */
  from?: string;
};

export type EmailSendResult = {
  id?: string;
  success: boolean;
};

export interface EmailProvider {
  send(message: EmailMessage): Promise<EmailSendResult>;
}

/**
 * Development & test email provider that logs to console.
 */
export class ConsoleEmailProvider implements EmailProvider {
  async send(message: EmailMessage): Promise<EmailSendResult> {
    console.info(
      `[email] (dev, not sent) to=${message.to} subject="${message.subject}"\n${message.text}`
    );
    return { id: `mock_email_${Date.now()}`, success: true };
  }
}

/**
 * Native fetch-based Resend provider (Worker-compatible, zero npm dependencies).
 */
export class ResendEmailProvider implements EmailProvider {
  constructor(
    private apiKey: string,
    private defaultFrom = "no-reply@example.com"
  ) {}

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: message.from ?? this.defaultFrom,
        to: [message.to],
        subject: message.subject,
        text: message.text,
        html: message.html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[email:resend] Failed to send email: ${err}`);
      return { success: false };
    }

    const data = (await res.json()) as { id: string };
    return { id: data.id, success: true };
  }
}

let activeProvider: EmailProvider | null = null;

export function getEmailProvider(env?: Record<string, unknown>): EmailProvider {
  if (activeProvider) return activeProvider;

  const resendApiKey = env?.RESEND_API_KEY as string | undefined;
  if (resendApiKey) {
    const from = (env?.EMAIL_FROM as string) ?? "no-reply@example.com";
    activeProvider = new ResendEmailProvider(resendApiKey, from);
    return activeProvider;
  }

  // Default to console logger in development/test
  activeProvider = new ConsoleEmailProvider();
  return activeProvider;
}

export function setEmailProvider(provider: EmailProvider | null): void {
  activeProvider = provider;
}

export async function sendEmail(
  message: EmailMessage,
  env?: Record<string, unknown>
): Promise<void> {
  const provider = getEmailProvider(env);
  await provider.send(message);
}
