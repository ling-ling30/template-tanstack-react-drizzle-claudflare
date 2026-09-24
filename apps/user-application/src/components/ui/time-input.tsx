import * as React from "react";
import { Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseTimeString, formatTimeDisplay } from "@/lib/time";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface TimeValue {
  hours: number; // 0-23
  minutes: number; // 0-59
}

export interface TimeInputProps {
  id?: string;
  value?: string | null;
  onChange?: (time: string | null) => void;
  format?: "12h" | "24h";
  minuteStep?: 1 | 5 | 10 | 15 | 30;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showPresets?: boolean;
}

export interface TimePickerProps {
  hours: number;
  minutes: number;
  onChange: (hours: number, minutes: number) => void;
  format?: "12h" | "24h";
  minuteStep?: number;
  className?: string;
}

const TIME_PRESETS_12H = [
  { label: "09:00 AM", hours: 9, minutes: 0 },
  { label: "10:30 AM", hours: 10, minutes: 30 },
  { label: "12:00 PM", hours: 12, minutes: 0 },
  { label: "02:00 PM", hours: 14, minutes: 0 },
  { label: "04:30 PM", hours: 16, minutes: 30 },
  { label: "07:00 PM", hours: 19, minutes: 0 },
];

/**
 * Interactive TimePicker panel supporting 12h/24h with hour/minute selector columns
 */
