import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CreateOrganizationForm } from "@/components/organizations/create-organization-form";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient, useSession } from "@/lib/auth-client";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

/**
 * Landing spot after sign-in / sign-up for non-platform users: pick one of your
 * organizations, or create one (you become its owner). Access control lives in
 * the workspace route's server check — this page only routes the user.
 */
function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();
  const organizations = authClient.useListOrganizations();

  useEffect(() => {
    if (!isPending && !session) navigate({ to: "/login" });
  }, [isPending, session, navigate]);

  if (isPending || !session) {
    return (
      <main className="mx-auto max-w-xl space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </main>
    );
  }

  const openWorkspace = (slug: string) =>
    navigate({
      to: "/$organizationSlug/app",
      params: { organizationSlug: slug },
    });

  return (
    <main className="mx-auto max-w-xl space-y-8 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("onboarding.title")}</h1>
        <p className="text-muted-foreground">{t("onboarding.subtitle")}</p>
      </div>

      {organizations.data && organizations.data.length > 0 ? (
        <section className="space-y-2">
          <h2 className="font-medium">{t("onboarding.yourOrgs")}</h2>
          <ul className="bg-card divide-y rounded-md border">
            {organizations.data.map((org) => (
              <li key={org.id}>
                <Link
                  to="/$organizationSlug/app"
                  params={{ organizationSlug: org.slug }}
                  className="hover:bg-accent flex items-center justify-between p-3"
                >
                  <span>{org.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-2">
        <h2 className="font-medium">{t("onboarding.createTitle")}</h2>
        <CreateOrganizationForm onCreated={({ slug }) => openWorkspace(slug)} />
      </section>
    </main>
  );
}
