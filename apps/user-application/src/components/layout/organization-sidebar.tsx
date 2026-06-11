import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

type OrganizationSidebarProps = {
  organizationSlug: string;
};

export function OrganizationSidebar({
  organizationSlug,
}: OrganizationSidebarProps) {
  const { t } = useTranslation();

  return (
    <aside className="hidden w-64 border-r bg-card p-4 md:block">
      <div className="mb-6 font-semibold">{t("orgApp.title")}</div>
      <nav className="space-y-2 text-sm">
        <Link
          className="block rounded-md px-3 py-2 text-foreground hover:bg-accent"
          params={{ organizationSlug }}
          to="/$organizationSlug/app"
          activeOptions={{ exact: true }}
          activeProps={{ className: "bg-accent" }}
        >
          {t("orgApp.dashboard")}
        </Link>
      </nav>
    </aside>
  );
}
