import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  DEFAULT_PLATFORM_LIST,
  platformOrganizationsQuery,
} from "@/core/queries/platform";
import { DataTable } from "@/components/data-table/data-table";
import { organizationColumns } from "@/components/platform/organizations/columns";
import { SearchBox } from "@/components/platform/search-box";
import { usePlatformOrganizations } from "@/hooks/use-platform-organizations";

export const Route = createFileRoute("/dashboard/organizations/")({
  // Prefetch the first page (the hook's initial params) during SSR.
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(
      platformOrganizationsQuery(DEFAULT_PLATFORM_LIST)
    ),
  component: PlatformOrganizationsPage,
});

function PlatformOrganizationsPage() {
  const { t, i18n } = useTranslation();
  const table = usePlatformOrganizations();

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{t("platform.orgsTitle")}</h1>
        <p className="text-muted-foreground">{t("platform.orgsSubtitle")}</p>
      </div>
      <SearchBox
        label={t("platform.searchOrgs")}
        onChange={table.setSearch}
        placeholder={t("platform.searchOrgs")}
        value={table.search}
      />
      <DataTable
        columns={organizationColumns(t, i18n.language)}
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
