import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "@repo/data-ops/database/setup";
import {
  listUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@repo/data-ops/queries/notifications";
import { requireAuthContext } from "@/core/auth/context";
import { zodInput } from "@/core/validation/zod-input";

export const listNotificationsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const { user } = await requireAuthContext();
    return listUserNotifications(getDb(), user.id);
  }
);

export const markNotificationReadFn = createServerFn({ method: "POST" })
  .validator(zodInput(z.object({ id: z.string() })))
  .handler(async ({ data }) => {
    const { user } = await requireAuthContext();
    await markNotificationAsRead(getDb(), data.id, user.id);
    return { success: true };
  });

export const markAllNotificationsReadFn = createServerFn({
  method: "POST",
}).handler(async () => {
  const { user } = await requireAuthContext();
  await markAllNotificationsAsRead(getDb(), user.id);
  return { success: true };
});
