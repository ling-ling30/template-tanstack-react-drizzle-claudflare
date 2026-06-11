import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * EmptyState / ErrorState
 *
 * Lightweight, dependency-free states in the shadcn "new-york" style (uses theme
 * tokens + cn()). shadcn ships an official `Empty` component in newer registry
 * versions — if you prefer it, run `pnpm dlx shadcn@latest add empty` and swap.
 * This custom version keeps the template working offline and consistent.
 *
 * Text is passed in by the caller, so it stays translatable (no hardcoded strings here).
 */
function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center",
        className,
      )}
      {...props}
    >
      {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}

function ErrorState({
  title,
  description,
  action,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      data-slot="error-state"
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-10 text-center",
        className,
      )}
      {...props}
    >
      <div className="space-y-1">
        <p className="text-sm font-medium text-destructive">{title}</p>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}

export { EmptyState, ErrorState };
