import { getAuth } from "@repo/data-ops/auth/server";
import { appError } from "@repo/data-ops/errors";
import { getRequest } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { isPlatformAdminEmail } from "./platform-admin-email";

/*
 * Platform admins ("super admins") are defined ONLY by the comma-separated
 * `PLATFORM_ADMIN_EMAILS` env var. This is the single check every platform
 * server function and the `/dashboard` route guard use.
 *
 * Note: Better Auth's admin plugin (`/api/auth/admin/*`) authorizes by
 * `user.role = "platform_admin"` instead. No user is given that role, so those
 * endpoints stay inert; platform features go through server functions gated here.
 */
/** Signed-in platform admin, or null. Never throws for "not signed in". */
export async function getPlatformAdmin() {
  const session = await getAuth().api.getSession(getRequest());
  if (!session) return null;
  return isPlatformAdminEmail(session.user.email, env.PLATFORM_ADMIN_EMAILS)
    ? session.user
    : null;
}

/** Throws AUTH_REQUIRED / FORBIDDEN unless the caller is a platform admin. */
export async function requirePlatformAdmin() {
  const session = await getAuth().api.getSession(getRequest());

  if (!session) {
    throw appError("AUTH_REQUIRED", "Please sign in first.");
  }

  if (!isPlatformAdminEmail(session.user.email, env.PLATFORM_ADMIN_EMAILS)) {
    throw appError("FORBIDDEN", "Platform admin access required.");
  }

  return session.user;
}
