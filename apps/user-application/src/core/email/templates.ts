/**
 * Transactional email templates.
 *
 * Email clients strip <style> tags and ignore most modern CSS, so everything is
 * inline-styled and table-free-simple. Each builder returns { subject, text, html }
 * for the mailer. Keep copy short; localize at the call site if needed.
 *
 * Brand: tweak BRAND + colors in one place.
 */
const BRAND = {
  name: "Modern SaaS Template",
  color: "#171717", // neutral-900
  muted: "#737373", // neutral-500
  bg: "#fafafa",
};

function layout(opts: {
  heading: string;
  body: string;
  cta?: { label: string; url: string };
}): string {
  const button = opts.cta
    ? `<a href="${opts.cta.url}" style="display:inline-block;background:${BRAND.color};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600;">${opts.cta.label}</a>`
    : "";
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px;">
    <p style="font-size:16px;font-weight:700;color:${BRAND.color};margin:0 0 24px;">${BRAND.name}</p>
    <div style="background:#ffffff;border:1px solid #e5e5e5;border-radius:12px;padding:28px;">
      <h1 style="font-size:18px;color:${BRAND.color};margin:0 0 12px;">${opts.heading}</h1>
      <p style="font-size:14px;line-height:1.6;color:${BRAND.muted};margin:0 0 20px;">${opts.body}</p>
      ${button}
    </div>
    <p style="font-size:12px;color:${BRAND.muted};margin:24px 0 0;text-align:center;">
      ${BRAND.name}
    </p>
  </div>
</body></html>`;
}

export function verificationEmail(url: string) {
  return {
    subject: `Verify your email`,
    text: `Verify your email: ${url}`,
    html: layout({
      heading: "Verify your email",
      body: "Confirm your email address to finish setting up your account.",
      cta: { label: "Verify email", url },
    }),
  };
}

export function resetPasswordEmail(url: string) {
  return {
    subject: `Reset your password`,
    text: `Reset your password: ${url}`,
    html: layout({
      heading: "Reset your password",
      body: "Click the button below to choose a new password. If you didn't request this, you can ignore this email.",
      cta: { label: "Reset password", url },
    }),
  };
}

export function invitationEmail(opts: {
  organizationName: string;
  inviteUrl: string;
  role: string;
}) {
  return {
    subject: `You've been invited to join ${opts.organizationName}`,
    text: `You have been invited to join ${opts.organizationName} as a ${opts.role}. Join here: ${opts.inviteUrl}`,
    html: layout({
      heading: `Join ${opts.organizationName}`,
      body: `You've been invited to collaborate with ${opts.organizationName} as a <strong>${opts.role}</strong>. Click below to accept your invitation.`,
      cta: { label: "Accept invitation", url: opts.inviteUrl },
    }),
  };
}

export function welcomeEmail(opts: { name: string; appUrl: string }) {
  return {
    subject: `Welcome to ${BRAND.name}!`,
    text: `Welcome, ${opts.name}! Get started with your new workspace: ${opts.appUrl}`,
    html: layout({
      heading: `Welcome, ${opts.name}!`,
      body: `Your account is ready. Explore your new workspace and start collaborating today.`,
      cta: { label: "Go to workspace", url: opts.appUrl },
    }),
  };
}
