import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center border font-medium tracking-wide w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:opacity-90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground [a&]:hover:opacity-90",
        outline:
          "border-border text-foreground bg-background [a&]:hover:bg-muted",
        success: "border-chart-2/30 bg-chart-2/10 text-chart-2",
        warning: "border-chart-4/30 bg-chart-4/10 text-chart-4",
        info: "border-chart-3/30 bg-chart-3/10 text-chart-3",
        coral: "border-destructive/30 bg-destructive/10 text-destructive",
        neutral: "border-border/60 bg-muted/40 text-muted-foreground",
        pill: "border-border/80 bg-background/80 text-foreground [a&]:hover:bg-muted/60",
      },
      size: {
        default: "rounded-full px-2.5 py-0.5 text-xs",
        sm: "rounded-full px-2 py-0.5 text-[11px]",
        compact: "rounded-sm px-1.5 py-0 text-[10px] font-mono tracking-wider",
        pill: "rounded-full px-3 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
