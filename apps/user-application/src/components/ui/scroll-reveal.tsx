import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export type ScrollRevealVariant =
  "blur-up" | "fade-up" | "fade-in" | "scale-up" | "slide-left" | "slide-right";

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  asChild?: boolean;
  variant?: ScrollRevealVariant;
  delayMs?: number;
  durationMs?: number;
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
  triggerImmediate?: boolean;
}

const variantHiddenClasses: Record<ScrollRevealVariant, string> = {
  "blur-up": "opacity-0 translate-y-5 blur-[4px]",
  "fade-up": "opacity-0 translate-y-5",
  "fade-in": "opacity-0",
  "scale-up": "opacity-0 scale-95",
  "slide-left": "opacity-0 -translate-x-5",
  "slide-right": "opacity-0 translate-x-5",
};

export const ScrollReveal = React.forwardRef<HTMLElement, ScrollRevealProps>(
  (
    {
      as,
      asChild = false,
      variant = "blur-up",
      delayMs = 0,
      durationMs = 400,
      once = true,
      threshold = 0.15,
      rootMargin = "0px 0px -40px 0px",
      triggerImmediate = false,
      className,
      style,
      children,
      ...props
    },
    forwardedRef
  ) => {
    const internalRef = React.useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = React.useState(triggerImmediate);

    React.useImperativeHandle(
      forwardedRef,
      () => internalRef.current as HTMLElement
    );

    React.useEffect(() => {
      if (triggerImmediate) {
        setIsVisible(true);
        return;
      }

      const node = internalRef.current;
      if (!node) return;

      // Handle environments without IntersectionObserver (e.g., SSR or older browsers)
      if (
        typeof window === "undefined" ||
        !("IntersectionObserver" in window)
      ) {
        setIsVisible(true);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              if (once) observer.unobserve(entry.target);
            } else if (!once) {
              setIsVisible(false);
            }
          });
        },
        { threshold, rootMargin }
      );

      observer.observe(node);

      return () => {
        observer.disconnect();
      };
    }, [once, threshold, rootMargin, triggerImmediate]);

    const Component = asChild ? Slot : as || "div";

    return (
      <Component
        ref={internalRef}
        data-slot="scroll-reveal"
        data-variant={variant}
        data-visible={isVisible}
        style={{
          transitionDuration: `${durationMs}ms`,
          transitionDelay: `${delayMs}ms`,
          transitionTimingFunction:
            "var(--ease-out, cubic-bezier(0.23, 1, 0.32, 1))",
          ...style,
        }}
        className={cn(
          "transition-[opacity,transform,filter] will-change-[opacity,transform] motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:filter-none motion-reduce:transition-none",
          !isVisible
            ? variantHiddenClasses[variant]
            : "blur-0 translate-x-0 translate-y-0 scale-100 opacity-100",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
ScrollReveal.displayName = "ScrollReveal";

export interface ScrollRevealGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  staggerMs?: number;
  baseDelayMs?: number;
  variant?: ScrollRevealVariant;
  durationMs?: number;
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
  triggerImmediate?: boolean;
  as?: React.ElementType;
}

export function ScrollRevealGroup({
  children,
  staggerMs = 70,
  baseDelayMs = 0,
  variant = "blur-up",
  durationMs = 400,
  once = true,
  threshold = 0.15,
  rootMargin = "0px 0px -40px 0px",
  triggerImmediate = false,
  as: Component = "div",
  className,
  ...props
}: ScrollRevealGroupProps) {
  return (
    <Component className={className} data-slot="scroll-reveal-group" {...props}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        return (
          <ScrollReveal
            key={child.key ?? index}
            variant={variant}
            delayMs={baseDelayMs + index * staggerMs}
            durationMs={durationMs}
            once={once}
            threshold={threshold}
            rootMargin={rootMargin}
            triggerImmediate={triggerImmediate}
          >
            {child}
          </ScrollReveal>
        );
      })}
    </Component>
  );
}
