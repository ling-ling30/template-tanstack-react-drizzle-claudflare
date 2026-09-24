import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, userAc } from "better-auth/plugins/admin/access";
import { defaultStatements } from "better-auth/plugins/organization/access";

/**
 * Organization permission statements. `dashboard`, `users`, `roles` are generic;
 * `items` and `settings` are example resources — rename/extend them for your
 * domain. Each maps to actions a role can perform; see `core/auth/guards.ts`.
 */
export const permissionStatement = {
  ...defaultStatements,
  dashboard: ["view"],
  items: ["view", "create", "edit", "delete"],
  settings: ["view", "edit"],
  users: ["manage"],
  roles: ["manage"],
} as const;

export type PermissionResource = keyof typeof permissionStatement;
export type PermissionAction<R extends PermissionResource> =
  (typeof permissionStatement)[R][number];

export const accessControl = createAccessControl(permissionStatement);

export const ownerRole = accessControl.newRole({
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  team: ["create", "update", "delete"],
  ac: ["create", "read", "update", "delete"],
  dashboard: ["view"],
  items: ["view", "create", "edit", "delete"],
  settings: ["view", "edit"],
  users: ["manage"],
  roles: ["manage"],
});

/** Runs the org day-to-day; cannot delete the org or manage roles. */
export const adminRole = accessControl.newRole({
  organization: ["update"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  team: ["create", "update", "delete"],
  ac: ["read"],
  dashboard: ["view"],
  items: ["view", "create", "edit", "delete"],
  settings: ["view", "edit"],
  users: ["manage"],
});

/** Regular member: uses the workspace, manages nothing. */
export const memberRole = accessControl.newRole({
  ac: ["read"],
  dashboard: ["view"],
  items: ["view", "create", "edit"],
  settings: ["view"],
});

/**
 * Every org role, passed to Better Auth's organization plugin. Passing custom
 * roles REPLACES Better Auth's defaults, so all three must be defined here —
 * a role missing from this map has no permissions at all.
 */
export const organizationRoles = {
  owner: ownerRole,
  admin: adminRole,
  member: memberRole,
};

export type OrganizationRole = keyof typeof organizationRoles;

/**
 * Pure RBAC check. `role` is the member's stored role string, which Better Auth
 * allows to be a comma-separated list ("admin,member"); any matching role grants.
 * Unknown roles grant nothing.
 */
export function roleCan<R extends PermissionResource>(
  role: string,
  resource: R,
  action: PermissionAction<R>
): boolean {
  return role
    .split(",")
    .map((r) => r.trim())
    .some((r) => {
      const def = organizationRoles[r as OrganizationRole];
      if (!def) return false;
      return def.authorize({ [resource]: [action] } as never).success;
    });
}

export const adminRoles = {
  user: userAc,
  platform_admin: adminAc,
};
