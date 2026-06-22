import { createFileRoute } from "@tanstack/react-router";
import { getEnv } from "@/core/env";

/**
 * Dynamic sitemap, served at /sitemap.xml. Add your public, indexable routes to
 * `paths`. Base origin comes from the BETTER_AUTH_URL var.
 */
const paths = ["/"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const origin = (
          getEnv().BETTER_AUTH_URL ?? "http://localhost:3000"
        ).replace(/\/$/, "");
        const now = new Date().toISOString();
        const urls = paths
          .map(
            (p) =>
              `  <url><loc>${origin}${p}</loc><lastmod>${now}</lastmod></url>`
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml" },
        });
      },
    },
  },
});
