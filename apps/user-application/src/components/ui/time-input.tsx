import * as React from "react";
import { Check, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  parseTimeString,
  formatTimeDisplay,
  generateTimeSlots,
  type TimeSlot,
} from "@/lib/time";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface TimeInputProps {
  id?: string;
  value?: string | null;
  onChange?: (time: string | null) => void;
  format?: "12h" | "24h";
  stepMinutes?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showPresets?: boolean;
}

const COMMON_QUICK_PRESETS = [
  { label: "Now", isNow: true },
  { label: "09:00 AM", hours: 9, minutes: 0 },
  { label: "01:00 PM", hours: 13, minutes: 0 },
  { label: "05:00 PM", hours: 17, minutes: 0 },
];

/**
 * Linear / Asana style TimeInput:
 * Supports direct typing (e.g. "3p", "330", "14:30", "now") and
 * single-click selection from an auto-scrolling slot dropdown.
 */
export function TimeInput({
  id,
  value,
  onChange,
  format = "12h",
  stepMinutes = 30,
  placeholder = "e.g. 2:30 PM",
  disabled = false,
  className,
  showPresets = true,
}: TimeInputProps) {
  const [open, setOpen] = React.useState(false);

  // Parse current value
  const parsedValue = React.useMemo(() => {
    return parseTimeString(value);
  }, [value]);

  const formattedDisplay = React.useMemo(() => {
    if (!parsedValue) return value || "";
    return formatTimeDisplay(parsedValue.hours, parsedValue.minutes, format);
  }, [parsedValue, value, format]);

  // Internal text state for direct typing
  const [text, setText] = React.useState(formattedDisplay);

  // Sync internal text when external value changes
  const [prevFormatted, setPrevFormatted] = React.useState(formattedDisplay);
  if (formattedDisplay !== prevFormatted) {
    setPrevFormatted(formattedDisplay);
    setText(formattedDisplay);
  }

  // Generate slots for dropdown
  const slots = React.useMemo(() => {
    return generateTimeSlots(stepMinutes, format);
  }, [stepMinutes, format]);

  // Ref to active slot item to auto-scroll when dropdown opens
  const activeSlotRef = React.useRef<HTMLButtonElement | null>(null);
  const listContainerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (open && activeSlotRef.current && listContainerRef.current) {
      // Scroll active item to middle of container
      const container = listContainerRef.current;
      const element = activeSlotRef.current;
      const topOffset =
        element.offsetTop -
        container.clientHeight / 2 +
        element.clientHeight / 2;
      container.scrollTo({ top: Math.max(0, topOffset), behavior: "instant" });
    }
  }, [open]);

  const commitText = (inputText: string) => {
    if (!inputText.trim()) {
      onChange?.(null);
      setText("");
      return;
    }
    const parsed = parseTimeString(inputText);
    if (parsed) {
      const formatted = formatTimeDisplay(parsed.hours, parsed.minutes, format);
      setText(formatted);
      onChange?.(formatted);
    } else {
      // Revert if invalid
      setText(formattedDisplay);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      commitText(text);
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      setOpen(true);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const handleBlur = () => {
    commitText(text);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    const formatted = formatTimeDisplay(slot.hours, slot.minutes, format);
    setText(formatted);
    onChange?.(formatted);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
    setText("");
  };

  const applyQuickPreset = (preset: {
    isNow?: boolean;
    hours?: number;
    minutes?: number;
  }) => {
    if (preset.isNow) {
      const now = new Date();
      const roundedMin = Math.round(now.getMinutes() / 5) * 5;
      const finalMin = roundedMin >= 60 ? 55 : roundedMin;
      const formatted = formatTimeDisplay(now.getHours(), finalMin, format);
      setText(formatted);
      onChange?.(formatted);
    } else if (preset.hours !== undefined && preset.minutes !== undefined) {
      const formatted = formatTimeDisplay(preset.hours, preset.minutes, format);
      setText(formatted);
      onChange?.(formatted);
    }
    setOpen(false);
  };

  const isCurrentSlot = (slot: TimeSlot) => {
    if (!parsedValue) return false;
    return (
      slot.hours === parsedValue.hours && slot.minutes === parsedValue.minutes
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "group border-input bg-background flex h-9.5 w-full items-center rounded-md border px-3 py-1.5 shadow-xs transition-colors duration-120",
            "focus-within:border-primary focus-within:ring-ring/25 focus-within:ring-2",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
        >
          <Clock className="text-muted-foreground mr-2 size-4 shrink-0" />
          <input
            id={id}
            type="text"
            value={text}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onClick={() => setOpen(true)}
            className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-sm font-medium outline-none disabled:cursor-not-allowed"
          />

          {Boolean(value || text) && !disabled && (
            <button
              type="button"
              aria-label="Clear time"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary flex size-5 shrink-0 items-center justify-center rounded-sm"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="border-border w-56 p-1.5 shadow-md"
      >
        {/* Quick Presets Pills */}
        {showPresets && (
          <div className="border-border/60 mb-1 flex items-center justify-between gap-1 border-b px-1 pb-1.5">
            {COMMON_QUICK_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyQuickPreset(p)}
                className="asana-press hover:bg-secondary text-muted-foreground hover:text-foreground rounded-md px-1.5 py-0.5 font-mono text-[11px] font-medium transition-colors outline-none"
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable Single-Click Slot List */}
        <div
          ref={listContainerRef}
          className="h-56 space-y-0.5 overflow-y-auto pr-1"
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
                  "asana-press flex h-8 w-full items-center justify-between rounded-md px-2.5 font-mono text-xs transition-colors outline-none",
                  active
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-foreground hover:bg-secondary"
                )}
              >
                <span>{slot.label}</span>
                {active && <Check className="size-3.5" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
