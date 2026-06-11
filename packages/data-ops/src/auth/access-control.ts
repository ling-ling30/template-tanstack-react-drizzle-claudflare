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

export const adminRoles = {
  user: userAc,
  platform_admin: adminAc,
};
