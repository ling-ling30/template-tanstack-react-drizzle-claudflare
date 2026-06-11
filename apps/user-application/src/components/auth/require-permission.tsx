import React from "react";
import { useSession } from "@/lib/auth-client";

interface RequirePermissionProps {
  /**
   * The minimum role required to view the children.
   * Customize this array to match your actual application roles.
   */
  allowedRoles?: string[];
  /**
   * A custom fallback UI if the user does not have permission.
   * If not provided, the component renders nothing.
   */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * A UI wrapper that only renders its children if the current user
 * meets the required role criteria. It prevents unauthorized users 
 * from seeing actions they cannot perform.
 */
export function RequirePermission({
  allowedRoles = ["admin", "owner"],
  fallback = null,
  children,
}: RequirePermissionProps) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    // Optionally return a skeleton/spinner here
    return null;
  }

  // Fallback to "user" if no role is defined in the session
  // Note: Better Auth schema natively supports a user role, but adapt this
  // to wherever your organization roles are stored.
  // Better Auth's admin plugin adds `role` at runtime, but the inferred
  // session type may not include it depending on plugin config. Read defensively.
  const userRole =
    (session?.user as { role?: string } | undefined)?.role ?? "user";

  const hasPermission = allowedRoles.includes(userRole);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
