import { isAppError } from "@repo/data-ops/errors";
import {
  createFileRoute,
  notFound,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { OrganizationSidebar } from "@/components/layout/organization-sidebar";
import { getOrganizationWorkspaceFn } from "@/core/functions/organizations";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { FeedbackDialog } from "@/components/feedback/feedback-dialog";
import { RbacProvider } from "@/components/auth/rbac";

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
  loader: async ({ params }) => {
    return getOrganizationWorkspaceFn({
      data: params.organizationSlug,
    });
  },
  component: OrganizationAppLayout,
});

function OrganizationAppLayout() {
  const { organizationSlug } = Route.useParams();
  const { organization, role } = Route.useLoaderData();

  return (
    <RbacProvider role={role}>
      <SidebarProvider>
        <OrganizationSidebar
          organizationSlug={organizationSlug}
          organizationName={organization.name}
          role={role}
        />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <span className="text-foreground text-sm font-semibold">
                {organization.name}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <FeedbackDialog />
              <NotificationBell />
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 p-6">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </RbacProvider>
  );
}
