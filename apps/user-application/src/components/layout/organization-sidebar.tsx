import { Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Building2,
  LayoutDashboard,
  Settings,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";

type OrganizationSidebarProps = {
  organizationSlug: string;
  organizationName?: string;
  role?: string;
};

export function OrganizationSidebar({
  organizationSlug,
  organizationName,
  role,
}: OrganizationSidebarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold">
            <Building2 className="size-4" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold">
              {organizationName ?? organizationSlug}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground truncate text-xs">
                {organizationSlug}
              </span>
              {role && (
                <Badge
                  variant="neutral"
                  size="compact"
                  className="text-[10px] uppercase"
                >
                  {role}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("orgApp.dashboard")}>
                  <Link
                    params={{ organizationSlug }}
                    to="/$organizationSlug/dashboard"
                    activeOptions={{ exact: true }}
                    activeProps={{ "data-active": "true" }}
                  >
                    <LayoutDashboard className="size-4" />
                    <span>{t("orgApp.dashboard")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={t("nav.settings", "Settings")}
                >
                  <Link
                    params={{ organizationSlug }}
                    to="/$organizationSlug/dashboard/settings"
                    activeOptions={{ exact: true }}
                    activeProps={{ "data-active": "true" }}
                  >
                    <Settings className="size-4" />
                    <span>{t("nav.settings", "Settings")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={t("nav.dashboard", "Platform")}>
              <Link to="/dashboard">
                <ArrowLeft className="size-4" />
                <span>{t("nav.dashboard", "Back to Platform")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={t("account.signOut")}
              onClick={async () => {
                await authClient.signOut();
                navigate({ to: "/" });
              }}
            >
              <LogOut className="size-4" />
              <span>{t("account.signOut")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
