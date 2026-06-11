import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import { organizationColumns } from "@/components/platform/organizations/columns";
import { OrganizationForm } from "@/components/platform/organizations/organization-form";
import { usePlatformOrganizations } from "@/hooks/use-platform-organizations";

export const Route = createFileRoute("/dashboard/organizations")({
  component: PlatformOrganizationsPage,
});

function PlatformOrganizationsPage() {
  const { t } = useTranslation();
  const table = usePlatformOrganizations();

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{t("platform.orgsTitle")}</h1>
        <p className="text-muted-foreground">{t("platform.orgsSubtitle")}</p>
      </div>
      <OrganizationForm />
      <DataTable
        columns={organizationColumns(t)}
        data={table.data}
        emptyMessage={t("platform.orgsEmpty")}
        errorMessage={
          table.errorMessage
            ? t(table.errorMessage as "errors.loadFailed")
            : null
        }
        isLoading={table.isLoading}
        onStateChange={table.setState}
        rowCount={table.rowCount}
        state={table.state}
      />
    </section>
  );
}
