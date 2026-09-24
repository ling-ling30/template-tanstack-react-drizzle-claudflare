import * as React from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar, type DateRange } from "@/components/ui/calendar";

export interface SingleDateInputProps {
  id?: string;
  mode?: "single";
  value?: Date | string | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  showPresets?: boolean;
}

export interface DateRangeInputProps {
  id?: string;
  mode: "range";
  value?: DateRange | null;
  onChange?: (range: DateRange | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  showPresets?: boolean;
}

export type DateInputProps = SingleDateInputProps | DateRangeInputProps;

function formatDateDisplay(d?: Date | string | null): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function calculateDays(from?: Date | null, to?: Date | null): number {
  if (!from || !to) return 0;
  const d1 = new Date(
    from.getFullYear(),
    from.getMonth(),
    from.getDate()
  ).getTime();
  const d2 = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  const diffTime = Math.abs(d2 - d1);
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

function SingleDateInputInternal({
  id,
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
  minDate,
  maxDate,
  showPresets = true,
}: Omit<SingleDateInputProps, "mode">) {
  const [open, setOpen] = React.useState(false);

  const selectedDate = React.useMemo(() => {
    if (!value) return null;
    return typeof value === "string" ? new Date(value) : value;
  }, [value]);

  const formatted = formatDateDisplay(selectedDate);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
  };

  const setPreset = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(0, 0, 0, 0);
    onChange?.(d);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            "border-input bg-background hover:bg-secondary/40 focus-visible:border-primary focus-visible:ring-ring/25 flex h-9.5 w-full items-center justify-between rounded-md border px-3 py-2 text-sm shadow-xs transition-colors duration-120 outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
            !formatted && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <CalendarIcon className="text-muted-foreground size-4 shrink-0" />
            <span className="truncate">
              {formatted || placeholder || "Select date"}
            </span>
          </div>

          {formatted && !disabled && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear date"
              onClick={handleClear}
              className="hover:bg-secondary text-muted-foreground hover:text-foreground flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm"
            >
              <X className="size-3" />
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="border-border w-auto p-0 shadow-lg"
      >
        <div className="flex flex-col sm:flex-row">
          {showPresets && (
            <div className="border-border bg-secondary/30 flex shrink-0 flex-col gap-1 border-b p-2.5 sm:w-36 sm:border-r sm:border-b-0">
              <div className="text-muted-foreground px-2 py-1 text-[11px] font-semibold tracking-wider uppercase">
                Presets
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hover:bg-secondary h-8 justify-start px-2 text-xs font-medium"
                onClick={() => setPreset(0)}
              >
                Today
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hover:bg-secondary h-8 justify-start px-2 text-xs font-medium"
                onClick={() => setPreset(1)}
              >
                Tomorrow
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hover:bg-secondary h-8 justify-start px-2 text-xs font-medium"
                onClick={() => setPreset(7)}
              >
                In 1 Week
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hover:bg-secondary h-8 justify-start px-2 text-xs font-medium"
                onClick={() => setPreset(14)}
              >
                In 2 Weeks
              </Button>

              {selectedDate && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="hover:text-destructive text-muted-foreground border-border/60 mt-auto h-7 justify-start border-t px-2 pt-2 text-xs font-medium"
                  onClick={() => {
                    onChange?.(null);
                    setOpen(false);
                  }}
                >
                  Clear Date
                </Button>
              )}
            </div>
          )}

          <div className="p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d: Date | DateRange | null) => {
                if (d instanceof Date || d === null) {
                  onChange?.(d);
                  setOpen(false);
                }
              }}
              minDate={minDate}
              maxDate={maxDate}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function DateRangeInputInternal({
  id,
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
  minDate,
  maxDate,
  showPresets = true,
}: Omit<DateRangeInputProps, "mode">) {
  const [open, setOpen] = React.useState(false);

  const range = value || {};
  const fromDate = range.from
    ? typeof range.from === "string"
      ? new Date(range.from)
      : range.from
    : null;
  const toDate = range.to
    ? typeof range.to === "string"
      ? new Date(range.to)
      : range.to
    : null;

  const formattedFrom = formatDateDisplay(fromDate);
  const formattedTo = formatDateDisplay(toDate);

  const rangeText = React.useMemo(() => {
    if (formattedFrom && formattedTo) {
      return `${formattedFrom} – ${formattedTo}`;
    }
    if (formattedFrom) {
      return `${formattedFrom} – …`;
    }
    return "";
  }, [formattedFrom, formattedTo]);

  const daysCount = calculateDays(fromDate, toDate);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
  };

  const applyRangePreset = (days: number) => {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date();
    to.setDate(to.getDate() + (days - 1));
    to.setHours(0, 0, 0, 0);
    onChange?.({ from, to });
    setOpen(false);
  };

  const applyMonthPreset = () => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    onChange?.({ from, to });
    setOpen(false);
  };

  const applyNextMonthPreset = () => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    onChange?.({ from, to });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            "border-input bg-background hover:bg-secondary/40 focus-visible:border-primary focus-visible:ring-ring/25 flex h-9.5 w-full items-center justify-between rounded-md border px-3 py-2 text-sm shadow-xs transition-colors duration-120 outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
            !rangeText && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <CalendarIcon className="text-muted-foreground size-4 shrink-0" />
            <span className="truncate">
              {rangeText || placeholder || "Select date range"}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {daysCount > 0 && (
              <Badge variant="secondary">
                {daysCount} {daysCount === 1 ? "day" : "days"}
              </Badge>
            )}

            {rangeText && !disabled && (
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear date range"
                onClick={handleClear}
                className="hover:bg-secondary text-muted-foreground hover:text-foreground flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm"
              >
                <X className="size-3" />
              </span>
            )}
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="border-border w-auto p-0 shadow-lg"
      >
        <div className="flex flex-col sm:flex-row">
          {showPresets && (
            <div className="border-border bg-secondary/30 flex shrink-0 flex-col gap-1 border-b p-2.5 sm:w-36 sm:border-r sm:border-b-0">
              <div className="text-muted-foreground px-2 py-1 text-[11px] font-semibold tracking-wider uppercase">
                Range Presets
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hover:bg-secondary h-8 justify-start px-2 text-xs font-medium"
                onClick={() => applyRangePreset(7)}
              >
                Next 7 Days
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hover:bg-secondary h-8 justify-start px-2 text-xs font-medium"
                onClick={() => applyRangePreset(14)}
              >
                Next 14 Days
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hover:bg-secondary h-8 justify-start px-2 text-xs font-medium"
                onClick={() => applyRangePreset(30)}
              >
                Next 30 Days
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hover:bg-secondary h-8 justify-start px-2 text-xs font-medium"
                onClick={applyMonthPreset}
              >
                This Month
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hover:bg-secondary h-8 justify-start px-2 text-xs font-medium"
                onClick={applyNextMonthPreset}
              >
                Next Month
              </Button>

              {(fromDate || toDate) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="hover:text-destructive text-muted-foreground border-border/60 mt-auto h-7 justify-start border-t px-2 pt-2 text-xs font-medium"
                  onClick={() => {
                    onChange?.(null);
                    setOpen(false);
                  }}
                >
                  Clear Range
                </Button>
              )}
            </div>
          )}

          <div className="p-3">
            <Calendar
              mode="range"
              selected={{ from: fromDate, to: toDate }}
              onSelect={(r: Date | DateRange | null) => {
                const rangeVal = r as DateRange;
                onChange?.(rangeVal);
                if (rangeVal?.from && rangeVal?.to) {
                  setOpen(false);
                }
              }}
              minDate={minDate}
              maxDate={maxDate}
            />

            {/* Range Selection Status Footer */}
            {rangeText && (
              <div className="border-border text-muted-foreground mt-3 flex items-center justify-between border-t pt-2 font-mono text-xs">
                <span>
                  {daysCount} {daysCount === 1 ? "day" : "days"}
                </span>
                <span className="text-foreground max-w-[170px] truncate font-medium">
                  {rangeText}
                </span>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function DateInput(props: DateInputProps) {
  if (props.mode === "range") {
    return <DateRangeInputInternal {...props} />;
  }
  return <SingleDateInputInternal {...props} />;
}

export {
  DateInput,
  SingleDateInputInternal as SingleDateInput,
  DateRangeInputInternal as DateRangeInput,
};
export type { DateRange } from "@/components/ui/calendar";
