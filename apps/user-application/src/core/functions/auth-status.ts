import { getAuth } from "@repo/data-ops/auth/server";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";

export const checkPlatformAdminStatusFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const session = await getAuth().api.getSession(getRequest());

    if (!session) {
      return false;
    }

    const allowedEmails = env.PLATFORM_ADMIN_EMAILS.split(",").map((email) =>
      email.trim().toLowerCase(),
    );

    return allowedEmails.includes(session.user.email.toLowerCase());
  });
