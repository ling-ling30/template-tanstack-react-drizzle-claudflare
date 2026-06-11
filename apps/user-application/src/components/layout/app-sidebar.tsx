import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Building2,
  Settings,
  User,
  LogOut,
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
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";

/** Dashboard navigation. `to` is a typed TanStack route path. */
const items = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/organizations", labelKey: "nav.organizations", icon: Building2 },
  { to: "/dashboard/settings", labelKey: "nav.settings", icon: Settings },
  { to: "/dashboard/account", labelKey: "nav.account", icon: User },
] as const;

export function AppSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LayoutDashboard className="size-4" />
          </div>
          <span className="font-semibold group-data-[collapsible=icon]:hidden">
            {t("app.name")}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild tooltip={t(item.labelKey)}>
                    <Link
                      to={item.to}
                      activeOptions={
                        "exact" in item && item.exact ? { exact: true } : undefined
                      }
                      activeProps={{ "data-active": "true" }}
                    >
                      <item.icon />
                      <span>{t(item.labelKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={t("account.signOut")}
              onClick={async () => {
                await authClient.signOut();
                navigate({ to: "/" });
              }}
            >
              <LogOut />
              <span>{t("account.signOut")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
