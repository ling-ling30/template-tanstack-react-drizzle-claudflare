import { accessControl, organizationRoles } from "./access-control";

/**
 * Shared Better Auth organization-plugin options, used by BOTH the runtime auth
 * (`auth/server.ts`) and the schema-generation config (`config/auth.ts`) so the
 * generated `auth-schema.ts` always matches what runs in production.
 *
 * Better Auth's `organization` table is the ONLY organization table: there is no
 * separate app-level copy. Platform-level state (`status`) lives here as an
 * additional field that users cannot set (`input: false`).
 */
export const organizationPluginOptions = {
  ac: accessControl,
  roles: organizationRoles,
  // Self-serve: any signed-in user can create an org and becomes its owner.
  allowUserToCreateOrganization: true,
  schema: {
    organization: {
      additionalFields: {
        status: {
          type: "string",
          required: true,
          defaultValue: "active",
          input: false,
        },
      },
    },
  },
} as const;
