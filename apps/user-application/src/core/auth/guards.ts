import {
  roleCan,
  type PermissionAction,
  type PermissionResource,
} from "@repo/data-ops/auth/access-control";
import { appError } from "@repo/data-ops/errors";

export type { PermissionAction, PermissionResource };

/**
 * RBAC check against the role returned by `requireOrganizationContext`.
 * Resources/actions come from `permissionStatement` and role grants from
 * `organizationRoles` in `@repo/data-ops/auth/access-control`.
 *
 *   const ctx = await requireOrganizationContext(slug);
 *   requirePermission({ role: ctx.role, resource: "users", action: "manage" });
 */
export function requirePermission<R extends PermissionResource>(input: {
  role: string;
  resource: R;
  action: PermissionAction<R>;
}): void {
  if (!roleCan(input.role, input.resource, input.action)) {
    throw appError("FORBIDDEN", "You don't have permission for this action.");
  }
}
