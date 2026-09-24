import * as React from "react";
import { CalendarClock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/time-input";
import { formatTimeDisplay } from "@/lib/time";

export interface DateTimeInputProps {
  id?: string;
  value?: Date | string | null;
  onChange?: (date: Date | null) => void;
  format?: "12h" | "24h";
  minuteStep?: 1 | 5 | 10 | 15 | 30;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  showPresets?: boolean;
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

const COMMON_TIME_PRESETS = [
  { label: "09:00 AM", hours: 9, minutes: 0 },
  { label: "12:00 PM", hours: 12, minutes: 0 },
  { label: "02:30 PM", hours: 14, minutes: 30 },
  { label: "05:00 PM", hours: 17, minutes: 0 },
  { label: "07:00 PM", hours: 19, minutes: 0 },
];

export function DateTimeInput({
  id,
  value,
  onChange,
  format = "12h",
  minuteStep = 5,
  placeholder = "Select date and time...",
  disabled = false,
  className,
  minDate,
  maxDate,
  showPresets = true,
}: DateTimeInputProps) {
  const [open, setOpen] = React.useState(false);

  const currentDate = React.useMemo(() => {
    if (!value) return null;
    const d = typeof value === "string" ? new Date(value) : value;
    return isNaN(d.getTime()) ? null : d;
  }, [value]);

  const displayString = formatDateTimeDisplay(currentDate, format);

  const currentHours = currentDate ? currentDate.getHours() : 12;
  const currentMinutes = currentDate ? currentDate.getMinutes() : 0;

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

  const handleTimeChange = (h: number, m: number) => {
    const base = currentDate ? new Date(currentDate) : new Date();
    base.setHours(h, m, 0, 0);
    onChange?.(base);
  };

  const applyTimePreset = (h: number, m: number) => {
    const base = currentDate ? new Date(currentDate) : new Date();
    base.setHours(h, m, 0, 0);
    onChange?.(base);
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
            !displayString && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <CalendarClock className="text-muted-foreground size-4 shrink-0" />
            <span className="truncate">{displayString || placeholder}</span>
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
          <div className="border-border/60 bg-secondary/15 flex flex-col justify-between border-t p-3 sm:w-56 sm:border-t-0 sm:border-l">
            <div>
              <div className="border-border/60 flex items-center justify-between border-b pb-2.5">
                <span className="text-foreground text-xs font-semibold">
                  Time
                </span>
                <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 font-mono text-xs font-semibold">
                  {formatTimeDisplay(currentHours, currentMinutes, format)}
                </span>
              </div>

              {/* Time Presets Chips */}
              {showPresets && (
                <div className="flex flex-wrap gap-1 pt-2 pb-2">
                  {COMMON_TIME_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyTimePreset(p.hours, p.minutes)}
                      className={cn(
                        "asana-press rounded-md px-2 py-1 font-mono text-[11px] transition-colors outline-none",
                        currentHours === p.hours && currentMinutes === p.minutes
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "bg-background border-border/70 text-muted-foreground hover:bg-secondary hover:text-foreground border"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Interactive Time Selector */}
              <div className="pt-1">
                <TimePicker
                  hours={currentHours}
                  minutes={currentMinutes}
                  onChange={handleTimeChange}
                  format={format}
                  minuteStep={minuteStep}
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="border-border/60 mt-3 flex items-center justify-between border-t pt-2.5">
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
                className="h-8 rounded-md px-3 text-xs"
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
