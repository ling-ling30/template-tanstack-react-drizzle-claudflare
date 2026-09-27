import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InviteMemberDialog } from "./invite-member-dialog";

export function TeamMembersCard({
  organizationId,
}: {
  organizationId?: string;
}) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="size-5" />
            {t("team.title", "Team Members")}
          </CardTitle>
          <CardDescription>
            {t(
              "team.desc",
              "Collaborate with colleagues inside this workspace."
            )}
          </CardDescription>
        </div>
        <InviteMemberDialog organizationId={organizationId} />
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          {t(
            "team.emptyHint",
            "Manage roles, permissions, and pending invitations."
          )}
        </p>
      </CardContent>
    </Card>
  );
}
