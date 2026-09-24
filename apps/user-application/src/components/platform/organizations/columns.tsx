import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { Badge } from "@/components/ui/badge";
import { OrganizationStatusToggle } from "@/components/platform/organizations/status-toggle";
import { formatDate } from "@/lib/format";

export type PlatformOrganizationRow = {
  id: string;
  name: string;
  slug: string;
  status: "active" | "disabled";
  createdAt: Date;
  memberCount: number;
};

export function OrganizationStatusBadge({
  status,
  t,
}: {
  status: "active" | "disabled";
  t: TFunction;
}) {
  return (
    <Badge variant={status === "active" ? "default" : "secondary"}>
      {status === "active" ? t("status.active") : t("status.disabled")}
    </Badge>
  );
}

export function organizationColumns(
  t: TFunction,
  locale: string
): ColumnDef<PlatformOrganizationRow>[] {
  return [
    {
      accessorKey: "name",
      header: t("common.name"),
      cell: ({ row }) => (
        <Link
          to="/dashboard/organizations/$organizationId"
          params={{ organizationId: row.original.id }}
          className="font-medium underline-offset-4 hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    { accessorKey: "slug", header: t("common.slug") },
    { accessorKey: "memberCount", header: t("platform.members") },
    {
      accessorKey: "createdAt",
      header: t("platform.created"),
      cell: ({ row }) => formatDate(row.original.createdAt, locale),
    },
    {
      accessorKey: "status",
      header: t("common.status"),
      cell: ({ row }) => (
        <OrganizationStatusBadge status={row.original.status} t={t} />
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{t("platform.actions")}</span>,
      cell: ({ row }) => (
        <OrganizationStatusToggle
          id={row.original.id}
          name={row.original.name}
          status={row.original.status}
        />
      ),
    },
  ];
}
