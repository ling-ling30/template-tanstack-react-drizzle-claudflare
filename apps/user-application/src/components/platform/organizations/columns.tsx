import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { Badge } from "@/components/ui/badge";

export type PlatformOrganizationRow = {
  id: string;
  name: string;
  slug: string;
  status: "active" | "disabled";
};

export function organizationColumns(
  t: TFunction,
): ColumnDef<PlatformOrganizationRow>[] {
  return [
    { accessorKey: "name", header: t("common.name") },
    { accessorKey: "slug", header: t("common.slug") },
    {
      accessorKey: "status",
      header: t("common.status"),
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "active" ? "default" : "secondary"}
        >
          {row.original.status === "active"
            ? t("status.active")
            : t("status.disabled")}
        </Badge>
      ),
    },
  ];
}
