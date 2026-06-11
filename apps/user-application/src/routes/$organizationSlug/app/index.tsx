import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const Route = createFileRoute("/$organizationSlug/app/")({
  component: OrganizationAppPage,
});

function OrganizationAppPage() {
  const { t } = useTranslation();
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("orgApp.title")}</h1>
        <p className="text-muted-foreground">{t("orgApp.welcome")}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("orgApp.dashboard")}</CardTitle>
          <CardDescription>{t("orgApp.shellNote")}</CardDescription>
        </CardHeader>
      </Card>
      <EmptyState title={t("orgApp.title")} description={t("orgApp.shellNote")} />
    </section>
  );
}
