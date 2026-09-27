import { useEffect, useState } from "react";
import { Megaphone, X, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export interface AnnouncementBannerProps {
  id?: string;
  variant?: "announcement" | "maintenance" | "info";
  message?: string;
  actionText?: string;
  actionHref?: string;
  dismissible?: boolean;
}

export function AnnouncementBanner({
  id = "saas-template-announcement",
  variant = "announcement",
  message = "Welcome to the SaaS Template — Production-ready multi-tenant foundation.",
  actionText,
  actionHref,
  dismissible = true,
}: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem(`dismissed_announcement_${id}`);
      if (!isDismissed) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
  }, [id]);

  const handleDismiss = () => {
    setIsDismissing(true);
    try {
      localStorage.setItem(`dismissed_announcement_${id}`, "true");
    } catch {
      // Ignore storage errors in private browsing modes
    }
    setTimeout(() => {
      setIsVisible(false);
    }, 200);
  };

  if (!isVisible) return null;

  const bgStyles = {
    announcement: "bg-primary text-primary-foreground",
    maintenance: "bg-amber-500 text-amber-950 font-medium",
    info: "bg-muted text-muted-foreground",
  }[variant];

  return (
    <aside
      aria-label="Announcement"
      data-state={isDismissing ? "closing" : "open"}
      className={cn(
        "relative z-40 flex items-center justify-between px-4 text-xs sm:text-sm",
        bgStyles,
        "transition-[opacity,max-height,padding] duration-200 ease-out motion-reduce:transition-none",
        isDismissing
          ? "max-h-0 overflow-hidden py-0 opacity-0"
          : "max-h-16 py-2 opacity-100"
      )}
    >
      <div className="mx-auto flex flex-wrap items-center justify-center gap-2 text-center">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <Megaphone className="h-4 w-4 shrink-0" />
          {message}
        </span>
        {actionText && actionHref && (
          <Link
            to={actionHref}
            className="inline-flex items-center gap-1 font-semibold underline underline-offset-4 transition-opacity hover:opacity-80"
          >
            {actionText}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className="ml-2 inline-flex size-6 shrink-0 items-center justify-center rounded p-1 transition-[transform,background-color] duration-120 ease-out hover:bg-black/10 active:scale-95 dark:hover:bg-white/10"
          aria-label="Dismiss banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </aside>
  );
}
