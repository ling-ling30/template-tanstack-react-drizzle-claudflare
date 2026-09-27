import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  listNotificationsFn,
  markAllNotificationsReadFn,
  markNotificationReadFn,
} from "@/core/functions/notifications";

export function NotificationBell() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const queryKey = ["user-notifications"];

  const notifsQuery = useQuery({
    queryKey,
    queryFn: () => listNotificationsFn(),
    refetchInterval: 30_000, // Poll every 30 seconds
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationReadFn({ data: { id } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => markAllNotificationsReadFn(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  const notifications = notifsQuery.data ?? [];
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-foreground relative"
          aria-label={t("notifications.bell", "Notifications")}
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground animate-in fade-in-0 zoom-in-75 absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-bold duration-150 ease-out motion-reduce:transition-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 sm:w-96">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="text-sm font-semibold">
            {t("notifications.title", "Notifications")}
            {unreadCount > 0 && (
              <span className="text-muted-foreground ml-2 text-xs">
                ({unreadCount} {t("notifications.unread", "unread")})
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground h-auto p-0 text-xs"
              disabled={markAllMutation.isPending}
              onClick={() => markAllMutation.mutate()}
            >
              <CheckCheck className="mr-1 size-3.5" />
              {t("notifications.markAllRead", "Mark all read")}
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="text-muted-foreground p-6 text-center text-sm">
              {t("notifications.empty", "You have no notifications.")}
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`hover:bg-muted/50 cursor-pointer p-4 transition-colors duration-150 ease-out ${
                    !n.readAt ? "bg-muted/20" : ""
                  }`}
                  onClick={() => {
                    if (!n.readAt) markReadMutation.mutate(n.id);
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs leading-none font-medium">
                      {n.title}
                    </p>
                    <span className="text-muted-foreground shrink-0 text-[10px]">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {n.message}
                  </p>
                  {n.link && (
                    <Link
                      to={n.link as any}
                      className="text-primary mt-2 inline-block text-xs font-medium hover:underline"
                      onClick={() => setOpen(false)}
                    >
                      {t("notifications.view", "View details →")}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
