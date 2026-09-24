import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Info, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

const valueBoxVariants = cva(
  "min-w-0 rounded-lg border font-mono text-xs transition-colors p-2.5 shadow-2xs",
  {
    variants: {
      variant: {
        default: "border-border bg-muted/60 text-foreground dark:bg-background",
        outline: "border-border bg-background text-foreground dark:bg-card",
        info: "border-chart-3/30 bg-chart-3/10 text-chart-3",
        warning: "border-chart-4/30 bg-chart-4/10 text-chart-4",
        error: "border-destructive/30 bg-destructive/10 text-destructive",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive",
        success: "border-chart-2/30 bg-chart-2/10 text-chart-2",
        ghost:
          "border-transparent bg-transparent shadow-none p-1 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type ValueBoxType =
  | "default"
  | "info"
  | "warning"
  | "error"
  | "destructive"
  | "success"
  | "outline"
  | "ghost";

const SEMANTIC_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }> | null
> = {
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
  destructive: AlertCircle,
  success: CheckCircle2,
  default: null,
  outline: null,
  ghost: null,
};

const valuePillVariants: Record<string, string> = {
  default: "text-foreground bg-background dark:bg-card border-border",
  outline: "text-foreground bg-background dark:bg-card border-border",
  info: "text-chart-3 bg-background/80 dark:bg-chart-3/20 border-chart-3/30",
  warning: "text-chart-4 bg-background/80 dark:bg-chart-4/20 border-chart-4/30",
  error:
    "text-destructive bg-background/80 dark:bg-destructive/20 border-destructive/30",
  destructive:
    "text-destructive bg-background/80 dark:bg-destructive/20 border-destructive/30",
  success: "text-chart-2 bg-background/80 dark:bg-chart-2/20 border-chart-2/30",
  ghost: "text-foreground bg-transparent border-transparent",
};

const labelVariants: Record<string, string> = {
  default: "text-muted-foreground",
  outline: "text-muted-foreground",
  info: "text-chart-3/85",
  warning: "text-chart-4/85",
  error: "text-destructive/85",
  destructive: "text-destructive/85",
  success: "text-chart-2/85",
  ghost: "text-muted-foreground",
};

interface ValueBoxProps
  extends
    Omit<React.ComponentProps<"div">, "type">,
    VariantProps<typeof valueBoxVariants> {
  type?: ValueBoxType;
  label?: string;
  value?: React.ReactNode;
  showIcon?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

function ValueBox({
  className,
  variant,
  type,
  label,
  value,
  showIcon,
  icon: CustomIcon,
  children,
  ...props
}: ValueBoxProps) {
  const resolvedVariant: ValueBoxType = (type ||
    variant ||
    "default") as ValueBoxType;
  const isSemantic =
    resolvedVariant === "info" ||
    resolvedVariant === "warning" ||
    resolvedVariant === "error" ||
    resolvedVariant === "destructive" ||
    resolvedVariant === "success";

  const shouldShowIcon = showIcon !== undefined ? showIcon : isSemantic;
  const IconComponent = CustomIcon || SEMANTIC_ICONS[resolvedVariant];

  return (
    <div
      data-slot="value-box"
      className={cn(valueBoxVariants({ variant: resolvedVariant }), className)}
      {...props}
    >
      {label !== undefined ? (
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <div className="flex min-w-0 shrink-0 items-center gap-1.5">
            {shouldShowIcon && IconComponent && (
              <IconComponent className="size-3.5 shrink-0" />
            )}
            <span
              className={cn(
                "truncate text-xs font-medium",
                labelVariants[resolvedVariant] || "text-muted-foreground"
              )}
            >
              {label}:
            </span>
          </div>
          {typeof value === "string" || typeof value === "number" ? (
            <code
              className={cn(
                "max-w-full min-w-0 rounded border px-2 py-0.5 font-mono text-xs font-semibold tracking-tight break-words shadow-2xs",
                valuePillVariants[resolvedVariant] ||
                  "text-foreground bg-background dark:bg-card border-border"
              )}
            >
              {value}
            </code>
          ) : (
            <div className="max-w-full min-w-0 font-mono text-xs font-semibold tracking-tight break-words">
              {value}
            </div>
          )}
        </div>
      ) : value !== undefined ? (
        <div className="flex min-w-0 items-center gap-1.5 font-mono font-semibold">
          {shouldShowIcon && IconComponent && (
            <IconComponent className="size-3.5 shrink-0" />
          )}
          <span className="min-w-0 break-words">{value}</span>
        </div>
      ) : (
        <div className="flex min-w-0 items-start gap-2 font-mono text-xs leading-relaxed">
          {shouldShowIcon && IconComponent && (
            <IconComponent className="mt-0.5 size-3.5 shrink-0" />
          )}
          <div className="min-w-0 flex-1 break-words">{children}</div>
        </div>
      )}
    </div>
  );
}

// TelemetryBox is an alias for ValueBox when used in telemetry / debug panels
const TelemetryBox = ValueBox;

export {
  ValueBox,
  TelemetryBox,
  valueBoxVariants,
  type ValueBoxProps,
  type ValueBoxType,
};
