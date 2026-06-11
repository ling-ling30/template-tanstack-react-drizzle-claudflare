import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins/admin";
import { organization } from "better-auth/plugins/organization";
import { username } from "better-auth/plugins";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import {
  accessControl,
  adminRoles,
  ownerRole,
} from "../src/auth/access-control";

const sqlite = new Database(":memory:");
const db = drizzle(sqlite);

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? "development-schema-secret",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "sqlite",
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
