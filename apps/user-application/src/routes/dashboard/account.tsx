import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/forms/submit-button";

export const Route = createFileRoute("/dashboard/account")({
  component: AccountPage,
});

function AccountPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: session } = useSession();

  const profileForm = useForm({
    defaultValues: { name: session?.user?.name ?? "" },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.updateUser({ name: value.name });
      if (error) toast.error(t("account.genericError"));
      else toast.success(t("account.profileSaved"));
    },
  });

  const passwordForm = useForm({
    defaultValues: { currentPassword: "", newPassword: "" },
    onSubmit: async ({ value, formApi }) => {
      const { error } = await authClient.changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
        revokeOtherSessions: true,
      });
      if (error) {
        toast.error(t("account.genericError"));
      } else {
        toast.success(t("account.passwordChanged"));
        formApi.reset();
      }
    },
  });

  return (
    <section className="grid max-w-2xl gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("account.title")}</h1>
        <Button
          variant="outline"
          onClick={async () => {
            await authClient.signOut();
            navigate({ to: "/" });
          }}
        >
          {t("account.signOut")}
        </Button>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>{t("account.profileSection")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              profileForm.handleSubmit();
            }}
          >
            <div className="space-y-1">
              <Label>{t("account.email")}</Label>
              <Input value={session?.user?.email ?? ""} disabled readOnly />
            </div>
            <profileForm.Field name="name">
              {(field) => (
                <div className="space-y-1">
                  <Label htmlFor={field.name}>{t("account.name")}</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </profileForm.Field>
            <profileForm.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <SubmitButton disabled={!canSubmit} isSubmitting={isSubmitting}>
                  {t("account.saveProfile")}
                </SubmitButton>
              )}
            </profileForm.Subscribe>
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>{t("account.passwordSection")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              passwordForm.handleSubmit();
            }}
          >
            <passwordForm.Field name="currentPassword">
              {(field) => (
                <div className="space-y-1">
                  <Label htmlFor={field.name}>
                    {t("account.currentPassword")}
                  </Label>
                  <Input
                    id={field.name}
                    type="password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </passwordForm.Field>
            <passwordForm.Field name="newPassword">
              {(field) => (
                <div className="space-y-1">
                  <Label htmlFor={field.name}>{t("account.newPassword")}</Label>
                  <Input
                    id={field.name}
                    type="password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </passwordForm.Field>
            <passwordForm.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <SubmitButton disabled={!canSubmit} isSubmitting={isSubmitting}>
                  {t("account.changePassword")}
                </SubmitButton>
              )}
            </passwordForm.Subscribe>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
