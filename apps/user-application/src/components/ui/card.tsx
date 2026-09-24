import * as React from "react";

import { cn } from "@/lib/utils";

import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "bg-card text-card-foreground border-border asana-card-shadow flex flex-col rounded-xl border transition-shadow duration-150",
  {
    variants: {
      size: {
        default: "gap-6 py-6",
        sm: "gap-4 py-5 rounded-lg",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

type CardSize = "default" | "sm";
const CardContext = React.createContext<{ size: CardSize }>({
  size: "default",
});

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  const resolvedSize = size ?? "default";
  return (
    <CardContext.Provider value={{ size: resolvedSize }}>
      <div
        data-slot="card"
        data-size={resolvedSize}
        className={cn(cardVariants({ size: resolvedSize }), className)}
        {...props}
      />
    </CardContext.Provider>
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { size } = React.useContext(CardContext);
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        size === "sm" ? "gap-1 px-5" : "gap-1.5 px-6",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  const { size } = React.useContext(CardContext);
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-semibold",
        size === "sm"
          ? "text-sm leading-snug tracking-[-0.01em]"
          : "text-base leading-snug tracking-[-0.015em]",
        className
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  const { size } = React.useContext(CardContext);
  return (
    <div
      data-slot="card-description"
      className={cn(
        "text-muted-foreground",
        size === "sm" ? "text-xs leading-relaxed" : "text-sm leading-relaxed",
        className
      )}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  const { size } = React.useContext(CardContext);
  return (
    <div
      data-slot="card-content"
      className={cn(size === "sm" ? "px-5" : "px-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { size } = React.useContext(CardContext);
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center [.border-t]:pt-6",
        size === "sm" ? "px-5" : "px-6",
        className
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
};
