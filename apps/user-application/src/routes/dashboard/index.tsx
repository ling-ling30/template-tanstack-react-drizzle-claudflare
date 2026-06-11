import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LayoutDashboard } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { t } = useTranslation();
  const metrics = [
    { key: "metricUsers", label: t("dashboard.metricUsers") },
    { key: "metricOrgs", label: t("dashboard.metricOrgs") },
    { key: "metricDocuments", label: t("dashboard.metricDocuments") },
  ];

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground">{t("dashboard.shellNote")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <Card key={m.key}>
            <CardHeader>
              <CardDescription>{m.label}</CardDescription>
              <CardTitle className="text-3xl">
                {t("dashboard.metricPlaceholder")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {t("dashboard.shellNote")}
            </CardContent>
          </Card>
        ))}
      </div>

      <EmptyState
        icon={<LayoutDashboard className="size-6" />}
        title={t("common.emptyTitle")}
        description={t("dashboard.shellNote")}
      />
    </section>
  );
}
