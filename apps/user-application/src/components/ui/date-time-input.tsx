import * as React from "react";
import { CalendarClock, Check, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  parseTimeString,
  formatTimeDisplay,
  generateTimeSlots,
  type TimeSlot,
} from "@/lib/time";

export interface DateTimeInputProps {
  id?: string;
  value?: Date | string | null;
  onChange?: (date: Date | null) => void;
  format?: "12h" | "24h";
  onFormatChange?: (format: "12h" | "24h") => void;
  allowFormatToggle?: boolean;
  stepMinutes?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

function formatDateTimeDisplay(
  d?: Date | string | null,
  timeFormat: "12h" | "24h" = "12h"
): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "";

  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

  const timePart = formatTimeDisplay(
    date.getHours(),
    date.getMinutes(),
    timeFormat
  );

  return `${datePart} · ${timePart}`;
}

/**
 * Modern DateTimeInput combining Asana Calendar with direct typing and single-click time slots.
 * Supports both 12-hour (AM/PM) and 24-hour time formatting with an interactive switch.
 */
export function DateTimeInput({
  id,
  value,
  onChange,
  format: controlledFormat = "12h",
  onFormatChange,
  allowFormatToggle = true,
  stepMinutes = 30,
  placeholder,
  disabled = false,
  className,
  minDate,
  maxDate,
}: DateTimeInputProps) {
  const [open, setOpen] = React.useState(false);
  const [activeFormat, setActiveFormat] = React.useState<"12h" | "24h">(
    controlledFormat
  );

  // Sync format state if prop changes
  const [prevControlledFormat, setPrevControlledFormat] =
    React.useState(controlledFormat);
  if (controlledFormat !== prevControlledFormat) {
    setPrevControlledFormat(controlledFormat);
    setActiveFormat(controlledFormat);
  }

  const currentDate = React.useMemo(() => {
    if (!value) return null;
    const d = typeof value === "string" ? new Date(value) : value;
    return isNaN(d.getTime()) ? null : d;
  }, [value]);

  const displayString = formatDateTimeDisplay(currentDate, activeFormat);

  const currentHours = currentDate ? currentDate.getHours() : 12;
  const currentMinutes = currentDate ? currentDate.getMinutes() : 0;
  const timeFormatted = formatTimeDisplay(
    currentHours,
    currentMinutes,
    activeFormat
  );

  const [timeTypedText, setTimeTypedText] = React.useState(timeFormatted);

  const [prevTimeFormatted, setPrevTimeFormatted] =
    React.useState(timeFormatted);
  if (timeFormatted !== prevTimeFormatted) {
    setPrevTimeFormatted(timeFormatted);
    setTimeTypedText(timeFormatted);
  }

  const slots = React.useMemo(() => {
    return generateTimeSlots(stepMinutes, activeFormat);
  }, [stepMinutes, activeFormat]);

  // Ref to active slot item to auto-scroll when dropdown opens
  const activeSlotRef = React.useRef<HTMLButtonElement | null>(null);
  const listContainerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (open && activeSlotRef.current && listContainerRef.current) {
      const container = listContainerRef.current;
      const element = activeSlotRef.current;
      const topOffset =
        element.offsetTop -
        container.clientHeight / 2 +
        element.clientHeight / 2;
      container.scrollTo({ top: Math.max(0, topOffset), behavior: "instant" });
    }
  }, [open]);

  const handleToggleFormat = (newFmt: "12h" | "24h") => {
    if (newFmt === activeFormat) return;
    setActiveFormat(newFmt);
    onFormatChange?.(newFmt);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
  };

  const handleCalendarSelect = (d: Date | null) => {
    if (!d) {
      onChange?.(null);
      return;
    }
    const newDate = new Date(d);
    newDate.setHours(currentHours, currentMinutes, 0, 0);
    onChange?.(newDate);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    const base = currentDate ? new Date(currentDate) : new Date();
    base.setHours(slot.hours, slot.minutes, 0, 0);
    onChange?.(base);
  };

  const commitTimeInput = (val: string) => {
    const parsed = parseTimeString(val, activeFormat);
    if (parsed) {
      const base = currentDate ? new Date(currentDate) : new Date();
      base.setHours(parsed.hours, parsed.minutes, 0, 0);
      onChange?.(base);
    } else {
      setTimeTypedText(timeFormatted);
    }
  };

  const isCurrentSlot = (slot: TimeSlot) => {
    if (!currentDate) return false;
    return slot.hours === currentHours && slot.minutes === currentMinutes;
  };

  const defaultPlaceholder =
    activeFormat === "12h"
      ? "Select date and time (AM/PM)..."
      : "Select date and time (24h)...";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            "border-input bg-background hover:bg-secondary/40 focus-visible:border-primary focus-visible:ring-ring/25 flex h-9.5 w-full items-center justify-between rounded-md border px-3 py-2 text-sm shadow-xs transition-colors duration-120 outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
            !displayString && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <CalendarClock className="text-muted-foreground size-4 shrink-0" />
            <span className="truncate">
              {displayString || placeholder || defaultPlaceholder}
            </span>
          </div>

          {currentDate && !disabled && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear date and time"
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
          {/* Calendar Left Pane */}
          <div className="p-3">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={(d) => {
                if (d instanceof Date || d === null) {
                  handleCalendarSelect(d);
                }
              }}
              minDate={minDate}
              maxDate={maxDate}
            />
          </div>

          {/* Time Picker Right Pane */}
          <div className="border-border/60 bg-secondary/15 flex flex-col justify-between border-t p-3 sm:w-52 sm:border-t-0 sm:border-l">
            <div>
              {/* Header with 12h / 24h Toggle */}
              <div className="border-border/60 mb-2 flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground font-mono text-[10px] font-semibold tracking-wider uppercase">
                  {activeFormat === "12h" ? "AM / PM" : "24-Hour"}
                </span>

                {allowFormatToggle && (
                  <div className="border-border bg-secondary/40 flex items-center rounded-md border p-0.5">
                    <button
                      type="button"
                      onClick={() => handleToggleFormat("12h")}
                      className={cn(
                        "asana-press rounded px-1.5 py-0.5 font-mono text-[10px] font-medium transition-colors outline-none",
                        activeFormat === "12h"
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      12h
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleFormat("24h")}
                      className={cn(
                        "asana-press rounded px-1.5 py-0.5 font-mono text-[10px] font-medium transition-colors outline-none",
                        activeFormat === "24h"
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      24h
                    </button>
                  </div>
                )}
              </div>

              {/* Direct Typing Input */}
              <div className="mb-2">
                <div className="border-input bg-background focus-within:border-primary focus-within:ring-primary/25 flex h-8 items-center rounded-md border px-2 focus-within:ring-1">
                  <Clock className="text-muted-foreground mr-1.5 size-3.5 shrink-0" />
                  <input
                    type="text"
                    value={timeTypedText}
                    onChange={(e) => setTimeTypedText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        commitTimeInput(timeTypedText);
                      }
                    }}
                    onBlur={() => commitTimeInput(timeTypedText)}
                    placeholder={
                      activeFormat === "12h" ? "e.g. 02:30 PM" : "e.g. 14:30"
                    }
                    className="text-foreground placeholder:text-muted-foreground w-full bg-transparent font-mono text-xs outline-none"
                  />
                </div>
              </div>

              {/* Scrollable Slots List */}
              <div
                ref={listContainerRef}
                className="h-48 space-y-0.5 overflow-y-auto pr-1"
              >
                {slots.map((slot) => {
                  const active = isCurrentSlot(slot);
                  return (
                    <button
                      key={slot.label}
                      ref={active ? activeSlotRef : null}
                      type="button"
                      onClick={() => handleSlotSelect(slot)}
                      className={cn(
                        "asana-press flex h-7.5 w-full items-center justify-between rounded-md px-2 font-mono text-xs transition-colors outline-none",
                        active
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-foreground hover:bg-secondary"
                      )}
                    >
                      <span>{slot.label}</span>
                      {active && <Check className="size-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="border-border/60 mt-2.5 flex items-center justify-between border-t pt-2">
              {currentDate ? (
                <button
                  type="button"
                  onClick={() => {
                    onChange?.(null);
                    setOpen(false);
                  }}
                  className="text-muted-foreground hover:text-destructive text-xs transition-colors"
                >
                  Clear
                </button>
              ) : (
                <div />
              )}

              <Button
                type="button"
                size="sm"
                className="h-7.5 rounded-md px-3 text-xs"
                onClick={() => setOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
