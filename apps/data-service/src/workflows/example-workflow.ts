import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
} from "cloudflare:workers";

/**
 * Background Jobs via Cloudflare Workflows
 * ----------------------------------------
 * Workflows run durable, multi-step async work OFF the request path. Each
 * `step.do(...)` is checkpointed and retried independently, so a failure in a
 * later step won't re-run earlier ones. Use this for things you don't want the
 * user waiting on: sending batches of email, generating documents, calling slow
 * third-party APIs, post-processing uploads.
 *
 * Trigger it from anywhere with the WORKFLOW binding (see hono/app.ts):
 *   await env.EXAMPLE_WORKFLOW.create({ params: { itemId, requestedBy } });
 */
export type ExampleWorkflowParams = {
  itemId: string;
  requestedBy: string;
};

export class ExampleWorkflow extends WorkflowEntrypoint<
  Env,
  ExampleWorkflowParams
> {
  async run(
    event: Readonly<WorkflowEvent<ExampleWorkflowParams>>,
    step: WorkflowStep,
  ) {
    const { itemId, requestedBy } = event.payload;

    // Step 1: do some work. Retries on its own if it throws.
    const processed = await step.do(
      "process-item",
      {
        retries: { limit: 3, delay: "5 seconds", backoff: "exponential" },
        timeout: "30 seconds",
      },
      async () => {
        // ...real work here (DB write, API call, file processing)...
        return { itemId, processedAt: new Date().toISOString() };
      },
    );

    // Step 2: wait before a follow-up (e.g. debounce, cool-down).
    await step.sleep("cool-down", "10 seconds");

    // Step 3: finalize. Only runs once step 1 succeeded; never re-runs step 1.
    await step.do("finalize", async () => {
      console.log(
        `[workflow] finished item=${processed.itemId} requestedBy=${requestedBy}`,
      );
    });
  }
}
