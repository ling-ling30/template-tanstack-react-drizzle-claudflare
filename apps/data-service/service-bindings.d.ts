// Ambient declarations for the data-service worker.
// Keep this a script (no top-level import/export) so `Env` stays global.

interface ExampleWorkflowParams {
  itemId: string;
  requestedBy: string;
}

interface Env extends Cloudflare.Env {}
