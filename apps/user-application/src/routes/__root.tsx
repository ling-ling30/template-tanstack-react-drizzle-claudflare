/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import * as React from "react";
import type { QueryClient } from "@tanstack/react-query";
import { DefaultCatchBoundary } from "@/components/default-catch-boundary";
import { NotFound } from "@/components/not-found";
import { OfflineBanner } from "@/components/pwa/offline-banner";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { ThemeProvider } from "@/components/theme";
import { I18nProvider } from "@/i18n/provider";
import { GlobalProgressBar } from "@/components/ui/progress-bar";
import { Toaster } from "@/components/ui/sonner";
import appCss from "@/styles.css?url";
import { seo } from "@/utils/seo";
import { getSiteSettingsFn } from "@/core/functions/site-settings";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  // Load site-wide Open Graph / SEO settings on the server so they are
  // injected into <head> for crawlers and social-share unfurlers.
  loader: async () => {
    try {
      return { siteSettings: await getSiteSettingsFn() };
    } catch {
      return { siteSettings: null };
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { name: "theme-color", content: "#0a0a0a" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      ...seo({
        title: loaderData?.siteSettings?.ogTitle ?? "Modern SaaS Template",
        description:
          loaderData?.siteSettings?.ogDescription ??
          "A production-ready SaaS template.",
        image: loaderData?.siteSettings?.ogImage ?? undefined,
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <I18nProvider>
        <ThemeProvider defaultTheme="system" storageKey="theme">
          <Outlet />
          <Toaster />
        </ThemeProvider>
      </I18nProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <GlobalProgressBar />
        <OfflineBanner />
        <ServiceWorkerRegistration />
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
      </body>
    </html>
  );
}
