import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateApiKey } from "@repo/data-ops/auth/api-keys";
import { getDb } from "@repo/data-ops/database/setup";
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
} from "@repo/data-ops/queries/api-keys";
import { requireOrganizationContext } from "@/core/auth/context";
import { zodInput } from "@/core/validation/zod-input";

export const listApiKeysFn = createServerFn({ method: "GET" })
  .validator(zodInput(z.object({ organizationSlug: z.string() })))
  .handler(async ({ data }) => {
    const { organization } = await requireOrganizationContext(
      data.organizationSlug
    );
    return listApiKeys(getDb(), organization.id);
  });

export const createApiKeyFn = createServerFn({ method: "POST" })
  .validator(
    zodInput(
      z.object({
        organizationSlug: z.string(),
        name: z.string().min(1).max(64),
      })
    )
  )
  .handler(async ({ data }) => {
    const { organization } = await requireOrganizationContext(
      data.organizationSlug
    );
    const generated = await generateApiKey("app_live");

    await createApiKey(getDb(), {
      organizationId: organization.id,
      name: data.name,
      keyHash: generated.keyHash,
      prefix: generated.prefix,
    });

    return {
      secretKey: generated.secretKey,
      prefix: generated.prefix,
      name: data.name,
    };
  });

export const revokeApiKeyFn = createServerFn({ method: "POST" })
  .validator(
    zodInput(
      z.object({
        organizationSlug: z.string(),
        id: z.string(),
      })
    )
  )
  .handler(async ({ data }) => {
    const { organization } = await requireOrganizationContext(
      data.organizationSlug
    );
    return revokeApiKey(getDb(), data.id, organization.id);
  });
