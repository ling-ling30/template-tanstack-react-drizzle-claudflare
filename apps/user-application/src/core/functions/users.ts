import { getAuth } from "@repo/data-ops/auth/server";
import { member } from "@repo/data-ops/drizzle/auth-schema";
import { createServerFn } from "@tanstack/react-start";
import { requireOrganizationContext } from "@/core/auth/context";
import { requirePermission } from "@/core/auth/guards";
import { z } from "zod";

const createUserSchema = z.object({
  organizationSlug: z.string(),
  username: z.string().min(3),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(["admin", "member"]).default("member"),
});

export const createOrganizationUserFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createUserSchema.parse(data))
  .handler(async ({ data }) => {
    const context = await requireOrganizationContext(data.organizationSlug);
    
    // Ensure caller has permission
    await requirePermission({
      userId: context.userId,
      organizationId: context.organization.id,
      resource: "users",
      action: "manage",
    });

    const auth = getAuth();
    const dummyEmail = `${data.username}@${data.organizationSlug}.internal`;

    // Create user via Better Auth to ensure proper password hashing.
    // Using a mocked Request so it doesn't affect the caller's session cookies.
    const mockRequest = new Request("http://localhost/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: dummyEmail,
        password: data.password,
        name: data.name,
        username: data.username,
      }),
    });

    const response = await auth.handler(mockRequest);
    if (!response.ok) {
      throw new Error("Failed to create user. The username may already be taken.");
    }

    const result = await response.json() as { user: { id: string } };

    // Add them to the organization directly
    await context.db.insert(member).values({
      id: crypto.randomUUID(),
      organizationId: context.organization.id,
      userId: result.user.id,
      role: data.role,
      createdAt: new Date(),
    });

    return { success: true, userId: result.user.id };
  });
