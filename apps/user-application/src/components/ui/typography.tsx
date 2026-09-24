import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const typographyVariants = cva("font-sans text-foreground antialiased", {
  variants: {
    variant: {
      display:
        "text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.035em] leading-[1.08] text-balance",
      h1: "text-3xl sm:text-4xl font-bold tracking-[-0.025em] leading-[1.15] text-balance",
      h2: "text-2xl sm:text-3xl font-semibold tracking-[-0.02em] leading-[1.2] text-balance",
      h3: "text-xl sm:text-2xl font-semibold tracking-[-0.015em] leading-[1.25] text-balance",
      h4: "text-lg sm:text-xl font-semibold tracking-[-0.01em] leading-snug",
      lead: "text-base sm:text-lg text-muted-foreground leading-relaxed font-normal",
      large: "text-base font-medium leading-normal",
      body: "text-sm leading-relaxed font-normal",
      small: "text-xs leading-normal font-normal",
      caption: "text-xs text-muted-foreground leading-normal font-normal",
      muted: "text-sm text-muted-foreground leading-normal font-normal",
      code: "font-mono text-xs bg-muted/80 text-foreground border border-border/60 rounded-md px-1.5 py-0.5",
      kbd: "font-mono text-[11px] font-semibold bg-muted text-muted-foreground border border-border rounded px-1.5 py-0.5 shadow-2xs",
      micro:
        "font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground",
      blockquote:
        "border-l-2 border-primary/40 pl-4 italic text-muted-foreground leading-relaxed",
    },
    color: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      secondary: "text-secondary-foreground",
      destructive: "text-destructive",
      coral: "text-coral",
      "chart-1": "text-chart-1",
      "chart-2": "text-chart-2",
      "chart-3": "text-chart-3",
      "chart-4": "text-chart-4",
      "chart-5": "text-chart-5",
      inherit: "text-inherit",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      black: "font-black",
    },
    tracking: {
      tighter: "tracking-tighter",
      tight: "tracking-tight",
      normal: "tracking-normal",
      wide: "tracking-wide",
      wider: "tracking-wider",
    },
    leading: {
      none: "leading-none",
      tight: "leading-tight",
      snug: "leading-snug",
      normal: "leading-normal",
      relaxed: "leading-relaxed",
      loose: "leading-loose",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    },
    clamp: {
      1: "line-clamp-1",
      2: "line-clamp-2",
      3: "line-clamp-3",
      4: "line-clamp-4",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

type ElementType =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "div"
  | "label"
  | "code"
  | "kbd"
  | "blockquote"
  | "small";

const defaultElementMap: Record<
  NonNullable<VariantProps<typeof typographyVariants>["variant"]>,
  ElementType
> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  lead: "p",
  large: "p",
  body: "p",
  small: "small",
  caption: "span",
  muted: "span",
  code: "code",
  kbd: "kbd",
  micro: "span",
  blockquote: "blockquote",
};

export type TypographyColor = NonNullable<
  VariantProps<typeof typographyVariants>["color"]
>;

export interface TypographyProps
  extends
    Omit<React.HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof typographyVariants> {
  as?: ElementType;
  asChild?: boolean;
  truncate?: boolean;
  tabular?: boolean;
  balance?: boolean;
  pretty?: boolean;
}

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  (
    {
      className,
      variant = "body",
      color,
      weight,
      tracking,
      leading,
      align,
      clamp,
      as,
      asChild = false,
      truncate = false,
      tabular = false,
      balance = false,
      pretty = false,
      children,
      ...props
    },
    ref
  ) => {
    const Component = asChild
      ? Slot
      : as || (variant ? defaultElementMap[variant] : "p");

    return (
      <Component
        ref={ref as React.Ref<never>}
        data-slot="typography"
        data-variant={variant}
        className={cn(
          typographyVariants({
            variant,
            color,
            weight,
            tracking,
            leading,
            align,
            clamp,
          }),
          truncate && "truncate",
          tabular && "tabular-nums",
          balance && "text-balance",
          pretty && "text-pretty",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Typography.displayName = "Typography";

// Convenience Typed Subcomponents
export const Heading = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "as"> & {
    level?: 1 | 2 | 3 | 4;
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  }
>(({ level = 2, variant, as, ...props }, ref) => {
  const headingVariant = variant || (`h${level}` as const);
  const headingTag = as || (`h${level}` as const);
  return (
    <Typography ref={ref} as={headingTag} variant={headingVariant} {...props} />
  );
});
Heading.displayName = "Heading";

export const Text = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  (props, ref) => <Typography ref={ref} variant="body" {...props} />
);
Text.displayName = "Text";

export const Code = React.forwardRef<HTMLElement, TypographyProps>(
  (props, ref) => <Typography ref={ref} as="code" variant="code" {...props} />
);
Code.displayName = "Code";

export const Kbd = React.forwardRef<HTMLElement, TypographyProps>(
  (props, ref) => <Typography ref={ref} as="kbd" variant="kbd" {...props} />
);
Kbd.displayName = "Kbd";

// Compound Namespace API
export const TypographyComponents = Object.assign(Typography, {
  Display: (props: TypographyProps) => (
    <Typography variant="display" {...props} />
  ),
  H1: (props: TypographyProps) => <Typography variant="h1" {...props} />,
  H2: (props: TypographyProps) => <Typography variant="h2" {...props} />,
  H3: (props: TypographyProps) => <Typography variant="h3" {...props} />,
  H4: (props: TypographyProps) => <Typography variant="h4" {...props} />,
  Lead: (props: TypographyProps) => <Typography variant="lead" {...props} />,
  Large: (props: TypographyProps) => <Typography variant="large" {...props} />,
  Body: (props: TypographyProps) => <Typography variant="body" {...props} />,
  Small: (props: TypographyProps) => <Typography variant="small" {...props} />,
  Caption: (props: TypographyProps) => (
    <Typography variant="caption" {...props} />
  ),
  Muted: (props: TypographyProps) => <Typography variant="muted" {...props} />,
  Code: (props: TypographyProps) => <Typography variant="code" {...props} />,
  Kbd: (props: TypographyProps) => <Typography variant="kbd" {...props} />,
  Micro: (props: TypographyProps) => <Typography variant="micro" {...props} />,
  Blockquote: (props: TypographyProps) => (
    <Typography variant="blockquote" {...props} />
  ),
});
