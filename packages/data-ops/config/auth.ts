import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins/admin";
import { organization } from "better-auth/plugins/organization";
import { username } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2";
import {
  accessControl,
  adminRoles,
  ownerRole,
} from "../src/auth/access-control";

/**
 * CLI-only Better Auth instance, used by `better-auth:generate` to emit the
 * Drizzle schema. Not used at runtime. Provider is MySQL (was sqlite/D1).
 *
 * The pool is created lazily and never connected during generation; the CLI
 * only inspects the configured plugins + provider to produce the schema.
 */
const pool = createPool(
  process.env.DATABASE_URL ?? "mysql://root:root@localhost:3306/gositus"
);
const db = drizzle(pool);

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? "development-schema-secret",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "mysql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["platform_admin"],
      roles: adminRoles,
    }),
    organization({
      ac: accessControl,
      roles: {
        owner: ownerRole,
      },
      allowUserToCreateOrganization: false,
    }),
    username(),
  ],
});
