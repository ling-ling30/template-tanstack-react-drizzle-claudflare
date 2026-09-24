import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  DEFAULT_PLATFORM_LIST,
  platformUsersQuery,
} from "@/core/queries/platform";
import { DataTable } from "@/components/data-table/data-table";
import { SearchBox } from "@/components/platform/search-box";
import { userColumns } from "@/components/platform/users/columns";
import { usePlatformUsers } from "@/hooks/use-platform-users";

export const Route = createFileRoute("/dashboard/users")({
  // Prefetch the first page (the hook's initial params) during SSR.
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(
      platformUsersQuery(DEFAULT_PLATFORM_LIST)
    ),
  component: PlatformUsersPage,
});

function PlatformUsersPage() {
  const { t, i18n } = useTranslation();
  const table = usePlatformUsers();

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{t("platform.usersTitle")}</h1>
        <p className="text-muted-foreground">{t("platform.usersSubtitle")}</p>
      </div>
      <SearchBox
        label={t("platform.searchUsers")}
        onChange={table.setSearch}
        placeholder={t("platform.searchUsers")}
        value={table.search}
      />
      <DataTable
        columns={userColumns(t, i18n.language)}
        data={table.data}
        emptyMessage={t("platform.usersEmpty")}
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
