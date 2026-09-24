import { createServerFn } from "@tanstack/react-start";
import { getPlatformAdmin } from "@/core/auth/platform";

/** UX/routing helper: is the caller a platform admin? (Server fns re-check.) */
export const checkPlatformAdminStatusFn = createServerFn({
  method: "GET",
}).handler(async () => (await getPlatformAdmin()) !== null);
