import React, { createContext, useContext, useMemo } from "react";
import {
  roleCan,
  type PermissionAction,
  type PermissionResource,
  type OrganizationRole,
} from "@repo/data-ops/auth/access-control";

interface RbacContextValue {
  role: string;
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
  isViewer: boolean;
  can: <R extends PermissionResource>(
    resource: R,
    action: PermissionAction<R>
  ) => boolean;
}

const RbacContext = createContext<RbacContextValue | null>(null);

export interface RbacProviderProps {
  role?: string;
  children: React.ReactNode;
}

export function RbacProvider({ role = "viewer", children }: RbacProviderProps) {
  const value = useMemo<RbacContextValue>(() => {
    const normalizedRole = role || "viewer";
    const rolesList = normalizedRole.split(",").map((r) => r.trim());

    return {
      role: normalizedRole,
      isOwner: rolesList.includes("owner"),
      isAdmin: rolesList.includes("admin") || rolesList.includes("owner"),
      isMember:
        rolesList.includes("member") ||
        rolesList.includes("admin") ||
        rolesList.includes("owner"),
      isViewer: rolesList.includes("viewer"),
      can: <R extends PermissionResource>(
        resource: R,
        action: PermissionAction<R>
      ) => roleCan(normalizedRole, resource, action),
    };
  }, [role]);

  return <RbacContext.Provider value={value}>{children}</RbacContext.Provider>;
}

/**
 * Access the active organization RBAC context.
 */
export function useOrganizationRbac(): RbacContextValue {
  const ctx = useContext(RbacContext);
  if (!ctx) {
    // Graceful fallback for components outside an organization workspace
    return {
      role: "viewer",
      isOwner: false,
      isAdmin: false,
      isMember: false,
      isViewer: true,
      can: () => false,
    };
  }
  return ctx;
}

/**
 * React hook to check whether the current user has permission to perform an action.
 *
 * Example:
 * const canEdit = useCan("settings", "edit");
 */
export function useCan<R extends PermissionResource>(
  resource: R,
  action: PermissionAction<R>
): boolean {
  const { can } = useOrganizationRbac();
  return can(resource, action);
}

export interface CanProps<R extends PermissionResource> {
  resource: R;
  action: PermissionAction<R>;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Declarative component for granular permission gating.
 *
 * Example:
 * <Can resource="billing" action="manage">
 *   <UpgradeButton />
 * </Can>
 */
export function Can<R extends PermissionResource>({
  resource,
  action,
  fallback = null,
  children,
}: CanProps<R>) {
  const allowed = useCan(resource, action);
  if (!allowed) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}

export interface RoleGateProps {
  allowedRoles: (OrganizationRole | string)[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Declarative component for role gating.
 *
 * Example:
 * <RoleGate allowedRoles={["owner"]}>
 *   <DangerZone />
 * </RoleGate>
 */
export function RoleGate({
  allowedRoles,
  fallback = null,
  children,
}: RoleGateProps) {
  const { role } = useOrganizationRbac();
  const userRoles = role.split(",").map((r) => r.trim());
  const hasRole = allowedRoles.some((allowed) => userRoles.includes(allowed));

  if (!hasRole) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
