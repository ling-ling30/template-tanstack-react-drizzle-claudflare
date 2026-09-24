import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import {
  formatBytes,
  formatCompactNumber,
  formatCurrency,
  formatDate,
  formatDateRange,
  formatDateTime,
  formatDuration,
  formatNumber,
  formatPercent,
  formatRelativeTime,
  formatTime,
  parseDate,
  type FormatBytesOptions,
  type FormatCompactNumberOptions,
  type FormatCurrencyOptions,
  type FormatDateOptions,
  type FormatDateRangeOptions,
  type FormatDateTimeOptions,
  type FormatDurationOptions,
  type FormatNumberOptions,
  type FormatPercentOptions,
  type FormatRelativeTimeOptions,
  type FormatTimeOptions,
} from "@/lib/format";

// ---------------------------------------------------------------------------
// Base Component Props & Shared Renderer
// ---------------------------------------------------------------------------

export interface BaseFormattedProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> {
  as?: React.ElementType;
  asChild?: boolean;
  tabular?: boolean; // Defaults to true
  children?: React.ReactNode;
}

interface InternalRenderProps extends BaseFormattedProps {
  defaultTag: React.ElementType;
  formattedText: string;
  dataSlot: string;
  forwardedRef: React.ForwardedRef<HTMLElement>;
  [key: string]: unknown;
}

function renderFormattedNode({
  asChild,
  as: Component,
  defaultTag,
  children,
  formattedText,
  className,
  tabular = true,
  dataSlot,
  forwardedRef,
  ...props
}: InternalRenderProps) {
  const mergedClass = cn(tabular && "tabular-nums", className);

  if (asChild) {
    return (
      <Slot
        ref={forwardedRef as React.Ref<never>}
        data-slot={dataSlot}
        className={mergedClass}
        {...props}
      >
        {React.isValidElement(children)
          ? React.cloneElement(
              children as React.ReactElement<Record<string, unknown>>,
              undefined,
              (children.props as { children?: React.ReactNode }).children ??
                formattedText
            )
          : (children ?? formattedText)}
      </Slot>
    );
  }

  const Tag = Component || defaultTag;
  return (
    <Tag
      ref={forwardedRef as React.Ref<never>}
      data-slot={dataSlot}
      className={mergedClass}
      {...props}
    >
      {children ?? formattedText}
    </Tag>
  );
}

// ---------------------------------------------------------------------------
// FormattedDate
// ---------------------------------------------------------------------------

export interface FormattedDateProps
  extends BaseFormattedProps, Omit<FormatDateOptions, "fallback" | "locale"> {
  value: Date | string | number | null | undefined;
  locale?: string;
  fallback?: string;
}

