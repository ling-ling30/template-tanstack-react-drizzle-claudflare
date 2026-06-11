import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

/**
 * Registers the service worker (production only — a SW in dev fights Vite HMR).
 * When a new worker is waiting, shows a small "update available" prompt that
 * activates it and reloads.
 */
export function ServiceWorkerRegistration() {
  const { t } = useTranslation();
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (
      typeof navigator === "undefined" ||
      !("serviceWorker" in navigator) ||
      import.meta.env?.DEV
    ) {
      return;
    }

    let cancelled = false;
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        if (cancelled) return;
        if (reg.waiting) setWaiting(reg.waiting);
        reg.addEventListener("updatefound", () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener("statechange", () => {
            if (sw.state === "installed" && navigator.serviceWorker.controller) {
              setWaiting(sw);
            }
          });
        });
      })
      .catch(() => {
        /* registration failures are non-fatal */
      });

    // Reload once the new worker takes control.
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!waiting) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-lg">
      <span className="text-sm">{t("pwa.updateAvailable")}</span>
      <Button
        size="sm"
        onClick={() => {
          waiting.postMessage("SKIP_WAITING");
        }}
      >
        {t("pwa.reload")}
      </Button>
    </div>
  );
}
