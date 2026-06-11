import { appError } from "@repo/data-ops/errors";

/**
 * RBAC resource + action types. These mirror the permission statements in
 * `@repo/data-ops/auth/access-control`. `items`/`settings` are example resources
 * — rename them for your domain.
 */
export type PermissionResource =
  | "dashboard"
  | "items"
  | "settings"
  | "users"
  | "roles";

export type PermissionAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "manage";

export async function requirePermission(input: {
  userId: string;
  organizationId: string;
  resource: PermissionResource;
  action: PermissionAction;
}) {
  if (!input.userId || !input.organizationId) {
    throw appError("FORBIDDEN", "You don't have permission for this action.");
  }

  return true;
}
