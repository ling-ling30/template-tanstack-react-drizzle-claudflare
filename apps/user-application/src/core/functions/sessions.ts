import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "@repo/data-ops/database/setup";
import {
  listUserSessions,
  revokeOtherSessions,
  revokeSession,
} from "@repo/data-ops/queries/sessions";
import { requireAuthContext } from "@/core/auth/context";
import { zodInput } from "@/core/validation/zod-input";

export const listSessionsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const { user, session } = await requireAuthContext();
    const sessions = await listUserSessions(getDb(), user.id);
    return {
      sessions,
      currentSessionId: session.id,
    };
  }
);

export const revokeSessionFn = createServerFn({ method: "POST" })
  .validator(zodInput(z.object({ sessionId: z.string() })))
  .handler(async ({ data }) => {
    const { user } = await requireAuthContext();
    await revokeSession(getDb(), {
      userId: user.id,
      sessionId: data.sessionId,
    });
    return { success: true };
  });

export const revokeOtherSessionsFn = createServerFn({
  method: "POST",
}).handler(async () => {
  const { user, session } = await requireAuthContext();
  await revokeOtherSessions(getDb(), {
    userId: user.id,
    currentSessionId: session.id,
  });
  return { success: true };
});
