import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { apiV1 } from "@/api/v1";

export const app = new OpenAPIHono<{ Bindings: Env }>();

app.get("/", (c) => {
  return c.text("Hello World");
});

/**
 * Example: kick off a background job (Cloudflare Workflow) and return immediately.
 * The heavy work happens durably in ExampleWorkflow, not in this request.
 */
app.post("/jobs/example", async (c) => {
  const body = await c.req
    .json<{ itemId?: string; requestedBy?: string }>()
    .catch(() => ({}) as { itemId?: string; requestedBy?: string });
  const instance = await c.env.EXAMPLE_WORKFLOW.create({
    params: {
      itemId: body.itemId ?? crypto.randomUUID(),
      requestedBy: body.requestedBy ?? "anonymous",
    },
  });
  return c.json({ id: instance.id, status: "queued" });
});

// --- Versioned REST API + OpenAPI docs ---------------------------------------
app.route("/api/v1", apiV1);

// Machine-readable spec (aggregates every registered route).
app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: { title: "Data Service API", version: "1.0.0" },
});

// Human-friendly Swagger UI.
app.get("/docs", swaggerUI({ url: "/openapi.json" }));
