import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

/**
 * Dynamic robots.txt endpoint.
 * Directs search engine crawlers and points to the dynamic sitemap.
 */
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => {
        const origin = (env.BETTER_AUTH_URL ?? "http://localhost:3030").replace(
          /\/$/,
          ""
        );

        const robots = `User-agent: *
Allow: /
Allow: /showcase
Allow: /todos
Allow: /terms
Allow: /privacy
Disallow: /api/
Disallow: /dashboard/
Disallow: /*/app/

Sitemap: ${origin}/sitemap.xml
`;

        return new Response(robots, {
          headers: {
            "Content-Type": "text/plain; charset=UTF-8",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
