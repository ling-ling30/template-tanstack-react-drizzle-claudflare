import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const rawName = process.argv[2];

if (!rawName) {
  console.error("❌ Please provide a resource name:");
  console.error("   pnpm gen:resource <name>");
  console.error("   Example: pnpm gen:resource project");
  process.exit(1);
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function toCamelCase(str: string): string {
  const kebab = toKebabCase(str);
  return kebab.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function toPascalCase(str: string): string {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function toPlural(str: string): string {
  if (str.endsWith("y") && !/[aeiou]y$/i.test(str)) {
    return str.slice(0, -1) + "ies";
  }
  if (str.endsWith("s") || str.endsWith("ch") || str.endsWith("sh")) {
    return str + "es";
  }
  return str + "s";
}

const singular = toKebabCase(rawName);
const camel = toCamelCase(rawName);
const pascal = toPascalCase(rawName);
const plural = toPlural(singular);
const pluralCamel = toPlural(camel);
const pluralPascal = toPlural(pascal);

console.log(`\n🚀 Generating CRUD Resource: ${pascal} (${plural})\n`);

// 1. Drizzle Schema
const schemaPath = path.join(
  rootDir,
  `packages/data-ops/src/drizzle/${singular}.ts`
);
const schemaContent = `import { sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * ${pascal} table schema.
 * Belongs to an organization for multi-tenant isolation.
 */
export const ${pluralCamel} = sqliteTable("${plural}", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: ["active", "archived"] }).notNull().default("active"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type ${pascal} = typeof ${pluralCamel}.$inferSelect;
export type New${pascal} = typeof ${pluralCamel}.$inferInsert;
`;

// 2. Zod Schema
const zodPath = path.join(
  rootDir,
  `packages/data-ops/src/zod-schema/${singular}.ts`
);
const zodContent = `import { z } from "zod";

export const ${camel}Schema = z.object({
  id: z.string(),
  organizationId: z.string(),
  title: z.string().min(1, "Title is required").max(120),
  description: z.string().max(500).nullable().optional(),
  status: z.enum(["active", "archived"]).default("active"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const create${pascal}Schema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  description: z.string().max(500).optional(),
});

export const update${pascal}Schema = z.object({
  id: z.string(),
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(["active", "archived"]).optional(),
});

export type ${pascal}Input = z.infer<typeof create${pascal}Schema>;
export type Update${pascal}Input = z.infer<typeof update${pascal}Schema>;
`;

// 3. Database Queries
const queryPath = path.join(
  rootDir,
  `packages/data-ops/src/queries/${singular}.ts`
);
const queryContent = `import { and, desc, eq } from "drizzle-orm";
import type { AppDatabase } from "../database/setup";
import { ${pluralCamel}, type ${pascal}, type New${pascal} } from "../drizzle/${singular}";

export async function list${pluralPascal}(
  db: AppDatabase,
  organizationId: string,
): Promise<${pascal}[]> {
  return db
    .select()
    .from(${pluralCamel})
    .where(eq(${pluralCamel}.organizationId, organizationId))
    .orderBy(desc(${pluralCamel}.createdAt));
}

export async function get${pascal}ById(
  db: AppDatabase,
  id: string,
  organizationId: string,
): Promise<${pascal} | null> {
  const [item] = await db
    .select()
    .from(${pluralCamel})
    .where(and(eq(${pluralCamel}.id, id), eq(${pluralCamel}.organizationId, organizationId)))
    .limit(1);
  return item ?? null;
}

export async function create${pascal}(
  db: AppDatabase,
  input: Omit<New${pascal}, "id" | "createdAt" | "updatedAt">,
): Promise<${pascal}> {
  const now = new Date().toISOString();
  const entry: New${pascal} = {
    ...input,
    id: \`${singular}_\${Date.now()}_\${Math.random().toString(36).slice(2, 7)}\`,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(${pluralCamel}).values(entry);
  return entry as ${pascal};
}

export async function delete${pascal}(
  db: AppDatabase,
  id: string,
  organizationId: string,
): Promise<boolean> {
  const res = await db
    .delete(${pluralCamel})
    .where(and(eq(${pluralCamel}.id, id), eq(${pluralCamel}.organizationId, organizationId)));
  return true;
}
`;

// 4. Server RPC Functions
const serverFnPath = path.join(
  rootDir,
  `apps/user-application/src/core/functions/${singular}.ts`
);
const serverFnContent = `import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "@repo/data-ops/database/setup";
import {
  create${pascal},
  delete${pascal},
  get${pascal}ById,
  list${pluralPascal},
} from "@repo/data-ops/queries/${singular}";
import { create${pascal}Schema } from "@repo/data-ops/zod-schema/${singular}";
import { requireOrganizationContext } from "@/core/auth/context";
import { zodInput } from "@/core/validation/zod-input";

export const list${pluralPascal}Fn = createServerFn({ method: "GET" })
  .validator(zodInput(z.object({ organizationSlug: z.string() })))
  .handler(async ({ data }) => {
    const { organization } = await requireOrganizationContext(data.organizationSlug);
    return list${pluralPascal}(getDb(), organization.id);
  });

export const create${pascal}Fn = createServerFn({ method: "POST" })
  .validator(
    zodInput(
      z.object({
        organizationSlug: z.string(),
        data: create${pascal}Schema,
      }),
    ),
  )
  .handler(async ({ data }) => {
    const { organization } = await requireOrganizationContext(data.organizationSlug);
    return create${pascal}(getDb(), {
      ...data.data,
      organizationId: organization.id,
      status: "active",
    });
  });

export const delete${pascal}Fn = createServerFn({ method: "POST" })
  .validator(
    zodInput(
      z.object({
        organizationSlug: z.string(),
        id: z.string(),
      }),
    ),
  )
  .handler(async ({ data }) => {
    const { organization } = await requireOrganizationContext(data.organizationSlug);
    return delete${pascal}(getDb(), data.id, organization.id);
  });
`;

// Write files
fs.writeFileSync(schemaPath, schemaContent, "utf-8");
console.log(`  [created] packages/data-ops/src/drizzle/${singular}.ts`);

fs.writeFileSync(zodPath, zodContent, "utf-8");
console.log(`  [created] packages/data-ops/src/zod-schema/${singular}.ts`);

fs.writeFileSync(queryPath, queryContent, "utf-8");
console.log(`  [created] packages/data-ops/src/queries/${singular}.ts`);

fs.writeFileSync(serverFnPath, serverFnContent, "utf-8");
console.log(
  `  [created] apps/user-application/src/core/functions/${singular}.ts`
);

// Export in app-schema.ts
const appSchemaPath = path.join(
  rootDir,
  "packages/data-ops/src/drizzle/app-schema.ts"
);
const appSchema = fs.readFileSync(appSchemaPath, "utf-8");
const exportLine = `export * from "./${singular}";\n`;
if (!appSchema.includes(exportLine)) {
  fs.appendFileSync(appSchemaPath, exportLine);
  console.log(`  [registered] Exported in app-schema.ts`);
}

console.log("\n✅ Resource scaffolded successfully!");
console.log("Next steps:");
console.log("  1. Run `pnpm build:data-ops` to compile database schemas.");
console.log(
  `  2. Import \`list${pluralPascal}Fn\` and \`create${pascal}Fn\` in your workspace routes.`
);
