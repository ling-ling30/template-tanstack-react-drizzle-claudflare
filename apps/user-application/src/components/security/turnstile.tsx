import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
        }
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

export type TurnstileProps = {
  siteKey: string;
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
  className?: string;
};

/**
 * Drop-in Cloudflare Turnstile CAPTCHA/challenge component.
 * Automatically injects the Turnstile script and renders the widget.
 */
export function Turnstile({
  siteKey,
  onSuccess,
  onError,
  onExpire,
  theme = "auto",
  size = "normal",
  className,
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    // If no sitekey provided or in test, trigger mock success
    if (!siteKey || siteKey === "mock-site-key") {
      onSuccess("mock-turnstile-token");
      return;
    }

    let isMounted = true;

    function renderWidget() {
      if (!window.turnstile || !containerRef.current || !isMounted) return;
      if (widgetIdRef.current) return;

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onSuccess,
        "error-callback": onError,
        "expired-callback": onExpire,
        theme,
        size,
      });
    }

    if (window.turnstile) {
      renderWidget();
    } else {
      const existingScript = document.getElementById(
        "cloudflare-turnstile-script"
      );
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "cloudflare-turnstile-script";
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (isMounted) renderWidget();
        };
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener("load", renderWidget);
      }
    }

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignore unmount cleanup errors
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onSuccess, onError, onExpire, theme, size]);

  return <div ref={containerRef} className={className} />;
}
