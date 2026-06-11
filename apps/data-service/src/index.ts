import { WorkerEntrypoint } from "cloudflare:workers";
import { app } from "@/hono/app";

// Workflow classes must be exported from the worker entry so the runtime can
// find them (referenced by `class_name` in wrangler.jsonc).
export { ExampleWorkflow } from "@/workflows/example-workflow";

export default class DataService extends WorkerEntrypoint<Env> {
  fetch(request: Request) {
    return app.fetch(request, this.env, this.ctx);
  }
}
