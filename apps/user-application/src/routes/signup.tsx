import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-client";

export const Route = createFileRoute("/signup")({
  component: SignUpPage,
});

function SignUpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <main className="bg-background flex min-h-screen items-center justify-center p-6">
      <form
        method="post"
        className="bg-card w-full max-w-sm space-y-4 rounded-lg border p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const { error } = await signUp.email({
            name: String(formData.get("name")),
            email: String(formData.get("email")),
            password: String(formData.get("password")),
          });

          if (!error) {
            navigate({ to: "/onboarding" });
          } else {
            toast.error(t("auth.signUpFailed"));
          }
        }}
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{t("auth.signUpTitle")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("auth.signUpSubtitle")}
          </p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="name">{t("auth.name")}</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">{t("platform.email")}</Label>
          <Input
            id="email"
            name="email"
            required
            type="email"
            autoComplete="email"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">{t("platform.password")}</Label>
          <Input
            id="password"
            name="password"
            required
            type="password"
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <Button className="w-full" type="submit">
          {t("auth.signUp")}
        </Button>
        <p className="text-muted-foreground text-center text-sm">
          {t("auth.haveAccount")}{" "}
          <Link to="/login" className="underline underline-offset-4">
            {t("platform.signIn")}
          </Link>
        </p>
      </form>
    </main>
  );
}
