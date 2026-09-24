import type { ColumnDef } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/components/data-table/features";
import type { TFunction } from "i18next";
import { formatDate } from "@/lib/format";

export type PlatformUserRow = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  createdAt: Date;
  organizationCount: number;
};

export function userColumns(
  t: TFunction,
  locale: string
): ColumnDef<DataTableFeatures, PlatformUserRow>[] {
  return [
    {
      accessorKey: "name",
      header: t("common.name"),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    { accessorKey: "email", header: t("platform.email") },
    {
      accessorKey: "username",
      header: t("platform.username"),
      cell: ({ row }) =>
        row.original.username ?? t("dashboard.metricPlaceholder"),
    },
    {
      accessorKey: "organizationCount",
      header: t("platform.organizationsCol"),
    },
    {
      accessorKey: "createdAt",
      header: t("platform.joined"),
      cell: ({ row }) => formatDate(row.original.createdAt, locale),
    },
  ];
}
