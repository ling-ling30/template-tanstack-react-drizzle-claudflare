import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Laptop, Smartphone, Globe, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  listSessionsFn,
  revokeOtherSessionsFn,
  revokeSessionFn,
} from "@/core/functions/sessions";

function parseDevice(userAgent: string | null): {
  name: string;
  isMobile: boolean;
} {
  if (!userAgent) return { name: "Unknown Browser", isMobile: false };
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    );
  let browser = "Web Browser";
  if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Edge")) browser = "Edge";

  let os = "Desktop";
  if (userAgent.includes("Mac OS")) os = "macOS";
  else if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad"))
    os = "iOS";

  return { name: `${browser} on ${os}`, isMobile };
}

export function ActiveSessionsCard() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["user-sessions"],
    queryFn: () => listSessionsFn(),
  });

  const revokeMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      setRevokingId(sessionId);
      try {
        await revokeSessionFn({ data: { sessionId } });
      } finally {
        setRevokingId(null);
      }
    },
    onSuccess: () => {
      toast.success(t("sessions.revokeSuccess"));
      queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
    },
    onError: () => {
      toast.error(t("account.genericError", "Failed to revoke session"));
    },
  });

  const revokeOthersMutation = useMutation({
    mutationFn: async () => {
      await revokeOtherSessionsFn();
    },
    onSuccess: () => {
      toast.success(t("sessions.revokeAllSuccess"));
      queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
    },
    onError: () => {
      toast.error(t("account.genericError", "Failed to revoke sessions"));
    },
  });

  const sessions = data?.sessions ?? [];
  const currentSessionId = data?.currentSessionId;
  const otherSessionsCount = sessions.filter(
    (s) => s.id !== currentSessionId
  ).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Shield className="text-muted-foreground h-5 w-5" />
            {t("sessions.title")}
          </CardTitle>
          <CardDescription className="mt-1">
            {t("sessions.desc")}
          </CardDescription>
        </div>
        {otherSessionsCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            disabled={revokeOthersMutation.isPending}
            onClick={() => revokeOthersMutation.mutate()}
          >
            {revokeOthersMutation.isPending
              ? t("sessions.revoking")
              : t("sessions.revokeAllOthers")}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-muted-foreground py-4 text-center text-sm">
            {t("common.loading")}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-muted-foreground py-4 text-center text-sm">
            {t("common.emptyTitle")}
          </div>
        ) : (
          <div className="divide-y rounded-md border">
            {sessions.map((sess) => {
              const isCurrent = sess.id === currentSessionId;
              const { name, isMobile } = parseDevice(sess.userAgent);
              const dateStr = new Date(sess.createdAt).toLocaleDateString(
                undefined,
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              );

              return (
                <div
                  key={sess.id}
                  className={`flex items-center justify-between p-4 transition-opacity duration-150 ease-out ${
                    revokingId === sess.id
                      ? "pointer-events-none opacity-50"
                      : "opacity-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-muted/40 flex h-10 w-10 items-center justify-center rounded-lg border">
                      {isMobile ? (
                        <Smartphone className="text-muted-foreground h-5 w-5" />
                      ) : sess.userAgent ? (
                        <Laptop className="text-muted-foreground h-5 w-5" />
                      ) : (
                        <Globe className="text-muted-foreground h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-sm font-medium">
                          {name}
                        </span>
                        {isCurrent && (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {t("sessions.currentSession")}
                          </span>
                        )}
                      </div>
                      <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-xs">
                        <span>
                          {t("sessions.lastActive", { date: dateStr })}
                        </span>
                        {sess.ipAddress && (
                          <>
                            <span>•</span>
                            <span>
                              {t("sessions.ip", { ip: sess.ipAddress })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      disabled={revokingId === sess.id}
                      onClick={() => revokeMutation.mutate(sess.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">{t("sessions.revoke")}</span>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
