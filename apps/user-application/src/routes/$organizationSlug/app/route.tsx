import { createFileRoute, Outlet } from "@tanstack/react-router";
import { OrganizationSidebar } from "@/components/layout/organization-sidebar";

export const Route = createFileRoute("/$organizationSlug/app")({
  component: OrganizationAppLayout,
});

function OrganizationAppLayout() {
  const { organizationSlug } = Route.useParams();

  return (
    <div className="flex min-h-screen bg-background">
      <OrganizationSidebar organizationSlug={organizationSlug} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
