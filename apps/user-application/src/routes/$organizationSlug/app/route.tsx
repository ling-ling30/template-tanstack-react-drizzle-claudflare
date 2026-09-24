import { isAppError } from "@repo/data-ops/errors";
import {
  createFileRoute,
  notFound,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { OrganizationSidebar } from "@/components/layout/organization-sidebar";
import { getOrganizationWorkspaceFn } from "@/core/functions/organizations";

export const Route = createFileRoute("/$organizationSlug/app")({
  // Server-verified membership gate. Child routes read `organization` / `role`
  // from route context; every server function still re-checks on its own.
  beforeLoad: async ({ params, location }) => {
    try {
      return await getOrganizationWorkspaceFn({
        data: params.organizationSlug,
      });
    } catch (error) {
      if (isAppError(error) && error.code === "AUTH_REQUIRED") {
        throw redirect({ to: "/login", search: { redirect: location.href } });
      }
      if (isAppError(error) && error.code === "ORG_NOT_FOUND") {
        throw notFound();
      }
      throw error;
    }
  },
  component: OrganizationAppLayout,
});

function OrganizationAppLayout() {
  const { organizationSlug } = Route.useParams();

  return (
    <div className="bg-background flex min-h-screen">
      <OrganizationSidebar organizationSlug={organizationSlug} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
