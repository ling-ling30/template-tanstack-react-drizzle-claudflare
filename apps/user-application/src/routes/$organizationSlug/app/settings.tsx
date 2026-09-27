import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AlertTriangle, Building, LogOut, Trash2, Shield } from "lucide-react";
import { ApiKeysCard } from "@/components/team/api-keys-card";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Can } from "@/components/auth/rbac";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/$organizationSlug/app/settings")({
  component: WorkspaceSettingsPage,
});

function WorkspaceSettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { organization, role } = Route.useRouteContext();
  const [name, setName] = useState(organization.name);
  const [updating, setUpdating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setUpdating(true);
    try {
      const res = await authClient.organization.update({
        data: { name: name.trim() },
        organizationId: organization.id,
      });

      if (res.error) {
        toast.error(res.error.message || t("errors.INTERNAL"));
      } else {
        toast.success(
          t("workspaceSettings.updatedSuccess", "Workspace name updated.")
        );
      }
    } catch {
      toast.error(t("errors.INTERNAL"));
    } finally {
      setUpdating(false);
    }
  }

  async function handleLeave() {
    if (
      !confirm(
        t(
          "workspaceSettings.leaveConfirm",
          "Are you sure you want to leave this workspace?"
        )
      )
    ) {
      return;
    }

    try {
      const res = await authClient.organization.leave({
        organizationId: organization.id,
      });

      if (res.error) {
        toast.error(res.error.message || t("errors.INTERNAL"));
      } else {
        toast.success(
          t("workspaceSettings.leaveSuccess", "Left workspace successfully.")
        );
        navigate({ to: "/login" });
      }
    } catch {
      toast.error(t("errors.INTERNAL"));
    }
  }

  async function handleDeleteWorkspace(e: React.FormEvent) {
    e.preventDefault();
    if (deleteConfirm !== organization.slug) {
      toast.error(
        t("workspaceSettings.slugMismatch", "Slug confirmation does not match.")
      );
      return;
    }

    setDeleting(true);
    try {
      const res = await authClient.organization.delete({
        organizationId: organization.id,
      });

      if (res.error) {
        toast.error(res.error.message || t("errors.INTERNAL"));
      } else {
        toast.success(
          t("workspaceSettings.deleteSuccess", "Workspace deleted.")
        );
        setDeleteOpen(false);
        navigate({ to: "/login" });
      }
    } catch {
      toast.error(t("errors.INTERNAL"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("workspaceSettings.title", "Workspace Settings")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t(
            "workspaceSettings.subtitle",
            "Manage workspace details, team preferences, and access."
          )}
        </p>
      </div>

      {/* Role & Permissions Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="text-primary size-5" />
              {t("workspaceSettings.rbacTitle", "Your Role & Access Level")}
            </CardTitle>
            <Badge
              variant={
                role === "owner"
                  ? "coral"
                  : role === "admin"
                    ? "default"
                    : "secondary"
              }
              className="text-xs tracking-wider uppercase"
            >
              {role}
            </Badge>
          </div>
          <CardDescription>
            {t(
              "workspaceSettings.rbacDesc",
              "Permissions are enforced server-side according to your workspace role."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-border/60 bg-muted/20 flex items-center justify-between rounded-lg border p-3 text-xs">
              <span className="text-muted-foreground">Workspace Settings</span>
              <span className="font-semibold">
                {role === "owner" || role === "admin" ? "Edit" : "Read-only"}
              </span>
            </div>
            <div className="border-border/60 bg-muted/20 flex items-center justify-between rounded-lg border p-3 text-xs">
              <span className="text-muted-foreground">Team Members</span>
              <span className="font-semibold">
                {role === "owner" || role === "admin" ? "Manage" : "View"}
              </span>
            </div>
            <div className="border-border/60 bg-muted/20 flex items-center justify-between rounded-lg border p-3 text-xs">
              <span className="text-muted-foreground">Developer API Keys</span>
              <span className="font-semibold">
                {role === "owner" || role === "admin" ? "Manage" : "Read"}
              </span>
            </div>
            <div className="border-border/60 bg-muted/20 flex items-center justify-between rounded-lg border p-3 text-xs">
              <span className="text-muted-foreground">Danger Zone</span>
              <span className="font-semibold">
                {role === "owner" ? "Authorized" : "Locked"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <form onSubmit={handleUpdateName}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="size-5" />
              {t("workspaceSettings.general", "General Information")}
            </CardTitle>
            <CardDescription>
              {t(
                "workspaceSettings.generalDesc",
                "The display name and identifier for your organization."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid max-w-md gap-2">
              <Label htmlFor="workspace-name">{t("common.name", "Name")}</Label>
              <Input
                id="workspace-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={updating || (role !== "owner" && role !== "admin")}
                required
              />
            </div>
            <div className="grid max-w-md gap-2">
              <Label htmlFor="workspace-slug">{t("common.slug", "Slug")}</Label>
              <Input
                id="workspace-slug"
                value={organization.slug}
                disabled
                className="bg-muted text-muted-foreground"
              />
              <p className="text-muted-foreground text-xs">
                {t(
                  "workspaceSettings.slugHint",
                  "The unique URL identifier for this workspace."
                )}
              </p>
            </div>
          </CardContent>
          <CardFooter className="border-t py-4">
            <Can
              resource="settings"
              action="edit"
              fallback={
                <p className="text-muted-foreground text-xs">
                  Read-only view. Only organization admins and owners can rename
                  the workspace.
                </p>
              }
            >
              <Button type="submit" disabled={updating || !name.trim()}>
                {updating ? t("actions.saving") : t("actions.save")}
              </Button>
            </Can>
          </CardFooter>
        </form>
      </Card>

      {/* Developer API Keys */}
      <ApiKeysCard organizationSlug={organization.slug} />

      {/* Danger Zone */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2 text-lg">
            <AlertTriangle className="size-5" />
            {t("workspaceSettings.dangerZone", "Danger Zone")}
          </CardTitle>
          <CardDescription>
            {t(
              "workspaceSettings.dangerDesc",
              "Irreversible actions regarding your workspace membership and data."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium">
                {t("workspaceSettings.leaveTitle", "Leave this workspace")}
              </p>
              <p className="text-muted-foreground text-xs">
                {t(
                  "workspaceSettings.leaveNote",
                  "You will lose access to all resources in this organization."
                )}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLeave}
              className="gap-2"
            >
              <LogOut className="size-4" />
              {t("workspaceSettings.leaveBtn", "Leave workspace")}
            </Button>
          </div>

          <Can resource="danger_zone" action="delete">
            <div className="border-destructive/20 flex flex-col justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-destructive text-sm font-medium">
                  {t("workspaceSettings.deleteTitle", "Delete workspace")}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t(
                    "workspaceSettings.deleteNote",
                    "Permanently delete this organization, members, and all associated data."
                  )}
                </p>
              </div>
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="size-4" />
                    {t("workspaceSettings.deleteBtn", "Delete workspace")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleDeleteWorkspace}>
                    <DialogHeader>
                      <DialogTitle className="text-destructive">
                        {t(
                          "workspaceSettings.deleteConfirmTitle",
                          "Delete Workspace"
                        )}
                      </DialogTitle>
                      <DialogDescription>
                        {t(
                          "workspaceSettings.deleteConfirmDesc",
                          "This action cannot be undone. To confirm, type your workspace slug below:"
                        )}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Label className="mb-2 block font-mono text-xs">
                        {organization.slug}
                      </Label>
                      <Input
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        placeholder={organization.slug}
                        required
                        disabled={deleting}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDeleteOpen(false)}
                        disabled={deleting}
                      >
                        {t("actions.cancel")}
                      </Button>
                      <Button
                        type="submit"
                        variant="destructive"
                        disabled={
                          deleting || deleteConfirm !== organization.slug
                        }
                      >
                        {deleting ? t("common.loading") : t("actions.delete")}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </Can>
        </CardContent>
      </Card>
    </div>
  );
}
