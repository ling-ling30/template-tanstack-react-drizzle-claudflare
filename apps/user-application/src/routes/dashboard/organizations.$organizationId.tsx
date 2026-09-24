import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { OrganizationStatusBadge } from "@/components/platform/organizations/columns";
import { OrganizationStatusToggle } from "@/components/platform/organizations/status-toggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { platformOrganizationQuery } from "@/core/queries/platform";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute(
  "/dashboard/organizations/$organizationId"
)({
  loader: ({ context, params }) =>
    context.queryClient.prefetchQuery(
      platformOrganizationQuery(params.organizationId)
    ),
  component: PlatformOrganizationDetailPage,
});

function PlatformOrganizationDetailPage() {
  const { t, i18n } = useTranslation();
  const { organizationId } = Route.useParams();
  const query = useQuery(platformOrganizationQuery(organizationId));

  const back = (
    <Link
      to="/dashboard/organizations"
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
    >
      <ArrowLeft className="size-4" />
      {t("platform.backToOrgs")}
    </Link>
  );

  if (query.isLoading) {
    return (
      <section className="space-y-4">
        {back}
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </section>
    );
  }

  if (query.error || !query.data) {
    return (
      <section className="space-y-4">
        {back}
        <Alert variant="destructive">
          <AlertDescription>{t("errors.loadFailed")}</AlertDescription>
        </Alert>
      </section>
    );
  }

  const org = query.data;

  return (
    <section className="space-y-6">
      {back}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-2xl">
              {org.name}
              <OrganizationStatusBadge status={org.status} t={t} />
            </CardTitle>
            <CardDescription>
              /{org.slug} ·{" "}
              {t("platform.createdOn", {
                date: formatDate(org.createdAt, i18n.language),
              })}
            </CardDescription>
          </div>
          <OrganizationStatusToggle
            id={org.id}
            name={org.name}
            status={org.status}
          />
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("platform.members")}</CardTitle>
          <CardDescription>
            {t("platform.memberCount", { count: org.members.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {org.members.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t("platform.noMembers")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead>{t("platform.signInId")}</TableHead>
                  <TableHead>{t("platform.role")}</TableHead>
                  <TableHead>{t("platform.joined")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {org.members.map((m) => (
                  <TableRow key={m.memberId}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>{m.username ?? m.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          m.role.includes("owner") ? "default" : "secondary"
                        }
                      >
                        {m.role
                          .split(",")
                          .map((r) =>
                            t(`roles.${r.trim()}`, { defaultValue: r.trim() })
                          )
                          .join(", ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(m.joinedAt, i18n.language)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
