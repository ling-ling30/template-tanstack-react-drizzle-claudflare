import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";

export const Route = createFileRoute("/$organizationSlug/login")({
  component: OrganizationLoginPage,
});

function OrganizationLoginPage() {
  const { t } = useTranslation();
  const { organizationSlug } = Route.useParams();
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <form
        className="w-full max-w-sm space-y-4 rounded-md border bg-card p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const { error } = await signIn.username({
            username: String(formData.get("username")),
            password: String(formData.get("password")),
          });

          if (!error) {
            navigate({
              to: "/$organizationSlug/app",
              params: { organizationSlug },
            });
          } else {
            toast.error(t("orgLogin.failed"));
          }
        }}
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{t("orgLogin.title")}</h1>
          <p className="text-sm text-muted-foreground">/{organizationSlug}</p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="username">{t("orgLogin.username")}</Label>
          <Input id="username" name="username" required type="text" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">{t("orgLogin.password")}</Label>
          <Input id="password" name="password" required type="password" />
        </div>
        <Button className="w-full" type="submit">
          {t("orgLogin.signIn")}
        </Button>
      </form>
    </main>
  );
}
