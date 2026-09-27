import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "saas_cookie_consent";

export function CookieConsent() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Small delay so it smoothly animates in after page loads
        const timer = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore if localStorage unavailable
    }
  }, []);

  const handleChoice = (choice: "all" | "essential") => {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Ignore
    }
    setIsDismissing(true);
    setTimeout(() => {
      setVisible(false);
    }, 200);
  };

  if (!visible) return null;

  return (
    <div
      data-state={isDismissing ? "closed" : "open"}
      className={cn(
        "fixed right-4 bottom-4 z-50 max-w-sm",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4",
        "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4",
        "duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none"
      )}
    >
      <div className="surface-glass surface-card-shadow border-border rounded-xl border p-4.5 text-xs shadow-lg backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div className="text-foreground flex items-center gap-2 font-semibold">
            <Cookie className="text-primary size-4" />
            <span>{t("cookieConsent.title")}</span>
          </div>
          <button
            type="button"
            onClick={() => handleChoice("essential")}
            aria-label={t("cookieConsent.close")}
            className="text-muted-foreground hover:text-foreground transition-[transform,color] duration-120 ease-out active:scale-95"
          >
            <X className="size-3.5" />
          </button>
        </div>

        <p className="text-muted-foreground mt-2 leading-relaxed">
          {t("cookieConsent.body")}{" "}
          <Link
            to="/privacy"
            className="text-foreground hover:text-primary underline underline-offset-2 transition-colors"
          >
            {t("cookieConsent.privacyPolicy")}
          </Link>
          .
        </p>

        <div className="mt-3.5 flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleChoice("essential")}
            className="text-muted-foreground hover:text-foreground h-7 text-xs"
          >
            {t("cookieConsent.essential")}
          </Button>
          <Button
            size="sm"
            onClick={() => handleChoice("all")}
            className="h-7 text-xs font-medium"
          >
            {t("cookieConsent.acceptAll")}
          </Button>
        </div>
      </div>
    </div>
  );
}