export const FormattedDate = React.forwardRef<HTMLElement, FormattedDateProps>(
  (
    {
      value,
      preset,
      locale,
      fallback,
      as,
      asChild,
      tabular,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const date = parseDate(value);
    const formatted = formatDate(value, { preset, locale, fallback });

    return renderFormattedNode({
      forwardedRef: ref,
      as,
      asChild,
      tabular,
      className,
      children,
      defaultTag: "time",
      formattedText: formatted,
      dataSlot: "formatted-date",
      dateTime: date?.toISOString(),
      ...props,
    });
  }
);
FormattedDate.displayName = "FormattedDate";

// ---------------------------------------------------------------------------
// FormattedTime
// ---------------------------------------------------------------------------

export interface FormattedTimeProps
  extends BaseFormattedProps, Omit<FormatTimeOptions, "fallback" | "locale"> {
  value: Date | string | number | null | undefined;
  locale?: string;
  fallback?: string;
}

export const FormattedTime = React.forwardRef<HTMLElement, FormattedTimeProps>(
  (
    {
      value,
      preset,
      locale,
      fallback,
      as,
      asChild,
      tabular,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const date = parseDate(value);
    const formatted = formatTime(value, { preset, locale, fallback });

    return renderFormattedNode({
      forwardedRef: ref,
      as,
      asChild,
      tabular,
      className,
      children,
      defaultTag: "time",
      formattedText: formatted,
      dataSlot: "formatted-time",
      dateTime: date?.toISOString(),
      ...props,
    });
  }
);
FormattedTime.displayName = "FormattedTime";

// ---------------------------------------------------------------------------
// FormattedDateTime
// ---------------------------------------------------------------------------

export interface FormattedDateTimeProps
  extends
    BaseFormattedProps,
    Omit<FormatDateTimeOptions, "fallback" | "locale"> {
  value: Date | string | number | null | undefined;
  locale?: string;
  fallback?: string;
}

export const FormattedDateTime = React.forwardRef<
  HTMLElement,
  FormattedDateTimeProps
>(
  (
    {
      value,
      datePreset,
      timePreset,
      locale,
      fallback,
      as,
      asChild,
      tabular,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const date = parseDate(value);
    const formatted = formatDateTime(value, {
      datePreset,
      timePreset,
      locale,
      fallback,
    });

    return renderFormattedNode({
      forwardedRef: ref,
      as,
      asChild,
      tabular,
      className,
      children,
      defaultTag: "time",
      formattedText: formatted,
      dataSlot: "formatted-date-time",
      dateTime: date?.toISOString(),
      ...props,
    });
  }
);
FormattedDateTime.displayName = "FormattedDateTime";

// ---------------------------------------------------------------------------
// FormattedDateRange
// ---------------------------------------------------------------------------

export interface FormattedDateRangeProps
  extends
    BaseFormattedProps,
    Omit<FormatDateRangeOptions, "fallback" | "locale"> {
  from: Date | string | number | null | undefined;
  to: Date | string | number | null | undefined;
  locale?: string;
  fallback?: string;
}

export const FormattedDateRange = React.forwardRef<
  HTMLElement,
  FormattedDateRangeProps
>(
  (
    {
      from,
      to,
      separator,
      locale,
      fallback,
      as,
      asChild,
      tabular,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const formatted = formatDateRange(from, to, {
      separator,
      locale,
      fallback,
    });

    return renderFormattedNode({
      forwardedRef: ref,
      as,
      asChild,
      tabular,
      className,
      children,
      defaultTag: "span",
      formattedText: formatted,
      dataSlot: "formatted-date-range",
      ...props,
    });
  }
);
FormattedDateRange.displayName = "FormattedDateRange";

// ---------------------------------------------------------------------------
// FormattedRelativeTime
// ---------------------------------------------------------------------------

export interface FormattedRelativeTimeProps
  extends
    BaseFormattedProps,
    Omit<FormatRelativeTimeOptions, "style" | "fallback" | "locale"> {
  value: Date | string | number | null | undefined;
  relativeStyle?: "long" | "short" | "narrow";
  showTitle?: boolean;
  locale?: string;
  fallback?: string;
}

export const FormattedRelativeTime = React.forwardRef<
  HTMLElement,
  FormattedRelativeTimeProps
>(
  (
    {
      value,
      numeric,
      relativeStyle,
      now,
      locale,
      fallback,
      showTitle = true,
      as,
      asChild,
      tabular,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const date = parseDate(value);
    const formatted = formatRelativeTime(value, {
      numeric,
      style: relativeStyle,
      now,
      locale,
      fallback,
    });

    return renderFormattedNode({
      forwardedRef: ref,
      as,
      asChild,
      tabular,
      className,
      children,
      defaultTag: "time",
      formattedText: formatted,
      dataSlot: "formatted-relative-time",
      dateTime: date?.toISOString(),
      title: showTitle && date ? date.toLocaleString(locale) : undefined,
      ...props,
    });
  }
);
FormattedRelativeTime.displayName = "FormattedRelativeTime";

// ---------------------------------------------------------------------------
// FormattedDuration
// ---------------------------------------------------------------------------

export interface FormattedDurationProps
  extends
    BaseFormattedProps,
    Omit<FormatDurationOptions, "style" | "fallback"> {
  value: number | null | undefined;
  unit?: "ms" | "s" | "m";
  durationStyle?: "short" | "long";
  fallback?: string;
}

export const FormattedDuration = React.forwardRef<
  HTMLElement,
  FormattedDurationProps
>(
  (
    {
      value,
      unit = "s",
      durationStyle,
      maxUnits,
      fallback,
      as,
      asChild,
      tabular,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const formatted = formatDuration(value, unit, {
      style: durationStyle,
      maxUnits,
      fallback,
    });

    return renderFormattedNode({
      forwardedRef: ref,
      as,
      asChild,
      tabular,
      className,
      children,
      defaultTag: "span",
      formattedText: formatted,
      dataSlot: "formatted-duration",
      ...props,
    });
  }
);
FormattedDuration.displayName = "FormattedDuration";

// ---------------------------------------------------------------------------
// FormattedNumber
// ---------------------------------------------------------------------------

export interface FormattedNumberProps
  extends
    BaseFormattedProps,
    Omit<FormatNumberOptions, "style" | "fallback" | "locale"> {
  value: number | string | null | undefined;
  numberStyle?: Intl.NumberFormatOptions["style"];
  locale?: string;
  fallback?: string;
}

export const FormattedNumber = React.forwardRef<
  HTMLElement,
  FormattedNumberProps
>(
  (
    {
      value,
      decimals,
      numberStyle,
      locale,
      fallback,
      as,
      asChild,
      tabular,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const formatted = formatNumber(value, {
      decimals,
      style: numberStyle,
      locale,
      fallback,
    });

    return renderFormattedNode({
      forwardedRef: ref,
      as,
      asChild,
      tabular,
      className,
      children,
      defaultTag: "span",
      formattedText: formatted,
      dataSlot: "formatted-number",
      ...props,
    });
  }
);
FormattedNumber.displayName = "FormattedNumber";

// ---------------------------------------------------------------------------
// FormattedCompactNumber
// ---------------------------------------------------------------------------

export interface FormattedCompactNumberProps
  extends
    BaseFormattedProps,
    Omit<FormatCompactNumberOptions, "style" | "fallback" | "locale"> {
  value: number | string | null | undefined;
  locale?: string;
  fallback?: string;
}

export const FormattedCompactNumber = React.forwardRef<
  HTMLElement,
  FormattedCompactNumberProps
>(
  (
    {
      value,
      decimals,
      locale,
      fallback,
      as,
      asChild,
      tabular,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const formatted = formatCompactNumber(value, {
      decimals,
      locale,
      fallback,
    });

    return renderFormattedNode({
      forwardedRef: ref,
      as,
      asChild,
      tabular,
      className,
      children,
      defaultTag: "span",
      formattedText: formatted,
      dataSlot: "formatted-compact-number",
      ...props,
    });
  }
);
FormattedCompactNumber.displayName = "FormattedCompactNumber";

// ---------------------------------------------------------------------------
// FormattedCurrency
// ---------------------------------------------------------------------------

export interface FormattedCurrencyProps
  extends
    BaseFormattedProps,
    Omit<FormatCurrencyOptions, "style" | "fallback" | "locale"> {
  value: number | string | null | undefined;
  locale?: string;
  fallback?: string;
}

export const FormattedCurrency = React.forwardRef<
  HTMLElement,
  FormattedCurrencyProps
>(
  (
    {
      value,
      currency,
      decimals,
      locale,
      fallback,
      as,
      asChild,
      tabular,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const formatted = formatCurrency(value, {
      currency,
      decimals,
      locale,
      fallback,
    });

    return renderFormattedNode({
      forwardedRef: ref,
      as,
      asChild,
      tabular,
      className,
      children,
      defaultTag: "span",
      formattedText: formatted,
      dataSlot: "formatted-currency",
      ...props,
    });
  }
);
FormattedCurrency.displayName = "FormattedCurrency";

// ---------------------------------------------------------------------------
// FormattedPercent
// ---------------------------------------------------------------------------

export interface FormattedPercentProps
  extends
    BaseFormattedProps,
    Omit<FormatPercentOptions, "style" | "fallback" | "locale"> {
  value: number | string | null | undefined;
  locale?: string;
  fallback?: string;
}

export const FormattedPercent = React.forwardRef<
  HTMLElement,
  FormattedPercentProps
>(
  (
    {
      value,
      decimals,
      isFractional,
      showSign,
      locale,
      fallback,
      as,
      asChild,
      tabular,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const formatted = formatPercent(value, {
      decimals,
      isFractional,
      showSign,
      locale,
      fallback,
    });

    return renderFormattedNode({
      forwardedRef: ref,
      as,
      asChild,
      tabular,
      className,
      children,
      defaultTag: "span",
      formattedText: formatted,
      dataSlot: "formatted-percent",
      ...props,
    });
  }
);
FormattedPercent.displayName = "FormattedPercent";

// ---------------------------------------------------------------------------
// FormattedBytes
// ---------------------------------------------------------------------------

export interface FormattedBytesProps
  extends BaseFormattedProps, Omit<FormatBytesOptions, "fallback"> {
  value: number | string | null | undefined;
  fallback?: string;
}

export const FormattedBytes = React.forwardRef<
  HTMLElement,
  FormattedBytesProps
>(
  (
    {
      value,
      decimals,
      standard,
      binaryUnits,
      fallback,
      as,
      asChild,
      tabular,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const formatted = formatBytes(value, {
      decimals,
      standard,
      binaryUnits,
      fallback,
    });

    return renderFormattedNode({
      forwardedRef: ref,
      as,
      asChild,
      tabular,
      className,
      children,
      defaultTag: "span",
      formattedText: formatted,
      dataSlot: "formatted-bytes",
      ...props,
    });
  }
);
FormattedBytes.displayName = "FormattedBytes";

// ---------------------------------------------------------------------------
// Compound Format Namespace API
// ---------------------------------------------------------------------------

export const Format = {
  Date: FormattedDate,
  Time: FormattedTime,
  DateTime: FormattedDateTime,
  DateRange: FormattedDateRange,
  RelativeTime: FormattedRelativeTime,
  Duration: FormattedDuration,
  Number: FormattedNumber,
  CompactNumber: FormattedCompactNumber,
  Currency: FormattedCurrency,
  Percent: FormattedPercent,
  Bytes: FormattedBytes,
};
