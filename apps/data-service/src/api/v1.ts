import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

/**
 * Typed REST API (v1)
 * -------------------
 * Unlike the app's TanStack server functions (RPC for its own frontend), this is
 * a documented REST surface for EXTERNAL callers: mobile apps, partners, webhooks,
 * CLIs. Routes are defined with zod schemas, so the OpenAPI spec and runtime
 * validation stay in sync automatically.
 *
 * Spec:        GET /openapi.json
 * Swagger UI:  GET /docs
 *
 * Add real auth (API keys / bearer tokens) before exposing mutating routes.
 */
export const apiV1 = new OpenAPIHono<{ Bindings: Env }>();

// --- GET /api/v1/health -------------------------------------------------------
const HealthResponse = z
  .object({ status: z.literal("ok"), version: z.literal("v1") })
  .openapi("HealthResponse");

apiV1.openapi(
  createRoute({
    method: "get",
    path: "/health",
    summary: "Health check",
    tags: ["system"],
    responses: {
      200: {
        description: "Service is healthy",
        content: { "application/json": { schema: HealthResponse } },
      },
    },
  }),
  (c) => c.json({ status: "ok", version: "v1" } as const),
);

// --- GET /api/v1/items/{id} ---------------------------------------------------
const ItemParams = z.object({
  id: z.string().min(1).openapi({ param: { name: "id", in: "path" }, example: "abc123" }),
});
const Item = z
  .object({ id: z.string(), name: z.string() })
  .openapi("Item");
const ErrorResponse = z
  .object({ error: z.string() })
  .openapi("ErrorResponse");

apiV1.openapi(
  createRoute({
    method: "get",
    path: "/items/{id}",
    summary: "Fetch an item by id",
    tags: ["items"],
    request: { params: ItemParams },
    responses: {
      200: {
        description: "The item",
        content: { "application/json": { schema: Item } },
      },
      404: {
        description: "Not found",
        content: { "application/json": { schema: ErrorResponse } },
      },
    },
  }),
  (c) => {
    const { id } = c.req.valid("param");
    // ...look up the item (e.g. via @repo/data-ops queries)...
    return c.json({ id, name: `Item ${id}` }, 200);
  },
);
