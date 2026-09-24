import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Building2, CircleCheck, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { platformStatsQuery } from "@/core/queries/platform";

export const Route = createFileRoute("/dashboard/")({
  // Prefetch during SSR so the numbers arrive with the page. prefetchQuery never
  // throws: a failure is shown by the component's error state, not a route error.
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(platformStatsQuery()),
  component: DashboardPage,
});

function DashboardPage() {
  const { t, i18n } = useTranslation();
  const stats = useQuery(platformStatsQuery());
  const number = new Intl.NumberFormat(i18n.language);

  const metrics = [
    {
      key: "users",
      label: t("dashboard.metricUsers"),
      value: stats.data?.users,
      icon: Users,
      to: "/dashboard/users",
    },
    {
      key: "orgs",
      label: t("dashboard.metricOrgs"),
      value: stats.data?.organizations,
      icon: Building2,
      to: "/dashboard/organizations",
    },
    {
      key: "activeOrgs",
      label: t("dashboard.metricActiveOrgs"),
      value: stats.data?.activeOrganizations,
      icon: CircleCheck,
      to: "/dashboard/organizations",
    },
  ] as const;

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground">{t("dashboard.overview")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <Link
            key={m.key}
            to={m.to}
            className="focus-visible:ring-ring rounded-xl focus-visible:ring-2 focus-visible:outline-none"
          >
            <Card className="hover:bg-accent/50 transition-colors">
              <CardHeader>
                <CardDescription className="flex items-center gap-2">
                  <m.icon className="size-4" />
                  {m.label}
                </CardDescription>
                <CardTitle className="text-3xl tabular-nums">
                  {stats.isLoading ? (
                    <Skeleton className="h-9 w-16" />
                  ) : m.value === undefined ? (
                    t("dashboard.metricPlaceholder")
                  ) : (
                    number.format(m.value)
                  )}
                </CardTitle>
              </CardHeader>
              {stats.error ? (
                <CardContent className="text-destructive text-sm">
                  {t("errors.loadFailed")}
                </CardContent>
              ) : null}
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
