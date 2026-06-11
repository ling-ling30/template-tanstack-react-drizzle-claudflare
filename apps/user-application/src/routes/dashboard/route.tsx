import {
  createFileRoute,
  Outlet,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { checkPlatformAdminStatusFn } from "@/core/functions/auth-status";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const isAdmin = await checkPlatformAdminStatusFn();
    if (!isAdmin) {
      throw redirect({ to: "/login" });
    }
  },
  component: DashboardLayout,
});

/** Map the current pathname to a header title i18n key. */
function titleKeyForPath(
  pathname: string,
): "nav.organizations" | "nav.settings" | "nav.account" | "nav.dashboard" {
  if (pathname.startsWith("/dashboard/organizations")) return "nav.organizations";
  if (pathname.startsWith("/dashboard/settings")) return "nav.settings";
  if (pathname.startsWith("/dashboard/account")) return "nav.account";
  return "nav.dashboard";
}

function DashboardLayout() {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-medium">{t(titleKeyForPath(pathname))}</h1>
          <div className="ml-auto flex items-center gap-2">
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
  );
}
