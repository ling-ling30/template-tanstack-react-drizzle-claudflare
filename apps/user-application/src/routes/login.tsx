import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <form
        className="w-full max-w-sm space-y-4 rounded-lg border bg-card p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const { error } = await signIn.email({
            email: String(formData.get("email")),
            password: String(formData.get("password")),
          });

          if (!error) {
            navigate({ to: "/dashboard" });
          } else {
            toast.error(t("platform.signInFailed"));
          }
        }}
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{t("platform.loginTitle")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("platform.loginSubtitle")}
          </p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">{t("platform.email")}</Label>
          <Input id="email" name="email" required type="email" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">{t("platform.password")}</Label>
          <Input id="password" name="password" required type="password" />
        </div>
        <Button className="w-full" type="submit">
          {t("platform.signIn")}
        </Button>
      </form>
    </main>
  );
}
