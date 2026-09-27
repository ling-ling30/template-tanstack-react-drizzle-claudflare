import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

/**
 * Dynamic sitemap, served at /sitemap.xml. Add your public, indexable routes to
 * `paths`. Base origin comes from the BETTER_AUTH_URL var.
 */
const paths = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/showcase", priority: "0.8", changefreq: "weekly" },
  { path: "/todos", priority: "0.7", changefreq: "monthly" },
  { path: "/terms", priority: "0.5", changefreq: "yearly" },
  { path: "/privacy", priority: "0.5", changefreq: "yearly" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const origin = (env.BETTER_AUTH_URL ?? "http://localhost:3030").replace(
          /\/$/,
          ""
        );
        const now = new Date().toISOString();
        const urls = paths
          .map(
            (p) =>
              `  <url>\n    <loc>${origin}${p.path}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
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
