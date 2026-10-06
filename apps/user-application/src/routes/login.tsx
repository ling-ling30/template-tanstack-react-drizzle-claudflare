import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resolvePostLoginPath } from "@/core/auth/post-login";
import { validateLoginSearch } from "@/core/auth/safe-redirect";
import {
  checkPlatformAdminStatusFn,
  getSignedInHomeInputFn,
} from "@/core/functions/auth-status";
import { authClient, signIn } from "@/lib/auth-client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  // `redirect` is where a route guard sent the user from. Untrusted input:
  // only same-site paths survive (see validateLoginSearch).
  validateSearch: validateLoginSearch,
  // Already signed in: skip the form and go where a fresh sign-in would.
  beforeLoad: async ({ search }) => {
    const home = await getSignedInHomeInputFn();
    if (home) {
      throw redirect({
        href: resolvePostLoginPath({ redirect: search.redirect, ...home }),
      });
    }
  },
  component: LoginPage,
});

/** Slugs of the signed-in user's organizations; empty if the lookup fails. */
async function listOrganizationSlugs(): Promise<string[]> {
  const { data } = await authClient.organization.list();
  return data?.map((organization) => organization.slug) ?? [];
}

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  return (
    <main className="bg-background flex min-h-screen items-center justify-center p-6">
      <form
        method="post"
        className="bg-card w-full max-w-sm space-y-4 rounded-lg border p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const { error } = await signIn.email({
            email: String(formData.get("email")),
            password: String(formData.get("password")),
          });

          if (!error) {
            // Back to the page the guard bounced them from, else their home:
            // platform admins -> /dashboard, members -> their organization's
            // dashboard. Checked again here (defense in depth); the target
            // route re-checks access itself.
            const isPlatformAdmin = await checkPlatformAdminStatusFn();
            const organizationSlugs = isPlatformAdmin
              ? []
              : await listOrganizationSlugs();
            navigate({
              href: resolvePostLoginPath({
                redirect,
                isPlatformAdmin,
                organizationSlugs,
              }),
            });
          } else {
            toast.error(t("platform.signInFailed"));
          }
        }}
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{t("platform.loginTitle")}</h1>
          <p className="text-muted-foreground text-sm">
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
        <p className="text-muted-foreground text-center text-sm">
          {t("auth.noAccount")}{" "}
          <Link to="/signup" className="underline underline-offset-4">
            {t("auth.signUp")}
          </Link>
        </p>
      </form>
    </main>
  );
}
