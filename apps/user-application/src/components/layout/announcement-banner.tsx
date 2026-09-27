import { useEffect, useState } from "react";
import { Megaphone, X, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

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
    setIsVisible(false);
    try {
      localStorage.setItem(`dismissed_announcement_${id}`, "true");
    } catch {
      // Ignore storage errors in private browsing modes
    }
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
      className={`relative z-40 flex items-center justify-between px-4 py-2 text-xs sm:text-sm ${bgStyles} transition-all`}
    >
      <div className="mx-auto flex flex-wrap items-center justify-center gap-2 text-center">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <Megaphone className="h-4 w-4 shrink-0" />
          {message}
        </span>
        {actionText && actionHref && (
          <Link
            to={actionHref}
            className="inline-flex items-center gap-1 font-semibold underline underline-offset-4 hover:opacity-80"
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
          className="ml-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded p-1 hover:bg-black/10 dark:hover:bg-white/10"
          aria-label="Dismiss banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </aside>
  );
}
