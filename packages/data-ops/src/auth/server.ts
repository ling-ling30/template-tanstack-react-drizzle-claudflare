import { accessControl, adminRoles, ownerRole } from "@/auth/access-control";
import type { AppDatabase } from "@/database/setup";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins/admin";
import { organization } from "better-auth/plugins/organization";
import { username } from "better-auth/plugins";
import * as authSchema from "@/drizzle/auth-schema";

export type SendEmailFn = (message: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) => Promise<void>;

type AuthConfig = {
  secret: string;
  baseURL: string;
  adapter: {
    drizzleDb: AppDatabase;
    provider: "mysql";
  };
  /** Optional transactional email sender. When provided, Better Auth uses it
   * for email verification and password-reset messages. */
  sendEmail?: SendEmailFn;
  /** Optional template builders so the app owns email copy/HTML. */
  emailTemplates?: {
    verification: (url: string) => {
      subject: string;
      text: string;
      html?: string;
    };
    resetPassword: (url: string) => {
      subject: string;
      text: string;
      html?: string;
    };
  };
};

/**
 * Builds a Better Auth instance from the given config.
 *
 * Prefer this factory over the module-global `setAuth`/`getAuth` singletons:
 * it has no shared mutable state, so it is safe to call once per worker boot
 * (see `apps/user-application/src/core/runtime.ts`) and trivial to use in tests.
 */
export function createAuth(config: AuthConfig) {
  return betterAuth({
    secret: config.secret,
    baseURL: config.baseURL,
    database: drizzleAdapter(config.adapter.drizzleDb, {
      provider: config.adapter.provider,
      schema: authSchema,
    }),
    emailAndPassword: {
      enabled: true,
      ...(config.sendEmail
        ? {
            sendResetPassword: async ({
              user,
              url,
            }: {
              user: { email: string };
              url: string;
            }) => {
              const tpl = config.emailTemplates?.resetPassword(url) ?? {
                subject: "Reset your password",
                text: `Reset your password: ${url}`,
              };
              await config.sendEmail!({ to: user.email, ...tpl });
            },
          }
        : {}),
    },
    ...(config.sendEmail
      ? {
          emailVerification: {
            sendVerificationEmail: async ({
              user,
              url,
            }: {
              user: { email: string };
              url: string;
            }) => {
              const tpl = config.emailTemplates?.verification(url) ?? {
                subject: "Verify your email",
                text: `Verify your email: ${url}`,
              };
              await config.sendEmail!({ to: user.email, ...tpl });
            },
          },
        }
      : {}),
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
}

let betterAuthInstance: ReturnType<typeof createAuth> | undefined;

/**
 * Backwards-compatible singleton setter. Initializes the global auth instance.
 * New code should rely on the runtime returned by `initRuntime` instead.
 */
export function setAuth(config: AuthConfig) {
  betterAuthInstance = createAuth(config);
  return betterAuthInstance;
}

export function getAuth() {
  if (!betterAuthInstance) {
    throw new Error("Auth not initialized");
  }
  return betterAuthInstance;
}
