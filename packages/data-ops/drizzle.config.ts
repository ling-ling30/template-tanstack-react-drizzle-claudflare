import type { Config } from "drizzle-kit";

// MySQL (replaces Cloudflare D1). Generate + apply with drizzle-kit:
//   pnpm --filter @repo/data-ops drizzle:generate
//   pnpm --filter @repo/data-ops drizzle:migrate
const config = {
  out: "./src/drizzle",
  schema: ["./src/drizzle/auth-schema.ts", "./src/drizzle/app-schema.ts"],
  dialect: "mysql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ?? "mysql://root:@localhost:3306/chatbot_saas",
  },
} satisfies Config;

export default config;
