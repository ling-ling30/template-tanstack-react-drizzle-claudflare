import { getDb } from "@repo/data-ops/database/setup";
import { getPlatformStats } from "@repo/data-ops/queries/platform-stats";
import { listUsers } from "@repo/data-ops/queries/users";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requirePlatformAdmin } from "@/core/auth/platform";
import { zodInput } from "@/core/validation/zod-input";

/** Platform-admin view of every account (clients). Read-only. */

const listSchema = z.object({
  pageIndex: z.number().int().min(0),
  pageSize: z.number().int().min(1).max(100),
  search: z.string().max(100).optional(),
});

export const listPlatformUsersFn = createServerFn({ method: "GET" })
  .validator(zodInput(listSchema))
  .handler(async ({ data }) => {
    await requirePlatformAdmin();
    return listUsers(getDb(), data);
  });

export const getPlatformStatsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    await requirePlatformAdmin();
    return getPlatformStats(getDb());
  }
);