export function TimePicker({
  hours,
  minutes,
  onChange,
  format = "12h",
  minuteStep = 5,
  className,
}: TimePickerProps) {
  const is12h = format === "12h";
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = is12h ? (hours % 12 === 0 ? 12 : hours % 12) : hours;

  const hoursList = React.useMemo(() => {
    if (is12h) {
      return Array.from({ length: 12 }, (_, i) => i + 1);
    }
    return Array.from({ length: 24 }, (_, i) => i);
  }, [is12h]);

  const minutesList = React.useMemo(() => {
    const list: number[] = [];
    for (let i = 0; i < 60; i += minuteStep) {
      list.push(i);
    }
    return list;
  }, [minuteStep]);

  const handleHourSelect = (h: number) => {
    if (!is12h) {
      onChange(h, minutes);
      return;
    }
    const newH = period === "AM" ? (h === 12 ? 0 : h) : h === 12 ? 12 : h + 12;
    onChange(newH, minutes);
  };

  const handleMinuteSelect = (m: number) => {
    onChange(hours, m);
  };

  const handlePeriodToggle = (newPeriod: "AM" | "PM") => {
    if (!is12h || newPeriod === period) return;
    if (newPeriod === "AM" && hours >= 12) {
      onChange(hours - 12, minutes);
    } else if (newPeriod === "PM" && hours < 12) {
      onChange(hours + 12, minutes);
    }
  };

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className={cn("flex items-stretch gap-1.5 select-none", className)}>
      {/* Hours Column */}
      <div className="flex flex-col">
        <span className="text-muted-foreground pb-1 text-center font-mono text-[10px] font-semibold tracking-wider uppercase">
          Hour
        </span>
        <div className="border-border/60 bg-muted/10 h-44 w-12 overflow-y-auto rounded-md border p-1">
          <div className="flex flex-col gap-0.5">
            {hoursList.map((h) => {
              const active = h === displayHour;
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => handleHourSelect(h)}
                  className={cn(
                    "asana-press flex h-7.5 w-full items-center justify-center rounded-md font-mono text-xs transition-colors outline-none",
                    active
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-foreground hover:bg-secondary"
                  )}
                >
                  {pad(h)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Minutes Column */}
      <div className="flex flex-col">
        <span className="text-muted-foreground pb-1 text-center font-mono text-[10px] font-semibold tracking-wider uppercase">
          Min
        </span>
        <div className="border-border/60 bg-muted/10 h-44 w-12 overflow-y-auto rounded-md border p-1">
          <div className="flex flex-col gap-0.5">
            {minutesList.map((m) => {
              const active = m === minutes;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMinuteSelect(m)}
                  className={cn(
                    "asana-press flex h-7.5 w-full items-center justify-center rounded-md font-mono text-xs transition-colors outline-none",
                    active
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-foreground hover:bg-secondary"
                  )}
                >
                  {pad(m)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* AM / PM Toggle (12h mode) */}
      {is12h && (
        <div className="flex flex-col">
          <span className="text-muted-foreground pb-1 text-center font-mono text-[10px] font-semibold tracking-wider uppercase">
            Period
          </span>
          <div className="border-border/60 bg-muted/10 flex h-44 w-12 flex-col gap-1 rounded-md border p-1">
            <button
              type="button"
              onClick={() => handlePeriodToggle("AM")}
              className={cn(
                "asana-press flex h-8 w-full items-center justify-center rounded-md font-mono text-xs font-semibold transition-colors outline-none",
                period === "AM"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => handlePeriodToggle("PM")}
              className={cn(
                "asana-press flex h-8 w-full items-center justify-center rounded-md font-mono text-xs font-semibold transition-colors outline-none",
                period === "PM"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              PM
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Standard TimeInput component with popover picker and presets
 */
export function TimeInput({
  id,
  value,
  onChange,
  format = "12h",
  minuteStep = 5,
  placeholder = "Select time...",
  disabled = false,
  className,
  showPresets = true,
}: TimeInputProps) {
  const [open, setOpen] = React.useState(false);

  const parsed = React.useMemo(() => {
    return parseTimeString(value) || { hours: 12, minutes: 0 };
  }, [value]);

  const hasValue = Boolean(value);
  const displayString = React.useMemo(() => {
    if (!value) return "";
    const p = parseTimeString(value);
    if (!p) return value;
    return formatTimeDisplay(p.hours, p.minutes, format);
  }, [value, format]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
  };

  const handleTimePickerChange = (h: number, m: number) => {
    const formatted = formatTimeDisplay(h, m, format);
    onChange?.(formatted);
  };

  const applyPreset = (h: number, m: number) => {
    const formatted = formatTimeDisplay(h, m, format);
    onChange?.(formatted);
    setOpen(false);
  };

  const setNow = () => {
    const now = new Date();
    const h = now.getHours();
    const roundedM = Math.round(now.getMinutes() / minuteStep) * minuteStep;
    const finalM = roundedM >= 60 ? 55 : roundedM;
    const formatted = formatTimeDisplay(h, finalM, format);
    onChange?.(formatted);
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
            !displayString && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <Clock className="text-muted-foreground size-4 shrink-0" />
            <span className="truncate">{displayString || placeholder}</span>
          </div>

          {hasValue && !disabled && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear time"
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
          {/* Quick Presets Sidebar */}
          {showPresets && (
            <div className="border-border bg-secondary/30 flex shrink-0 flex-col gap-1 border-b p-2.5 sm:w-32 sm:border-r sm:border-b-0">
              <div className="text-muted-foreground px-2 py-1 text-[11px] font-semibold tracking-wider uppercase">
                Presets
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hover:bg-secondary h-8 justify-start px-2 text-xs font-medium"
                onClick={setNow}
              >
                Now
              </Button>
              {TIME_PRESETS_12H.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="hover:bg-secondary h-8 justify-start px-2 font-mono text-xs font-medium"
                  onClick={() => applyPreset(preset.hours, preset.minutes)}
                >
                  {preset.label}
                </Button>
              ))}

              {hasValue && (
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
                  Clear Time
                </Button>
              )}
            </div>
          )}

          {/* Interactive Picker Section */}
          <div className="p-3">
            <div className="border-border/60 flex items-center justify-between border-b pb-2.5">
              <div className="text-foreground text-xs font-semibold">
                Set Time
              </div>
              <div className="bg-primary/10 text-primary rounded-md px-2 py-0.5 font-mono text-xs font-semibold">
                {displayString ||
                  formatTimeDisplay(parsed.hours, parsed.minutes, format)}
              </div>
            </div>

            <div className="pt-2.5">
              <TimePicker
                hours={parsed.hours}
                minutes={parsed.minutes}
                onChange={handleTimePickerChange}
                format={format}
                minuteStep={minuteStep}
              />
            </div>

            <div className="border-border/60 mt-3 flex justify-end border-t pt-2">
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
